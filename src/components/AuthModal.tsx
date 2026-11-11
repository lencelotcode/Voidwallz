import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDialog } from "../hooks/useDialog";
import AuthPanel from "./AuthPanel";
export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, modalMode } = useAuth();
  const ref = useDialog(isAuthModalOpen, closeAuthModal);
  if (!isAuthModalOpen) return null;
  return createPortal(<div ref={ref} className="vw-dialog" role="dialog" aria-modal="true" aria-label="Voidwallz account" tabIndex={-1}><div className="vw-dialog-backdrop" onClick={closeAuthModal} /><div className="vw-dialog-panel vw-auth-panel"><div className="vw-dialog-heading"><span className="micro-label">Voidwallz / account</span><button className="icon-button" data-autofocus type="button" aria-label="Close account dialog" onClick={closeAuthModal}><X size={22} /></button></div><AuthPanel initialMode={modalMode} onComplete={closeAuthModal} /></div></div>, document.body);
}
