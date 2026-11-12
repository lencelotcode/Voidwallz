/** Read on demand for Edge runtimes and isolated tests. Never import this module in src/. */
export function serverEnv() {
  return {
    production: process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
    databaseUrl: process.env.SUPABASE_URL,
    databaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publicDatabaseUrl: process.env.VITE_SUPABASE_URL,
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
    securityLogSalt: process.env.SECURITY_LOG_SALT,
    reportWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  };
}
