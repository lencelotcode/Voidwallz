import { motion } from "motion/react";
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

      if (!response.ok) {
        throw new Error("Transmission failed. Please try again.");
      }

      setStatus("success");
    } catch (error: any) {
      console.error("Report submission error:", error);
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-10 bg-void-black flex justify-center items-start">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <span className="text-[10px] opacity-30 uppercase tracking-[0.4em] mb-4 block font-mono">
            System Diagnostics
          </span>
          <h1 className="text-5xl md:text-6xl font-serif italic font-light tracking-tighter leading-tight text-white/90">
            Report an Anomaly.
          </h1>
          <p className="text-sm opacity-50 mt-6 max-w-lg leading-relaxed font-light">
            Encountered a glitch in the void? Transmit the details below. Our
            engineering collective will analyze the signal and restore harmony.
          </p>
        </motion.div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center space-y-6"
          >
            <CheckCircle2
              className="w-16 h-16 text-white/80 opacity-80"
              strokeWidth={1}
            />
            <div>
              <h2 className="text-2xl font-serif italic mb-2">
                Transmission received.
              </h2>
              <p className="text-sm opacity-50 font-mono tracking-widest uppercase">
                Signal logged successfully
              </p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 border-b border-white/30 pb-1 text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              Send Another Signal
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-10"
          >
            <div className="space-y-8 border-t border-white/5 pt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest opacity-50">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Visual glitch on mobile view"
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest opacity-50">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="For follow-up comms"
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest opacity-50">
                    Device
                  </label>
                  <select
                    name="device"
                    className="w-full bg-void-black border-b border-white/20 pb-2 text-sm text-white/80 focus:outline-none focus:border-white/60 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="desktop">Desktop / Laptop</option>
                    <option value="mobile">Mobile / Tablet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest opacity-50">
                    Browser
                  </label>
                  <select
                    name="browser"
                    className="w-full bg-void-black border-b border-white/20 pb-2 text-sm text-white/80 focus:outline-none focus:border-white/60 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="chrome">Chrome / Chromium</option>
                    <option value="safari">Safari</option>
                    <option value="firefox">Firefox</option>
                    <option value="edge">Edge</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono tracking-widest opacity-50">
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe the anomaly in detail. What did you expect to happen?"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 resize-none rounded-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-mono tracking-widest opacity-50 block">
                  Visual Evidence (Optional)
                </label>
                <div
                  className="border border-dashed border-white/20 bg-white/[0.02] p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-colors rounded-sm hover-trigger group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    name="screenshot"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <UploadCloud
                    className="w-8 h-8 opacity-40 mb-3 group-hover:scale-110 transition-transform"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs opacity-60">
                    {selectedFile
                      ? selectedFile.name
                      : "Attach Screenshot (.png, .jpg)"}
                  </span>
                </div>
              </div>
            </div>

            {status === "error" && (
              <div className="text-red-400 text-xs font-mono tracking-wider">
                {errorMessage}
              </div>
            )}

            <div className="pt-8 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-white text-black px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all hover-trigger flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <>
                    <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  "Transmit Report"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}
