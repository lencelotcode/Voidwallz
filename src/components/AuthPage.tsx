import AccountArtwork from "./AccountArtwork";
import AuthPanel from "./AuthPanel";

export default function AuthPage({ initialMode = "signup" }: { initialMode?: "signup" | "signin" }) {
  return <section className="vw-account-page page-shell">
    <aside className="vw-account-poster vw-login-poster" aria-hidden="true">
      <span className="micro-label">Voidwallz / Your personal space</span>
      <h2 className="vw-login-title">YOUR SPACE.<br /><span>STARTS HERE.</span></h2>
      <AccountArtwork />
    </aside>
    <div className="vw-account-form"><AuthPanel initialMode={initialMode} headingLevel={1} /></div>
  </section>;
}
