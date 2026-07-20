import cron from 'node-cron';
import { updateOverdueInvoices, checkPromisedPayments } from '../modules/billing/billing.controller.js';
import { runAllTenantsBackup } from '../modules/backup/backup.controller.js';
import prisma from '../utils/prisma.js';

/**
 * Check active subscriptions:
 * 1. Suspend expired testing tenants (isTesting = true and subscriptionExpiresAt <= now).
 * 2. Alert admins and super admins exactly 5 days before expiration for main plans (isTesting = false).
 */
async function checkSubscriptions() {
  const now = new Date();

  // Fetch active system-wide super admins once to avoid N+1 query loop
  const superAdmins = await prisma.auth.findMany({
    where: { role: 'super_admin',  status: 'active' }
  });

  // --- 1. Automated Expired Plan Suspensions ---
  const expiredTenants = await prisma.tenant.findMany({
    where: {
      status: 'active',
      subscriptionExpiresAt: { lte: now }
    }
  });

  for (const tenant of expiredTenants) {
    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          status: 'suspended',
          suspensionReason: tenant.isTesting ? 'Testing period expired' : 'Subscription plan expired'
        }
      });

      const tenantAdmins = await tx.auth.findMany({
        where: {  role: 'admin' }
      });

      if (tenantAdmins.length > 0) {
        await tx.notification.createMany({
          data: tenantAdmins.map(admin => ({
            
            recipientId: admin.id,
            title: tenant.isTesting ? 'Testing Subscription Expired' : 'Subscription Expired - Account Suspended',
            message: tenant.isTesting 
              ? `Your testing subscription for ${tenant.name} has expired. Your account has been suspended. Please contact sales to upgrade to a main plan.`
              : `Your subscription for ${tenant.name} has expired and your account is now suspended. Please contact the super admin to renew your plan and restore access.`,
            type: 'error',
            category: 'billing'
          }))
        });
      }

      if (superAdmins.length > 0) {
        await tx.notification.createMany({
          data: superAdmins.map(admin => ({
            
            recipientId: admin.id,
            title: tenant.isTesting ? 'Testing Subscription Expired' : 'Subscription Expired',
            message: `The ${tenant.isTesting ? 'testing ' : ''}subscription for company "${tenant.name}" has expired and their account is now suspended.`,
            type: 'error',
            category: 'billing'
          }))
        });
      }

      await tx.notification.updateMany({
        where: {
          
          category: 'billing',
          title: 'Subscription Expiration Alert',
          isRead: false
        },
        data: { isRead: true }
      });
    });
  }

  // --- 2. Main plan 5-day pre-expiry alerts ---
  const targetDayStart = new Date();
  targetDayStart.setDate(targetDayStart.getDate() + 5);
  targetDayStart.setHours(0, 0, 0, 0);

  const targetDayEnd = new Date();
  targetDayEnd.setDate(targetDayEnd.getDate() + 5);
  targetDayEnd.setHours(23, 59, 59, 999);

  const expiringMainTenants = await prisma.tenant.findMany({
    where: {
      status: 'active',
      isTesting: false,
      subscriptionExpiresAt: { gte: targetDayStart, lte: targetDayEnd }
    }
  });

  for (const tenant of expiringMainTenants) {
    const expiryDateStr = tenant.subscriptionExpiresAt.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    if (superAdmins.length > 0) {
      const superAdminIds = superAdmins.map(sa => sa.id);
      const recentSuperAdminNotifications = await prisma.notification.findMany({
        where: {
          
          recipientId: { in: superAdminIds },
          category: 'billing',
          title: 'Subscription Expiration Alert',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        select: { recipientId: true }
      });
      const alertedSuperAdminIds = new Set(recentSuperAdminNotifications.map(n => n.recipientId));

      const superAdminNotificationsToCreate = [];
      for (const superAdmin of superAdmins) {
        if (!alertedSuperAdminIds.has(superAdmin.id)) {
          superAdminNotificationsToCreate.push({
            
            recipientId: superAdmin.id,
            title: 'Subscription Expiration Alert',
            message: `The subscription for company "${tenant.name}" will expire in 5 days on ${expiryDateStr}.`,
            type: 'warning',
            category: 'billing'
          });
        }
      }

      if (superAdminNotificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: superAdminNotificationsToCreate
        });
      }
    }
  }
}

/**
 * Initialize background jobs
 */
export const initCronJobs = () => {
  // Midnight execution
  cron.schedule('0 0 * * *', async () => {
    try {
      await updateOverdueInvoices();
      await checkPromisedPayments();
      await checkSubscriptions();
      await runAllTenantsBackup();
    } catch (err) {
      console.error('[Scheduler] Error running midnight tasks:', err);
    }
  });

  // Hourly execution (for demo/testing responsiveness as requested in old code)
  cron.schedule('0 * * * *', async () => {
    try {
      await updateOverdueInvoices();
      await checkPromisedPayments();
      await checkSubscriptions();
    } catch (err) {
      console.error('[Scheduler] Error running hourly tasks:', err);
    }
  });

  console.log('[Scheduler] node-cron jobs scheduled successfully');
};
