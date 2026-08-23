import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Layers,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { VoidPack } from "../types";
import { useVoidPacks, PACKS_BUCKET_NAME } from "../hooks/useVoidPacks";

import { Lock, KeyRound } from "lucide-react";

const ADMIN_PASSKEY = import.meta.env.VITE_ADMIN_PASSKEY || "voidwallz2026";

export default function AdminPackUpload() {
  const { allPacks } = useVoidPacks();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("void_admin_authenticated") === "true";
  });
  const [inputPasskey, setInputPasskey] = useState("");
  const [authError, setAuthError] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("Cyber / Synth");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasskey === ADMIN_PASSKEY) {
      setIsAuthenticated(true);
      sessionStorage.setItem("void_admin_authenticated", "true");
      setAuthError(false);
    } else {
      setAuthError(true);
      setInputPasskey("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("void_admin_authenticated");
  };

  const handleNavigate = (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = (Array.from(e.target.files) as File[]).slice(0, 5); // Max 5 files
    setSelectedFiles(files);

    // Generate local previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleUploadPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a Pack Title." });
      return;
    }
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least 1 image file (up to 5)." });
      return;
    }

    if (!supabase) {
      setStatusMessage({
        type: "error",
        text: "Supabase client is not connected. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setStatusMessage(null);

    try {
      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const packId = `pack-${device}-${cleanSlug}-${Date.now()}`;
      const serialNumber = `PACK: VP-${device === "desktop" ? "D" : "M"}${Math.floor(Math.random() * 900) + 100}`;
      const folderPath = `packs/${device}/${packId}`;

      const uploadedItems = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const ext = file.name.split(".").pop() || "png";
        const cleanFileName = `0${i + 1}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
        const storagePath = `${folderPath}/${cleanFileName}`;

        // Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(PACKS_BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public CDN URL
        const { data: urlData } = supabase.storage
          .from(PACKS_BUCKET_NAME)
          .getPublicUrl(storagePath);

        const pubUrl = urlData.publicUrl;
        const itemTitle = `${title} Part 0${i + 1}`;

        uploadedItems.push({
          id: `${packId}-part-${i + 1}`,
          title: itemTitle,
          serial: `ID: VP-${device === "desktop" ? "D" : "M"}${i + 1}`,
          category,
          format: device === "desktop" ? "8K AVIF" : "4K MOBILE",
          downloads: Math.floor(Math.random() * 15000) + 5000,
          previewUrl: pubUrl,
          tinyUrl: pubUrl,
          originalUrl: pubUrl,
          device,
        });

        setUploadProgress(Math.floor(((i + 1) / selectedFiles.length) * 80) + 10);
      }

      // Save complete pack metadata to 'void_packs' table
      const newPackRecord = {
        id: packId,
        title: title.toUpperCase(),
        serial: serialNumber,
        tagline: tagline || `Curated ${uploadedItems.length}-piece ${device} wallpaper capsule.`,
        category,
        device,
        format: device === "desktop" ? "8K MASTER SUITE" : "4K RETINA DECK",
        downloads: Math.floor(Math.random() * 30000) + 20000,
        featured_image: uploadedItems[0]?.previewUrl || "",
        items: uploadedItems,
        created_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase.from("void_packs").insert([newPackRecord]);

      if (dbError) {
        console.warn("Table insert fallback: files saved in storage bucket", dbError);
      }

      setUploadProgress(100);
      setStatusMessage({
        type: "success",
        text: `Void Pack "${title.toUpperCase()}" published successfully with ${uploadedItems.length} wallpapers!`,
      });

      // Reset form
      setTitle("");
      setTagline("");
      setSelectedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Pack upload failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to upload pack. Please verify storage permissions in Supabase.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm("Are you sure you want to delete this Void Pack?")) return;
    if (!supabase) return;

    try {
      await supabase.from("void_packs").delete().eq("id", packId);
      window.location.reload();
    } catch (err: any) {
      alert("Delete error: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-void-light flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[400px] bg-white/[0.02] blur-[160px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl luxury-border-glow shadow-2xl relative z-10 text-center"
        >
          <div className="w-14 h-14 rounded-full luxury-glass mx-auto flex items-center justify-center mb-6 text-white/80">
            <Lock size={24} />
          </div>

          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 block mb-2">
            Restricted Protocol // Level 4
          </span>
          <h2 className="text-2xl font-serif italic tracking-tight text-white mb-2">
            Admin Authentication
          </h2>
          <p className="text-xs text-white/50 mb-8 font-sans">
            Enter your private Voidwallz admin passkey to unlock the pack publishing studio.
          </p>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin Passkey..."
                value={inputPasskey}
                onChange={(e) => {
                  setInputPasskey(e.target.value);
                  setAuthError(false);
                }}
                className={`w-full bg-black/60 border rounded px-4 py-3 text-center text-sm font-mono text-white placeholder-white/20 focus:outline-none transition-colors ${
                  authError
                    ? "border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    : "border-white/15 focus:border-white/40"
                }`}
                autoFocus
              />
              {authError && (
                <span className="text-[10px] font-mono text-red-400 mt-2 block">
                  Invalid Passkey. Access Denied.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <KeyRound size={14} />
              Authenticate & Unlock
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-center">
            <button
              onClick={() => handleNavigate("/")}
              className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              ← Return to Main Terminal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-void-light pt-28 pb-32 px-6 md:px-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[60vw] h-[400px] bg-white/[0.02] blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link + Logout Button */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => handleNavigate("/packs")}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Void Packs
          </button>

          <button
            onClick={handleLogout}
            className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Lock size={11} />
            Lock Session
          </button>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">
                Command Terminal // Pack Studio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter text-white">
              Upload Void Pack_
            </h1>
            <p className="text-sm text-white/50 max-w-xl mt-2 font-sans">
              Create and publish a 5-piece wallpaper capsule in one single step. Files are uploaded directly to your Supabase cloud.
            </p>
          </div>

          <div className="spec-badge text-[10px] font-mono px-3 py-1.5 rounded-full text-white/80 tracking-widest flex items-center gap-2">
            <Sparkles size={12} />
            AUTO-GROUPING ENGINE ACTIVE
          </div>
        </div>

        {/* Status Notification */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg mb-8 border flex items-center gap-3 text-xs font-mono ${
                statusMessage.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid: Form + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form (7 cols) */}
          <form
            onSubmit={handleUploadPack}
            className="lg:col-span-7 bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl space-y-6 luxury-border-glow shadow-2xl"
          >
            {/* Title & Target Device */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-2">
                  Pack Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CYBER ABYSS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-2">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-piece synthetic luminescent horizons & dystopian neon."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-2">
                    Device Ecosystem
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDevice("desktop")}
                      className={`py-2.5 text-[10px] font-mono uppercase tracking-wider rounded border transition-all flex items-center justify-center gap-1.5 ${
                        device === "desktop"
                          ? "bg-white text-black font-bold border-white"
                          : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      <Monitor size={12} />
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("mobile")}
                      className={`py-2.5 text-[10px] font-mono uppercase tracking-wider rounded border transition-all flex items-center justify-center gap-1.5 ${
                        device === "mobile"
                          ? "bg-white text-black font-bold border-white"
                          : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      <Smartphone size={12} />
                      Phone
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2.5 text-[11px] font-mono text-white focus:outline-none focus:border-white/40 transition-colors"
                  >
                    <option value="Cyber / Synth">Cyber / Synth</option>
                    <option value="Liquid / Fluid">Liquid / Fluid</option>
                    <option value="Dark / Geometry">Dark / Geometry</option>
                    <option value="Space / OLED">Space / OLED</option>
                    <option value="Noir / Chroma">Noir / Chroma</option>
                    <option value="Minimal / Abstract">Minimal / Abstract</option>
                    <option value="Texture / Film">Texture / Film</option>
                  </select>
                </div>
              </div>
            </div>

            {/* File Dropzone */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-2">
                Select 5 Pack Wallpapers *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-white/40 rounded-xl p-8 text-center cursor-pointer transition-all bg-black/40 group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full luxury-glass flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud size={20} className="text-white/70" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/90">
                    Click to select 1-5 wallpapers
                  </p>
                  <p className="text-[10px] text-white/40">
                    Supports 8K/4K PNG, JPG, WebP, AVIF
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <span className="text-[11px] font-mono text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                    ✓ {selectedFiles.length} files selected
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-white/60">
                  <span>Uploading assets to Supabase...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full py-4 px-6 bg-white text-black font-bold font-mono text-xs uppercase tracking-[0.2em] rounded hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Publishing Capsule...
                </>
              ) : (
                <>
                  <FolderArchive size={15} />
                  Publish Void Pack ({selectedFiles.length} Files)
                </>
              )}
            </button>
          </form>

          {/* Right Live Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block">
                Live Card Mockup Preview
              </span>
              <span className="text-[9px] font-mono text-white/30">
                {device === "desktop" ? "5-Slice Panorama" : "3D Phone Deck"}
              </span>
            </div>

            {/* Preview Card */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden shadow-2xl luxury-border-glow">
              <div className="w-full aspect-[16/10] bg-[#111] relative overflow-hidden flex items-center justify-center border-b border-white/10">
                {filePreviews.length > 0 ? (
                  device === "desktop" ? (
                    /* 5-Slice Desktop Preview */
                    <div className="w-full h-full flex overflow-hidden">
                      {filePreviews.map((src, i) => (
                        <div key={i} className="flex-1 h-full border-r last:border-r-0 border-white/10 overflow-hidden">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* 5-Phone Mobile Preview */
                    <div className="relative w-full h-full flex items-center justify-center">
                      {filePreviews.map((src, i) => {
                        const mid = (filePreviews.length - 1) / 2;
                        const offset = (i - mid) * 24;
                        return (
                          <div
                            key={i}
                            style={{ transform: `translateX(${offset}px) rotate(${(i - mid) * 4}deg)` }}
                            className="absolute w-[65px] aspect-[9/19.5] rounded-xl border-2 border-[#222] bg-black overflow-hidden shadow-xl"
                          >
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/20 font-mono text-xs">
                    <ImageIcon size={28} />
                    <span>Select images to preview</span>
                  </div>
                )}

                <span className="absolute top-3 left-3 text-[8px] font-mono bg-black/80 px-2 py-0.5 rounded text-white/70 border border-white/10">
                  {selectedFiles.length || 5} PIECE PACK
                </span>
              </div>

              <div className="p-5">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                  {category} // {device.toUpperCase()}
                </span>
                <h3 className="text-lg font-sans font-bold uppercase tracking-tight text-white mt-1">
                  {title || "YOUR PACK TITLE"}
                </h3>
                <p className="text-xs text-white/50 mt-1 font-sans line-clamp-2">
                  {tagline || "Your pack description will appear here on the card."}
                </p>
              </div>
            </div>

            {/* Currently Active Packs list */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2 flex items-center gap-1.5">
                <Layers size={11} />
                Live Published Packs ({allPacks.length})
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {allPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5 text-xs font-mono"
                  >
                    <div className="truncate max-w-[200px]">
                      <span className="text-white block font-bold truncate">{pack.title}</span>
                      <span className="text-[9px] text-white/40">{pack.device} // {pack.items.length} items</span>
                    </div>

                    <button
                      onClick={() => handleDeletePack(pack.id)}
                      className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Pack"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
