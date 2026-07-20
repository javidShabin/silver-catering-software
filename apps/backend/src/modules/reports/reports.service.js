import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import { Prisma } from "@prisma/client";
import { LRUCache } from 'lru-cache';

export const reportCache = new LRUCache({
  max: 500, // Maximum items in cache
  ttl: 1000 * 60 * 5 // 5 minutes default
});

const pendingReports = new Map();

/**
 * Generates a high-level dashboard summary
 */
export const getDashboardSummaryService = async (startDate, endDate) => {
  const cacheKey = `dashboard_summary:${startDate || 'all'}:${endDate || 'all'}`;

  if (pendingReports.has(cacheKey)) {
    return await pendingReports.get(cacheKey);
  }

  const generateReport = async () => {
    try {
    const cached = reportCache.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Rehydrate Prisma.Decimal for controller math operations
      return {
        ...parsed,
        totalRevenue: new Prisma.Decimal(parsed.totalRevenue),
        collected: new Prisma.Decimal(parsed.collected),
        totalExpenses: new Prisma.Decimal(parsed.totalExpenses),
        totalPurchases: new Prisma.Decimal(parsed.totalPurchases),
        totalOperationalExpenses: new Prisma.Decimal(parsed.totalOperationalExpenses),
        profit: new Prisma.Decimal(parsed.profit)};
    }
  } catch (err) {
    console.warn('[Cache] Cache read failed for dashboard summary:', err.message);
  }

  const invoiceDateFilter = { };
  const purchaseDateFilter = { };
  const eventDateFilter = {  deletedAt: null };
  const customerDateFilter = { };
  const expenseDateFilter = { };

  if (startDate && endDate) {
    const gte = new Date(startDate);
    const lte = new Date(endDate);

    invoiceDateFilter.createdAt = { gte, lte };
    purchaseDateFilter.purchaseDate = { gte, lte };
    eventDateFilter.date = { gte, lte };
    customerDateFilter.createdAt = { gte, lte };
    expenseDateFilter.date = { gte, lte };
  }

  // Execute all summary queries in parallel
  const [
    revenueAggregation,
    expenseAggregation,
    activeEvents,
    pendingTasks,
    totalCustomers,
    recentEvents,
    otherExpenseAggregation,
    extraBillsAggregation,
    dutyRosterAggregation
  ] = await Promise.all([
    // 1. Calculate Revenue via Invoices (Accrual Basis: exclude drafts and cancelled)
    prisma.invoice.aggregate({
      where: { 
        ...invoiceDateFilter, 
        status: { in: ["sent", "partially-paid", "paid", "overdue"] } 
      },
      _sum: { totalAmount: true, advancePaid: true }
    }),

    // 2. Calculate Purchases (Material Expenses)
    prisma.purchase.aggregate({
      where: purchaseDateFilter,
      _sum: { totalAmount: true }
    }),

    // 3. Count active events
    prisma.event.count({
      where: {
        ...eventDateFilter,
        status: { in: ["in-progress", "confirmed"] }}
    }),

    // 4. Count pending tasks (pending events)
    prisma.event.count({
      where: {
        ...eventDateFilter,
        status: "pending"}
    }),

    // 5. Count total customers
    prisma.customer.count({
      where: customerDateFilter
    }),

    // 6. Fetch recent events
    prisma.event.findMany({
      where: eventDateFilter,
      orderBy: { date: "asc" },
      take: 5,
      include: {
        customer: { select: { name: true, email: true } }
      }
    }),

    // 7. Calculate Other Operational Expenses
    prisma.expense.aggregate({
      where: expenseDateFilter,
      _sum: { amount: true }
    }),

    // 8. Calculate Internal Extra Bills Cost
    prisma.extraBill.aggregate({
      where: { event: eventDateFilter },
      _sum: { amount: true }
    }),

    // 9. Calculate DutyRoster Labor Cost
    (async () => {
      if (startDate && endDate) {
        return await prisma.$queryRaw`
          SELECT SUM(cardinality("DutyRoster"."days") * "Event"."cateringBoyRate") as "totalLaborCost"
          FROM "DutyRoster"
          JOIN "Event" ON "DutyRoster"."eventId" = "Event"."id"
          WHERE "Event"."date" >= ${new Date(startDate)} AND "Event"."date" <= ${new Date(endDate)}
        `;
      } else {
        return await prisma.$queryRaw`
          SELECT SUM(cardinality("DutyRoster"."days") * "Event"."cateringBoyRate") as "totalLaborCost"
          FROM "DutyRoster"
          JOIN "Event" ON "DutyRoster"."eventId" = "Event"."id"
        `;
      }
    })()
  ]);

  const totalRevenue = new Prisma.Decimal(revenueAggregation._sum.totalAmount || 0);
  const collected = new Prisma.Decimal(revenueAggregation._sum.advancePaid || 0);
  const totalPurchases = new Prisma.Decimal(expenseAggregation._sum.totalAmount || 0);
  
  const staticExpenses = new Prisma.Decimal(otherExpenseAggregation._sum.amount || 0);
  const extraBillsCost = new Prisma.Decimal(extraBillsAggregation._sum.amount || 0);
  const dutyRosterCost = new Prisma.Decimal(dutyRosterAggregation[0]?.totalLaborCost || 0);
  const totalOperationalExpenses = staticExpenses.plus(extraBillsCost).plus(dutyRosterCost);

  // Profit accurately accounts for purchases, static expenses, extra bills, and labor.
  const totalExpenses = totalPurchases.plus(totalOperationalExpenses);
  const profit = totalRevenue.minus(totalExpenses);

  const completedEvents = await prisma.event.count({
    where: { ...eventDateFilter, status: "completed" }
  });

  const result = {
    totalRevenue,
    collected,
    totalExpenses,
    totalPurchases,
    totalOperationalExpenses,
    profit,
    completedEvents,
    activeEvents,
    pendingTasks,
    totalCustomers,
    recentEvents};

  try {
    // Cache for 5 minutes to alleviate DB load while preserving near real-time accuracy
    reportCache.set(cacheKey, JSON.stringify(result), { ttl: 1000 * 60 * 5 });
  } catch (err) {
    console.warn('[Cache] Cache write failed for dashboard summary:', err.message);
  }

  return result;
  };

  const promise = generateReport();
  pendingReports.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    pendingReports.delete(cacheKey);
  }
};

/**
 * Generates Monthly Revenue & Expense Analytics
 */
export const getFinancialAnalyticsService = async (year) => {
  const cacheKey = `financial_analytics:${year}`;

  if (pendingReports.has(cacheKey)) {
    return await pendingReports.get(cacheKey);
  }

  const generateReport = async () => {
    try {
    const cached = reportCache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.warn('[Cache] Cache read failed for financial analytics:', err.message);
  }

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  // Group expenses by month using raw query
  const expensesByMonth = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "purchaseDate") as _id, SUM("totalAmount") as "monthlyExpense"
    FROM "Purchase"
    WHERE "purchaseDate" >= ${startOfYear} AND "purchaseDate" <= ${endOfYear}
    GROUP BY EXTRACT(MONTH FROM "purchaseDate")
    ORDER BY _id ASC
  `;

  // Event-Based Temporal Alignment: 
  const revenueByMonth = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as _id, SUM("Invoice"."totalAmount") as "monthlyRevenue"
    FROM "Invoice"
    JOIN "Event" ON "Invoice"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${startOfYear} AND "Event"."date" <= ${endOfYear} 
      AND "Invoice"."status" IN ('sent', 'partially-paid', 'paid', 'overdue')
    GROUP BY EXTRACT(MONTH FROM "Event"."date")
    ORDER BY _id ASC
  `;

  // Group other expenses by month using raw query
  const otherExpensesByMonth = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "date") as _id, SUM("amount") as "monthlyExpense"
    FROM "Expense"
    WHERE "date" >= ${startOfYear} AND "date" <= ${endOfYear}
    GROUP BY EXTRACT(MONTH FROM "date")
    ORDER BY _id ASC
  `;

  // Group extra bills by month
  const extraBillsByMonth = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as _id, SUM("ExtraBill"."amount") as "monthlyExpense"
    FROM "ExtraBill"
    JOIN "Event" ON "ExtraBill"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${startOfYear} AND "Event"."date" <= ${endOfYear}
    GROUP BY EXTRACT(MONTH FROM "Event"."date")
  `;

  // Group labor costs by month
  const dutyRosterByMonth = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as _id, SUM(cardinality("DutyRoster"."days") * "Event"."cateringBoyRate") as "monthlyExpense"
    FROM "DutyRoster"
    JOIN "Event" ON "DutyRoster"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${startOfYear} AND "Event"."date" <= ${endOfYear}
    GROUP BY EXTRACT(MONTH FROM "Event"."date")
  `;

  // Merge expenses, otherExpenses, extraBills, and labor
  const mergedExpenses = new Map();
  const addExpense = (arr) => {
    arr.forEach(e => {
      const id = Number(e._id);
      const existing = mergedExpenses.get(id) || 0;
      mergedExpenses.set(id, existing + Number(e.monthlyExpense));
    });
  };

  addExpense(expensesByMonth);
  addExpense(otherExpensesByMonth);
  addExpense(extraBillsByMonth);
  addExpense(dutyRosterByMonth);

  const finalExpensesByMonth = Array.from(mergedExpenses.entries()).map(([month, total]) => ({
    _id: month,
    monthlyExpense: total
  })).sort((a, b) => a._id - b._id);

  const result = {
    year,
    expensesByMonth: finalExpensesByMonth,
    revenueByMonth: revenueByMonth.map(r => ({ _id: Number(r._id), monthlyRevenue: Number(r.monthlyRevenue) }))};

  try {
    // Cache for 1 hour since historical trends change slowly
    reportCache.set(cacheKey, JSON.stringify(result), { ttl: 1000 * 60 * 60 });
  } catch (err) {
    console.warn('[Cache] Cache write failed for financial analytics:', err.message);
  }

    return result;
  };

  const promise = generateReport();
  pendingReports.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    pendingReports.delete(cacheKey);
  }
};
