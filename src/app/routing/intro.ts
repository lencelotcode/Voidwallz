import { readStoredString, writeStoredString } from '../../shared/storage/browserStorage';
const INTRO_KEY = 'voidwallz_intro_seen';
let seenInThisDocument = false;

/** The brand introduction is for the first homepage visit, never for an inner page. */
export function shouldShowIntro() {
  if (window.location.pathname !== '/' || seenInThisDocument) return false;
  return readStoredString(INTRO_KEY, '', 'session') !== 'true';
}

export function rememberIntro() {
  seenInThisDocument = true;
  writeStoredString(INTRO_KEY, 'true', 'session');
}
