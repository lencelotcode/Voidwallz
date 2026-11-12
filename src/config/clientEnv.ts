/** Public build values only. Private credentials belong exclusively under server/config. */
const values = (import.meta.env ?? {}) as Partial<
  Record<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY', string>
>;
const url = values.VITE_SUPABASE_URL as string | undefined;
const key = values.VITE_SUPABASE_ANON_KEY as string | undefined;
function configuredUrl(value?: string) {
  try {
    const candidate = new URL(value ?? '');
    return (
      candidate.protocol === 'https:' &&
      !candidate.username &&
      !candidate.password &&
      !candidate.hostname.includes('your-project-id')
    );
  } catch {
    return false;
  }
}
export const clientEnv = Object.freeze({
  supabaseUrl: url ?? '',
  supabasePublicKey: key ?? '',
  galleryConfigured:
    configuredUrl(url) && Boolean(key && !key.includes('your-publishable-or-anon-key')),
});
