import prisma from "../../utils/prisma.js";
import { Prisma } from "@prisma/client";
import catchAsync from "../../utils/catchAsync.js";
import { getDashboardSummaryService, getFinancialAnalyticsService } from "./reports.service.js";
import { reportCache } from "./reports.service.js";

const pendingReports = new Map();

/**
 * Get core financial and operational summary stats
 */
export const getSummaryStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  
  // Single Source of Truth: Use the unified summary service
  const summary = await getDashboardSummaryService(startDate, endDate);

  res.status(200).json({
    status: "success",
    data: {
      revenue: summary.totalRevenue,
      collected: summary.collected,
      expenses: summary.totalExpenses,
      profit: summary.profit,
      eventCount: summary.completedEvents,
      pendingCollection: summary.totalRevenue.minus(summary.collected),
      purchases: summary.totalPurchases,
      operationalExpenses: summary.totalOperationalExpenses
    }
  });
});

/**
 * Get monthly revenue and expense trends for Recharts
 */
export const getMonthlyTrends = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  

  const cacheKey = `monthly_trends:${startDate || 'default'}:${endDate || 'default'}`;

  if (pendingReports.has(cacheKey)) {
    const finalTrends = await pendingReports.get(cacheKey);
    return res.status(200).json({ status: "success", data: finalTrends });
  }

  const generateReport = async () => {
    try {
      const cached = reportCache.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn('[Cache] Cache read failed for monthly trends:', err.message);
    }

    let dateLimit;
  let upperLimit = new Date();
  
  if (startDate && endDate) {
    dateLimit = new Date(startDate);
    upperLimit = new Date(endDate);
  } else {
    const months = 6;
    dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - months);
  }

  const revTrends = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as month, EXTRACT(YEAR FROM "Event"."date") as year, SUM("Invoice"."totalAmount") as revenue
    FROM "Invoice"
    JOIN "Event" ON "Invoice"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${dateLimit} AND "Event"."date" <= ${upperLimit} 
      AND "Invoice"."status" IN ('sent', 'partially-paid', 'paid', 'overdue')
    GROUP BY EXTRACT(YEAR FROM "Event"."date"), EXTRACT(MONTH FROM "Event"."date")
    ORDER BY year ASC, month ASC
  `;

  const expTrends = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "purchaseDate") as month, EXTRACT(YEAR FROM "purchaseDate") as year, SUM("totalAmount") as expenses
    FROM "Purchase"
    WHERE "purchaseDate" >= ${dateLimit} AND "purchaseDate" <= ${upperLimit}
    GROUP BY EXTRACT(YEAR FROM "purchaseDate"), EXTRACT(MONTH FROM "purchaseDate")
    ORDER BY year ASC, month ASC
  `;

  const opExpTrends = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "date") as month, EXTRACT(YEAR FROM "date") as year, SUM("amount") as expenses
    FROM "Expense"
    WHERE "date" >= ${dateLimit} AND "date" <= ${upperLimit}
    GROUP BY EXTRACT(YEAR FROM "date"), EXTRACT(MONTH FROM "date")
    ORDER BY year ASC, month ASC
  `;

  const extraBillTrends = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as month, EXTRACT(YEAR FROM "Event"."date") as year, SUM("ExtraBill"."amount") as expenses
    FROM "ExtraBill"
    JOIN "Event" ON "ExtraBill"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${dateLimit} AND "Event"."date" <= ${upperLimit}
    GROUP BY EXTRACT(YEAR FROM "Event"."date"), EXTRACT(MONTH FROM "Event"."date")
    ORDER BY year ASC, month ASC
  `;

  const dutyRosterTrends = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "Event"."date") as month, EXTRACT(YEAR FROM "Event"."date") as year, SUM(cardinality("DutyRoster"."days") * "Event"."cateringBoyRate") as expenses
    FROM "DutyRoster"
    JOIN "Event" ON "DutyRoster"."eventId" = "Event"."id"
    WHERE "Event"."date" >= ${dateLimit} AND "Event"."date" <= ${upperLimit}
    GROUP BY EXTRACT(YEAR FROM "Event"."date"), EXTRACT(MONTH FROM "Event"."date")
    ORDER BY year ASC, month ASC
  `;

  // Merge trends into a single time-series array
  const trendsMap = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const mergeTrend = (trendData, type) => {
    trendData.forEach(t => {
      const key = `${t.month}-${t.year}`;
      if (!trendsMap[key]) {
        trendsMap[key] = { month: monthNames[Number(t.month) - 1], revenue: 0, expenses: 0 };
      }
      if (type === 'rev') {
        trendsMap[key].revenue += Number(t.revenue || 0);
      } else {
        trendsMap[key].expenses += Number(t.expenses || 0);
      }
    });
  };

  mergeTrend(revTrends, 'rev');
  mergeTrend(expTrends, 'exp');
  mergeTrend(opExpTrends, 'exp');
  mergeTrend(extraBillTrends, 'exp');
  mergeTrend(dutyRosterTrends, 'exp');

  const finalTrends = Object.values(trendsMap);

  try {
    // Cache for 1 hour
    reportCache.set(cacheKey, JSON.stringify(finalTrends), { ttl: 3600 * 1000 });
  } catch (err) {
    console.warn('[Cache] Cache write failed for monthly trends:', err.message);
  }

    return finalTrends;
  };

  const promise = generateReport();
  pendingReports.set(cacheKey, promise);

  let finalTrends;
  try {
    finalTrends = await promise;
  } finally {
    pendingReports.delete(cacheKey);
  }

  res.status(200).json({
    status: "success",
    data: finalTrends
  });
});

/**
 * Get most popular menu items from invoices
 */
export const getTopItems = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  

  const cacheKey = `top_items:${startDate || 'all'}:${endDate || 'all'}`;

  if (pendingReports.has(cacheKey)) {
    const formattedData = await pendingReports.get(cacheKey);
    return res.status(200).json({ status: "success", data: formattedData });
  }

  const generateReport = async () => {
    try {
      const cached = reportCache.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn('[Cache] Cache read failed for top items:', err.message);
    }

  let topItems;

  if (startDate && endDate) {
    topItems = await prisma.$queryRaw`
      SELECT ii."description" as "_id", SUM(ii."total") as "totalSales", SUM(ii."quantity") as "count"
      FROM "InvoiceItem" ii
      JOIN "Invoice" i ON ii."invoiceId" = i."id"
      JOIN "Event" e ON i."eventId" = e."id"
      WHERE i."status" IN ('sent', 'partially-paid', 'paid', 'overdue')
        AND e."date" >= ${new Date(startDate)} AND e."date" <= ${new Date(endDate)}
      GROUP BY ii."description"
      ORDER BY "count" DESC
      LIMIT 5
    `;
  } else {
    topItems = await prisma.$queryRaw`
      SELECT ii."description" as "_id", SUM(ii."total") as "totalSales", SUM(ii."quantity") as "count"
      FROM "InvoiceItem" ii
      JOIN "Invoice" i ON ii."invoiceId" = i."id"
      WHERE i."status" IN ('sent', 'partially-paid', 'paid', 'overdue')
      GROUP BY ii."description"
      ORDER BY "count" DESC
      LIMIT 5
    `;
  }

  const formattedData = topItems.map(item => ({
    _id: item._id,
    totalSales: Number(item.totalSales || 0),
    count: Number(item.count || 0)
  }));

  try {
    // Cache for 5 minutes
    reportCache.set(cacheKey, JSON.stringify(formattedData), { ttl: 300 * 1000 });
  } catch (err) {
    console.warn('[Cache] Cache write failed for top items:', err.message);
  }

    return formattedData;
  };

  const promise = generateReport();
  pendingReports.set(cacheKey, promise);

  let formattedData;
  try {
    formattedData = await promise;
  } finally {
    pendingReports.delete(cacheKey);
  }

  res.status(200).json({
    status: "success",
    data: formattedData
  });
});

/**
 * Get dashboard summary metrics (live data)
 */
export const getDashboardSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const summary = await getDashboardSummaryService(startDate, endDate);

  res.status(200).json({
    status: "success",
    data: summary
  });
});

/**
 * Get monthly financial analytics for a specific year
 */
export const getFinancialAnalytics = catchAsync(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  

  const analytics = await getFinancialAnalyticsService(year);
  res.status(200).json({
    status: "success",
    data: analytics
  });
});
