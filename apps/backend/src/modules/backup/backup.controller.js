import { google } from "googleapis";
import prisma from "../../utils/prisma.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const TABLES_IN_ORDER = [
  'role', 'systemSetting', 'sequence',
  'auth', 'customer', 'supplier', 'manpowerAgency',
  'menuCategory', 'inventoryCategory',
  'menu', 'inventory', 'package',
  'event', 'quotation', 'invoice',
  'invoiceItem', 'payment', 'purchase', 'expense',
  'extraBill', 'dutyRoster', 'inventoryAllocation',
  'recipeIngredient', 'eventIngredient', 'stockHistory',
  'agencyAssignment', 'feedback', 'notification',
  'announcement', 'supportTicket', 'supportMessage'
];

const SETTINGS_FILE = path.join(process.cwd(), "backup_settings.json");

const getBackupSettings = () => {
  if (fs.existsSync(SETTINGS_FILE)) {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  }
  return { googleDriveRefreshToken: null, googleDriveEmail: null };
};

const saveBackupSettings = (settings) => {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
};

// Function to encrypt data
const encryptData = (data) => {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
};

// Function to decrypt data
const decryptData = (encryptedObj) => {
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const key = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY).digest('base64').substring(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email"
    ];
    
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      state: "single-tenant"
    });

    res.status(200).json({ status: "success", url });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ status: "error", message: "Missing code" });
    }

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    const settings = getBackupSettings();
    if (tokens.refresh_token) {
      settings.googleDriveRefreshToken = tokens.refresh_token;
    }
    settings.googleDriveEmail = email;
    saveBackupSettings(settings);

    // Redirect to frontend settings page
    res.redirect(`${process.env.FRONTEND_URL}/settings?backup_connected=true`);
  } catch (error) {
    console.error("Google Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?backup_connected=false&error=${encodeURIComponent(error.message)}`);
  }
};

export const triggerBackup = async (req, res, next) => {
  try {
    const settings = getBackupSettings();

    if (!settings.googleDriveRefreshToken) {
      return res.status(400).json({ status: "error", message: "Google Drive is not connected." });
    }

    // Return 202 Accepted and run in background
    res.status(202).json({ status: "success", message: "Backup started in the background." });

    // Background Process
    (async () => {
      let backupLog;
      try {
        backupLog = await prisma.backupLog.create({
          data: { status: "pending" }
        });

        // 1. Extract Data
        const backupData = {
          timestamp: new Date().toISOString(),
          data: {}
        };
        
        for (const table of TABLES_IN_ORDER) {
          if (prisma[table]) {
            backupData.data[table] = await prisma[table].findMany();
          }
        }

        // 2. Encrypt
        const encryptedPayload = encryptData(backupData);

        // 3. Upload to Google Drive
        oauth2Client.setCredentials({ refresh_token: settings.googleDriveRefreshToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const fileMetadata = {
          name: `Backup_System_${Date.now()}.json.enc`,
          parents: [] // optional: can create a specific folder first
        };

        const media = {
          mimeType: 'application/json',
          body: JSON.stringify(encryptedPayload)
        };

        await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id'
        });

        // 4. Update Log
        await prisma.backupLog.update({
          where: { id: backupLog.id },
          data: { status: "success" }
        });

      } catch (err) {
        console.error("Backup Job Error:", err);
        if (backupLog) {
          await prisma.backupLog.update({
            where: { id: backupLog.id },
            data: { status: "failed", errorMessage: err.message }
          });
        }
      }
    })();
  } catch (error) {
    next(error);
  }
};

export const runAllTenantsBackup = async () => {
  try {
    const settings = getBackupSettings();
    if (!settings.googleDriveRefreshToken) return;

    let backupLog;
    try {
      backupLog = await prisma.backupLog.create({
        data: { status: "pending" }
      });

      // 1. Extract Data
      const backupData = {
        timestamp: new Date().toISOString(),
        data: {}
      };
      
      for (const table of TABLES_IN_ORDER) {
        if (prisma[table]) {
          backupData.data[table] = await prisma[table].findMany();
        }
      }

      // 2. Encrypt
      const encryptedPayload = encryptData(backupData);

      // 3. Upload to Google Drive
      oauth2Client.setCredentials({ refresh_token: settings.googleDriveRefreshToken });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const fileMetadata = {
        name: `Backup_System_${Date.now()}.json.enc`,
        parents: []
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(encryptedPayload)
      };

      await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      // 4. Update Log
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: { status: "success" }
      });
      console.log(`[Backup Job] Successfully backed up data.`);

    } catch (err) {
      console.error(`[Backup Job] Failed:`, err.message);
      if (backupLog) {
        await prisma.backupLog.update({
          where: { id: backupLog.id },
          data: { status: "failed", errorMessage: err.message }
        });
      }
    }
  } catch (err) {
    console.error("[Backup Job] Global Error:", err);
  }
};

export const restoreBackup = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No backup file uploaded." });
    }

    // 1. Read and parse the uploaded file
    let encryptedPayload;
    try {
      const fileContent = req.file.buffer.toString("utf8");
      encryptedPayload = JSON.parse(fileContent);
    } catch (err) {
      return res.status(400).json({ status: "error", message: "Invalid backup file format." });
    }

    // 2. Decrypt the data
    let backupData;
    try {
      backupData = decryptData(encryptedPayload);
    } catch (err) {
      return res.status(400).json({ status: "error", message: "Failed to decrypt backup. The file may be corrupted or the encryption key has changed." });
    }

    if (!backupData.data) {
      return res.status(400).json({ status: "error", message: "No data found in the backup file." });
    }

    // 4. Restore using Prisma Transaction (Upsert to prevent foreign key errors)
    await prisma.$transaction(async (tx) => {
      for (const table of TABLES_IN_ORDER) {
        const records = backupData.data[table] || [];
        if (tx[table] && records.length > 0) {
          for (const record of records) {
            await tx[table].upsert({
              where: { id: record.id },
              update: record,
              create: record
            });
          }
        }
      }
    });

    res.status(200).json({ status: "success", message: "Backup restored successfully." });
  } catch (error) {
    console.error("Restore Backup Error:", error);
    next(error);
  }
};

export const getBackupStatus = async (req, res, next) => {
  try {
    const settings = getBackupSettings();

    res.status(200).json({
      status: "success",
      data: {
        isConnected: !!settings.googleDriveRefreshToken,
        email: settings.googleDriveEmail || null
      }
    });
  } catch (error) {
    next(error);
  }
};
