const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_API_KEY'
];

/**
 * Validates that all required environment variables are present and non-empty.
 * If any variables are missing, it logs their names and terminates the process immediately.
 */
export function validateEnv() {
  const missing = [];

  for (const name of REQUIRED_ENV_VARS) {
    if (!process.env[name] || process.env[name].trim() === '') {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error('\n======================================================');
    console.error('CRITICAL STARTUP FAILURE: Missing required environment variables:');
    for (const name of missing) {
      console.error(`  - ${name}`);
    }
    console.error('Please configure these in your environment or .env file.');
    console.error('======================================================\n');
    process.exit(1);
  }
}
