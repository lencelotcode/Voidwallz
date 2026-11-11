import React, { useEffect, useId, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function AuthPanel({ initialMode = "signin", onComplete, headingLevel = 2 }: { initialMode?: "signin" | "signup" | "trial"; onComplete?: () => void; headingLevel?: 1 | 2 }) {
  const { user, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState(initialMode === "signin" ? "signin" : "signup");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  useEffect(() => { setMode(initialMode === "signin" ? "signin" : "signup"); setError(""); }, [initialMode]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const result = mode === "signin" ? await signIn(String(data.get("email")).trim(), String(data.get("password"))) : await signUp(String(data.get("email")).trim(), String(data.get("password")), String(data.get("name") || "").trim(), initialMode === "trial");
      if (!result.success) setError(result.error || "Unable to continue. Please try again.");
      else onComplete?.();
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  };
  if (user) return <div className="vw-auth-content"><span className="micro-label">Your account</span><Heading>WELCOME BACK.</Heading><p>Signed in as <strong>{user.name || user.email}</strong>.</p><dl className="vw-spec-list"><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Membership</dt><dd>{user.plan === "pro" ? "Pro" : user.plan === "pro_trial" ? "Pro trial" : "Free"}</dd></div></dl><button className="outline-button" type="button" onClick={() => void signOut()}>Sign out <ArrowUpRight size={18} /></button></div>;
  return <div className="vw-auth-content"><span className="micro-label">Voidwallz / {mode === "signin" ? "Member access" : "Join the collection"}</span><Heading>{mode === "signin" ? "GOOD TO SEE YOU." : "MAKE IT YOURS."}</Heading><p>{mode === "signin" ? "Sign in to your Voidwallz account." : initialMode === "trial" ? "Create an account to start your 14-day Pro trial." : "Create your Voidwallz account. Wallpapers are always open to browse."}</p>
    <div className="segmented-control vw-auth-tabs" role="group" aria-label="Account access"><button type="button" aria-pressed={mode === "signin"} onClick={() => { setMode("signin"); setError(""); }}>Sign in</button><button type="button" aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setError(""); }}>Create account</button></div>
    <form className="vw-form" onSubmit={submit}>
      {mode === "signup" && <div className="vw-field"><label htmlFor={`${id}-name`}>Name <span>(optional)</span></label><input id={`${id}-name`} name="name" autoComplete="name" placeholder="Your name" maxLength={80} /></div>}
      <div className="vw-field"><label htmlFor={`${id}-email`}>Email address</label><input id={`${id}-email`} name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div>
      <div className="vw-field"><label htmlFor={`${id}-password`}>Password {mode === "signup" && <span>(6 characters minimum)</span>}</label><div className="vw-password"><input id={`${id}-password`} name="password" type={visible ? "text" : "password"} required minLength={mode === "signup" ? 6 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} aria-describedby={error ? `${id}-error` : undefined} /><button className="icon-button" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
      {error && <p id={`${id}-error`} className="vw-form-error" role="alert">{error}</p>}
      <button className="btn btn--primary vw-button" type="submit" disabled={busy}>{busy ? "Connecting…" : mode === "signin" ? "Sign in" : "Create account"}{busy ? <LoaderCircle size={20} className="animate-spin" /> : <ArrowUpRight size={20} />}</button>
      {mode === "signup" && <p className="vw-form-note">By creating an account, you agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>}
    </form>
  </div>;
}
