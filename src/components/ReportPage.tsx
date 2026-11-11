import MotionGraphic from "./MotionGraphic";
import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-collected data
  const [systemInfo, setSystemInfo] = useState({
    userAgent: "",
    viewport: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setSystemInfo({
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("userAgent", systemInfo.userAgent);
    formData.append("viewport", systemInfo.viewport);
    formData.append("currentRoute", window.location.href);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Report could not be sent. Please try again.");
      }

      setStatus("success");
    } catch (error: any) {
      console.error("Report submission error:", error);
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  return <section className="vw-page vw-support page-shell"><header className="vw-page-heading"><MotionGraphic variant="report" className="vw-heading-graphic" /><span className="micro-label">Voidwallz / support</span><h1>LET’S FIX<br />THAT<span className="vw-period">.</span></h1><p>Something not working? Tell us what happened and what you expected. A screenshot helps us find the issue.</p></header><div className="vw-support-layout"><aside><h2>Help us see it.</h2><p>Include the page you were on and the steps that led to the problem.</p><p className="micro-label">Prefer email?</p><a className="text-link" href="mailto:voidwallzbusiness@gmail.com">voidwallzbusiness@gmail.com</a></aside>{status === "success" ? <div className="vw-form-success" role="status"><CheckCircle2 size={44} strokeWidth={1.5} /><h2>Report received.</h2><p>Thanks for helping improve Voidwallz.</p><button className="outline-button" type="button" onClick={() => setStatus("idle")}>Send another report</button></div> : <form className="vw-form" onSubmit={handleSubmit}><div className="vw-field-row"><div className="vw-field"><label htmlFor="report-title">Issue title</label><input type="text" id="report-title" name="title" placeholder="e.g. Image doesn't load on my phone" required /></div><div className="vw-field"><label htmlFor="report-email">Email <span>(optional)</span></label><input type="email" id="report-email" name="email" placeholder="For a follow-up" /></div></div><div className="vw-field-row"><div className="vw-field"><label htmlFor="report-device">Device</label><select name="device" id="report-device"><option value="desktop">Desktop / laptop</option><option value="mobile">Mobile / tablet</option><option value="other">Other</option></select></div><div className="vw-field"><label htmlFor="report-browser">Browser</label><select id="report-browser" name="browser"><option value="chrome">Chrome / Chromium</option><option value="safari">Safari</option><option value="firefox">Firefox</option><option value="edge">Edge</option><option value="other">Other</option></select></div></div><div className="vw-field"><label htmlFor="report-description">What happened?</label><textarea id="report-description" name="description" rows={6} required placeholder="What did you do, and what went wrong?" /></div><div className="vw-field"><label htmlFor="report-screenshot">Screenshot <span>(optional)</span></label><div className="vw-file-field"><UploadCloud size={24} /><input id="report-screenshot" type="file" name="screenshot" accept="image/*" ref={fileInputRef} onChange={handleFileChange} /><span className="micro-label">{selectedFile?.name || "Choose an image to attach"}</span></div></div><div className="vw-consent"><input type="checkbox" id="form-consent" name="consent" required /><label htmlFor="form-consent">I consent to the use of this report, attached screenshot, and browser/device information for resolving the issue, as described in the <a href="/privacy">Privacy Policy</a>.</label></div>{status === "error" && <p className="vw-form-error" role="alert">{errorMessage}</p>}<button type="submit" className="btn btn--primary vw-button" disabled={status === "submitting"}>{status === "submitting" ? "Sending report…" : "Send report"}<span aria-hidden="true">↗</span></button></form>}</div></section>;
}
