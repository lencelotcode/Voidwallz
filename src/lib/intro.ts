const INTRO_KEY = "voidwallz_intro_seen";
let seenInThisDocument = false;

/** The brand introduction is for the first homepage visit, never for an inner page. */
export function shouldShowIntro() {
  if (window.location.pathname !== "/" || seenInThisDocument) return false;
  try { return sessionStorage.getItem(INTRO_KEY) !== "true"; }
  catch { return true; }
}

export function rememberIntro() {
  seenInThisDocument = true;
  try { sessionStorage.setItem(INTRO_KEY, "true"); }
  catch { /* Navigation still works when browser storage is unavailable. */ }
}
