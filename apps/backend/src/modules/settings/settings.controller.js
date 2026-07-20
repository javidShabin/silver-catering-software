import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import fs from "fs";
import path from "path";

const workspaceSettingsKey = "workspace_settings";

const defaultPdfSettings = {
  showCustomerContact: true,
  showCustomerAddress: true,
  showEventDetails: true,
  showTax: true,
  showDiscount: true,
  showItemQuantity: true,
  showItemUnitPrice: true,
  showItemTotalPrice: true
};

const defaultWorkspaceSettings = {
  name: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  website: "",
  logoUrl: "",
  pdfFromAddress: "",
  taxNumber: "",
  taxPercentage: "",
  taxDetails: "",
  pdfSettings: defaultPdfSettings
};

const getWorkspaceSettingsRecord = async () => {
  let setting = await prisma.systemSetting.findUnique({
    where: { key: workspaceSettingsKey }
  });

  if (!setting) {
    setting = await prisma.systemSetting.create({
      data: {
        key: workspaceSettingsKey,
        value: defaultWorkspaceSettings
      }
    });
  }

  return setting;
};

const normalizeWorkspaceSettings = (value = {}) => ({
  ...defaultWorkspaceSettings,
  ...value,
  pdfSettings: {
    ...defaultPdfSettings,
    ...(value.pdfSettings || {})
  }
});

const defaultPrivacyPolicy = [
  {
    icon: "Database",
    title: "1. എന്തൊക്കെ വിവരങ്ങൾ ശേഖരിക്കുന്നു (Information Collection)",
    description: "ഉപഭോക്താവിന്റെ പേര്, ഫോൺ നമ്പർ, ഇമെയിൽ ഐഡി, പണമിടപാടുകളുടെ വിവരങ്ങൾ, അവർ നൽകുന്ന കാറ്ററിംഗ് ഓർഡർ വിവരങ്ങൾ എന്നിവ നമ്മൾ ശേഖരിക്കുന്നുണ്ട്. സിസ്റ്റം കൃത്യമായി പ്രവർത്തിക്കുന്നതിന് ഈ വിവരങ്ങൾ അത്യാവശ്യമാണ്."
  },
  {
    icon: "FileText",
    title: "2. ഈ വിവരങ്ങൾ എന്തിനാണ് ഉപയോഗിക്കുന്നത് (Usage of Information)",
    description: "കസ്റ്റമർക്ക് ഇൻവോയ്‌സ് നൽകാനും, ഓർഡർ കൃത്യമായി ഡെലിവറി ചെയ്യാനും, അവരെ ഫോണിൽ ബന്ധപ്പെടാനും മാത്രമാണ് ഈ വിവരങ്ങൾ ഉപയോഗിക്കുന്നത്. പ്രൊമോഷണൽ പരസ്യങ്ങൾ അയക്കാൻ നിങ്ങളുടെ ഡാറ്റ ഉപയോഗിക്കില്ല."
  },
  {
    icon: "Share2",
    title: "3. വിവരങ്ങൾ മറ്റാർക്കെങ്കിലും കൈമാറുമോ (Data Sharing)",
    description: "നിങ്ങളുടെ സിസ്റ്റത്തിലുള്ള ഉപഭോക്താക്കളുടെ വിവരങ്ങൾ മറ്റ് കമ്പനികൾക്ക് വിൽക്കുകയോ കൈമാറുകയോ ചെയ്യില്ല. ഡാറ്റ സുരക്ഷിതമായി സൂക്ഷിക്കാനും നഷ്ടപ്പെടാതിരിക്കാനും നിങ്ങളുടെ സ്വന്തം ക്ലൗഡ് സ്റ്റോറേജിലേക്ക് ബാക്കപ്പ് ചെയ്യുന്നതാണ്."
  },
  {
    icon: "Lock",
    title: "4. വിവരങ്ങളുടെ സുരക്ഷ (Data Security)",
    description: "ഉപഭോക്താക്കളുടെ വിവരങ്ങൾ ചോർന്നുപോകാതിരിക്കാൻ പാസ്‌വേഡുകളും പ്രധാന ഡാറ്റയും എൻക്രിപ്റ്റ് (Encrypt) ചെയ്താണ് സൂക്ഷിക്കുന്നത്. അഡ്മിനും അധികാരപ്പെടുത്തിയ സ്റ്റാഫുകൾക്കും അല്ലാതെ മറ്റാർക്കും ഇത് കാണാൻ കഴിയില്ല."
  },
  {
    icon: "UserX",
    title: "5. ഡാറ്റ മായ്ച്ചു കളയാനുള്ള അവകാശം (Right to Deletion)",
    description: "ഉപഭോക്താവിന് അവരുടെ വിവരങ്ങൾ സോഫ്റ്റ്‌വെയറിൽ നിന്നും പൂർണ്ണമായി മായ്ച്ചു കളയാൻ താല്പര്യമുണ്ടെങ്കിൽ അതിന് പൂർണ്ണ അവകാശമുണ്ട്. അഡ്മിന് സിസ്റ്റത്തിൽ നിന്നും അക്കൗണ്ടുകൾ ശാശ്വതമായി നീക്കം ചെയ്യാവുന്നതാണ്."
  },
  {
    icon: "Key",
    title: "6. ലോഗിൻ വിവരങ്ങളും കുക്കികളും (Cookies & Tokens)",
    description: "നിങ്ങളെ സുരക്ഷിതമായി സിസ്റ്റത്തിൽ ലോഗിൻ ചെയ്തു നിർത്തുന്നതിനായി നമ്മൾ എൻക്രിപ്റ്റഡ് ടോക്കണുകൾ ഉപയോഗിക്കുന്നു. ഇത് നിങ്ങളുടെ സുരക്ഷ ഉറപ്പാക്കുന്നതിനാണ്."
  },
  {
    icon: "Clock",
    title: "7. ഡാറ്റ സൂക്ഷിക്കുന്ന കാലയളവ് (Data Retention)",
    description: "നിങ്ങളുടെ ബിസിനസ്സ് ആവശ്യങ്ങൾക്കായി ഡാറ്റ സോഫ്റ്റ്‌വെയറിൽ ദീർഘകാലം സൂക്ഷിക്കുന്നതാണ്. നിങ്ങൾ അക്കൗണ്ട് പൂർണ്ണമായി അവസാനിപ്പിക്കുകയാണെങ്കിൽ ഡാറ്റ സെർവറിൽ നിന്നും നീക്കം ചെയ്യും."
  },
  {
    icon: "Bell",
    title: "8. പോളിസി മാറ്റങ്ങൾ (Policy Updates)",
    description: "ഈ പ്രൈവസി പോളിസിയിൽ എന്തെങ്കിലും മാറ്റങ്ങൾ വരുത്തുകയാണെങ്കിൽ, സോഫ്റ്റ്‌വെയർ വഴി നിങ്ങൾക്ക് കൃത്യമായി നോട്ടിഫിക്കേഷൻ ലഭിക്കുന്നതാണ്."
  }
];

export const getPrivacyPolicy = catchAsync(async (req, res) => {
  let setting = await prisma.systemSetting.findUnique({
    where: { key: "privacy_policy" }
  });

  if (!setting) {
    setting = await prisma.systemSetting.create({
      data: {
        key: "privacy_policy",
        value: defaultPrivacyPolicy
      }
    });
  }

  res.status(200).json({
    status: "success",
    data: setting.value
  });
});

export const updatePrivacyPolicy = catchAsync(async (req, res) => {
  const { policies } = req.body;
  if (!policies || !Array.isArray(policies)) {
    throw new AppError("Invalid policy data provided", 400);
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key: "privacy_policy" },
    update: { value: policies },
    create: { key: "privacy_policy", value: policies }
  });

  res.status(200).json({
    status: "success",
    data: setting.value
  });
});

export const getWorkspaceSettings = catchAsync(async (req, res) => {
  const setting = await getWorkspaceSettingsRecord();

  res.status(200).json({
    status: "success",
    data: normalizeWorkspaceSettings(setting.value)
  });
});

export const updateWorkspaceSettings = catchAsync(async (req, res) => {
  const current = await getWorkspaceSettingsRecord();
  const nextSettings = normalizeWorkspaceSettings({
    ...current.value,
    ...req.body,
    pdfSettings: {
      ...(current.value?.pdfSettings || {}),
      ...(req.body?.pdfSettings || {})
    }
  });

  const setting = await prisma.systemSetting.update({
    where: { key: workspaceSettingsKey },
    data: { value: nextSettings }
  });

  res.status(200).json({
    status: "success",
    data: normalizeWorkspaceSettings(setting.value)
  });
});

export const uploadWorkspaceLogo = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError("Please provide an image file", 400);

  const current = await getWorkspaceSettingsRecord();
  const currentSettings = normalizeWorkspaceSettings(current.value);

  if (currentSettings.logoUrl?.startsWith("/uploads/")) {
    const oldPath = path.join(process.cwd(), currentSettings.logoUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const logoUrl = `/uploads/${req.file.filename}`;
  const nextSettings = normalizeWorkspaceSettings({
    ...currentSettings,
    logoUrl
  });

  await prisma.systemSetting.update({
    where: { key: workspaceSettingsKey },
    data: { value: nextSettings }
  });

  res.status(200).json({
    status: "success",
    data: { logoUrl }
  });
});
