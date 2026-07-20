import prisma from "../../utils/prisma.js";
import { Prisma } from "@prisma/client";

class InvoiceService {
  /**
   * Recalculate and synchronize event invoice with menu items, guest counts, fees and advances.
   */
  async syncEventInvoice(eventId, tx = prisma) {
    try {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          menuItems: true,
          extraBills: true,
          inventoryAllocations: {
            include: {
              inventory: true
            }
          }
        }
      });

      if (!event) return;

      const guestCount = event.guestCount || 1;
      const duration = event.durationInDays || 1;
      const eventFee = event.eventFee || 0;
      const advanceAmount = event.advanceAmount || 0;

      // Calculate subtotal from menu items based on guest count and duration
      let calculatedSubtotal = new Prisma.Decimal(0);
      const invoiceItems = [];

      if (event.menuItems && event.menuItems.length > 0) {
        let customPrices = event.customMenuPrices || {};
        if (typeof customPrices === 'string') {
          try { customPrices = JSON.parse(customPrices); } catch (e) { customPrices = {}; }
        }

        let customSelections = event.customMenuSelections || {};
        if (typeof customSelections === 'string') {
          try { customSelections = JSON.parse(customSelections); } catch (e) { customSelections = {}; }
        }

        event.menuItems.forEach((menuItem) => {
          let unitPrice = new Prisma.Decimal(menuItem.minPrice);
          let quantity = guestCount * duration;
          let description = `${menuItem.name} (Plate Cost for ${guestCount} Guests over ${duration} Days)`;

          // Check for custom selections (Hybrid Billing)
          if (customSelections[menuItem.id]) {
            const selection = customSelections[menuItem.id];
            let priceVal = selection.price;
            if (priceVal === undefined || priceVal === null || priceVal === "" || isNaN(Number(priceVal))) {
              priceVal = menuItem.minPrice;
            }
            unitPrice = new Prisma.Decimal(priceVal);

            if (selection.type === "PER_UNIT") {
              const qty = Number(selection.quantity) || 1;
              const unit = selection.unit ? ` ${selection.unit}` : "";
              quantity = 1;
              description = `${menuItem.name} (${qty}${unit})`;
            }
          }
          // Fallback to legacy customMenuPrices
          else if (customPrices[menuItem.id] !== undefined) {
            unitPrice = new Prisma.Decimal(customPrices[menuItem.id]);
          }

          const itemTotal = unitPrice.times(quantity);
          calculatedSubtotal = calculatedSubtotal.plus(itemTotal);
          invoiceItems.push({
            description,
            quantity,
            unitPrice,
            total: itemTotal});
        });
      }

      // Add Event Fee as a trackable line item if specified
      if (eventFee > 0) {
        invoiceItems.push({
          description: "Event Management & Setup Fee",
          quantity: 1,
          unitPrice: eventFee,
          total: eventFee});
        calculatedSubtotal = calculatedSubtotal.plus(eventFee);
      }

      const cateringBoysCount = event.cateringBoysCount || 0;
      const cateringBoyRate = event.cateringBoyRate ? new Prisma.Decimal(event.cateringBoyRate) : new Prisma.Decimal(0);

      if (cateringBoysCount > 0 && cateringBoyRate.gt(0)) {
        const cateringTotal = cateringBoyRate.times(cateringBoysCount).times(duration);
        invoiceItems.push({
          description: `Catering Staff (${cateringBoysCount} persons for ${duration} days)`,
          quantity: cateringBoysCount * duration,
          unitPrice: cateringBoyRate,
          total: cateringTotal});
        calculatedSubtotal = calculatedSubtotal.plus(cateringTotal);
      }

      // Extra bills (Food Shortages / Extra Cooking) added to the client's invoice subtotal
      if (event.extraBills && event.extraBills.length > 0) {
        event.extraBills.forEach((bill) => {
          const billAmount = new Prisma.Decimal(bill.amount || 0);
          if (billAmount.gt(0)) {
            calculatedSubtotal = calculatedSubtotal.plus(billAmount);
            // We do NOT push to invoiceItems here because we will render them in a separate "Extra" section on the frontend
          }
        });
      }
      // Add Inventory Allocations (Equipment Rental per day)
      if (event.inventoryAllocations && event.inventoryAllocations.length > 0) {
        event.inventoryAllocations.forEach((allocation) => {
          if (allocation.inventory && allocation.inventory.rentPerDay) {
            const rentPrice = new Prisma.Decimal(allocation.inventory.rentPerDay);
            if (rentPrice.gt(0)) {
              const qty = new Prisma.Decimal(allocation.quantity || 1);
              const totalRent = rentPrice.times(qty).times(duration);
              calculatedSubtotal = calculatedSubtotal.plus(totalRent);

              invoiceItems.push({
                description: `Rental: ${allocation.inventory.name} (Qty: ${qty.toNumber()} for ${duration} days)`,
                quantity: qty.toNumber() * duration,
                unitPrice: rentPrice,
                total: totalRent});
            }
          }
        });
      }

      // Find existing invoice
      let initialInvoice = await tx.invoice.findFirst({
        where: { eventId: eventId }
      });

      let invoice = null;
      if (initialInvoice) {
        // Lock the invoice row to prevent payment race conditions
        await tx.$executeRaw`SELECT 1 FROM "Invoice" WHERE id = ${initialInvoice.id} FOR UPDATE`;

        // Re-read the fully locked invoice and manual items
        invoice = await tx.invoice.findUnique({
          where: { id: initialInvoice.id },
          include: { items: { where: { isManual: true } } }
        });
      }

      const dueDate = new Date(event.date);
      dueDate.setDate(dueDate.getDate() - 7); // Due 7 days before event

      if (invoice) {
        // Incorporate existing manual items into the calculated subtotal
        let manualSubtotal = new Prisma.Decimal(0);
        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach(item => {
            manualSubtotal = manualSubtotal.plus(new Prisma.Decimal(item.total));
          });
        }
        calculatedSubtotal = calculatedSubtotal.plus(manualSubtotal);

        // Preserve existing manual adjustments
        const taxRate = new Prisma.Decimal(invoice.taxRate || 0);
        const discountType = invoice.discountType || "fixed";
        const discountValue = new Prisma.Decimal(invoice.discountValue || 0);

        // Calculate tax
        const tax = calculatedSubtotal.times(taxRate).dividedBy(100);
        const subtotalPlusTax = calculatedSubtotal.plus(tax);

        // Safely recalculate absolute discount amount based on type
        let discountAmount = new Prisma.Decimal(0);
        if (discountType === "percentage") {
          discountAmount = subtotalPlusTax.times(discountValue).dividedBy(100);
        } else {
          // Cap fixed discount to not exceed subtotal+tax
          discountAmount = Prisma.Decimal.min(subtotalPlusTax, discountValue);
        }

        // Calculate new total safely (cannot be negative)
        const totalAmount = Prisma.Decimal.max(0, subtotalPlusTax.minus(discountAmount));

        // CRITICAL FIX: advancePaid must only be driven by PaymentHistory. 
        // We read the strictly locked advancePaid value and do not overwrite it with event.advanceAmount.
        const advancePaid = new Prisma.Decimal(invoice.advancePaid || 0);
        const balanceAmount = totalAmount.minus(advancePaid);

        let statusUpdate = invoice.status;
        if (balanceAmount.lte(0)) {
          statusUpdate = "paid";
        } else if (advancePaid.gt(0)) {
          statusUpdate = "partially-paid";
        } else {
          statusUpdate = "pending";
        }

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            items: {
              deleteMany: { isManual: false },
              create: invoiceItems
            },
            subtotal: calculatedSubtotal,
            tax,
            taxRate,
            discountAmount,
            totalAmount,
            // advancePaid is NOT modified here. It remains the absolute source of truth from payments.
            balanceAmount,
            dueDate,
            status: statusUpdate
          }
        });
        console.log(`Invoice ${invoice.invoiceNumber} successfully synced for Event: ${event.title}`);
      } else {
        // Create new draft invoice
        const year = new Date().getFullYear();
        const sequenceId = `invoice_${year}`;
        const sequence = await tx.sequence.upsert({
          where: { id: sequenceId },
          update: { value: { increment: 1 } },
          create: { id: sequenceId,  value: 1 }
        });
        const invoiceNumber = `INV-${year}-${sequence.value.toString().padStart(4, '0')}`;

        const initialTaxRate = new Prisma.Decimal(0); // Tenant tax removed in single-tenant
        const initialTax = calculatedSubtotal.times(initialTaxRate).dividedBy(100);

        const totalAmount = calculatedSubtotal.plus(initialTax);
        const balanceAmount = totalAmount.minus(new Prisma.Decimal(advanceAmount));

        let initialStatus = "draft";
        if (balanceAmount.lte(0)) {
          initialStatus = "paid";
        } else if (new Prisma.Decimal(advanceAmount).gt(0)) {
          initialStatus = "partially-paid";
        } else {
          initialStatus = "pending";
        }

        const invoiceData = {
          
          eventId: eventId,
          customerId: event.customerId,
          items: {
            create: invoiceItems
          },
          subtotal: calculatedSubtotal,
          tax: initialTax,
          taxRate: initialTaxRate,
          discountAmount: 0,
          totalAmount,
          advancePaid: advanceAmount,
          balanceAmount,
          dueDate,
          status: initialStatus,
          invoiceNumber};

        if (new Prisma.Decimal(advanceAmount).gt(0)) {
          invoiceData.paymentHistory = {
            create: {
              amount: advanceAmount,
              method: "cash", // Default fallback for event creation advance
              reference: "Initial Event Advance",
              paymentDate: new Date()
            }
          };
        }

        await tx.invoice.create({
          data: invoiceData
        });
        console.log(`New Invoice successfully created for Event: ${event.title}`);
      }
    } catch (err) {
      console.error("Failed to sync event invoice:", err);
      throw err;
    }
  }
}

export default new InvoiceService();
