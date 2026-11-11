import { beginDownload, updateDownload, finishDownload } from "../lib/downloadFeedback";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownToLine, ChevronLeft, ChevronRight, FolderDown, Link2, LoaderCircle, X } from "lucide-react";
import JSZip from "jszip";
import { VoidPack } from "../types";
import { useDialog } from "../hooks/useDialog";
import { useWallpaperStats } from "../hooks/useWallpaperStats";
import { downloadWallpaperAsPng, fetchImageAsPngArrayBuffer } from "../lib/downloadWallpaper";
import ArtworkStage from "./ArtworkStage";
export default function PackModal({ selectedPack, onClose, isOledOptimized = false }: { selectedPack: VoidPack | null; onClose: () => void; isOledOptimized?: boolean }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState("screen");
  const [busy, setBusy] = useState<"single" | "zip" | null>(null);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const copy = async () => {
    if (!selectedPack) return;
    try { await navigator.clipboard.writeText(`${window.location.origin}/packs#${encodeURIComponent(selectedPack.id)}`); setFailed(false); setStatus("Pack link copied."); }
    catch { setFailed(true); setStatus("Couldn't copy the pack link. Please try again."); }
  };
  const ref = useDialog(Boolean(selectedPack), onClose);
  const { recordDownload } = useWallpaperStats();
  useEffect(() => { setIndex(0); setMode("screen"); setStatus(""); setFailed(false); }, [selectedPack?.id]);
  useEffect(() => {
    if (!selectedPack) return;
    const key = (event: KeyboardEvent) => { if (busy) return; if (event.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1)); if (event.key === "ArrowRight") setIndex((i) => Math.min(selectedPack.items.length - 1, i + 1)); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [selectedPack, busy]);
  if (!selectedPack) return null;
  const current = selectedPack.items[index] || selectedPack.items[0];
  const download = async (kind: "single" | "zip") => {
    if (busy || !current) return;
    setBusy(kind); setFailed(false); setStatus(""); setProgress(0);
    const activity = kind === "zip" ? beginDownload(selectedPack.title, selectedPack.featuredImage || current.previewUrl, "pack", selectedPack.items.length) : null;
    try {
      if (kind === "single") {
        if (!await downloadWallpaperAsPng(current.originalUrl || current.previewUrl, current.title, current.previewUrl)) throw new Error();
        recordDownload(current.id);
      } else {
        const zip = new JSZip();
        zip.file("README.txt", `${selectedPack.title}\n${selectedPack.items.length} wallpapers from Voidwallz.\nPersonal use: https://voidwallz.live/license\n`);
        for (let i = 0; i < selectedPack.items.length; i++) {
          const item = selectedPack.items[i];
          const data = await fetchImageAsPngArrayBuffer(item.originalUrl || item.previewUrl, item.previewUrl);
          zip.file(`${String(i + 1).padStart(2,"0")}-${item.title.replace(/[^a-z0-9-]/gi,"-")}.png`, data);
          setProgress(i + 1);
          if (activity !== null) updateDownload(activity, { prepared: i + 1 });
        }
        if (activity !== null) updateDownload(activity, { phase: "packing" });
        const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
        const url = URL.createObjectURL(blob); const link = document.createElement("a");
        link.href = url; link.download = `Voidwallz-${selectedPack.title.replace(/[^a-z0-9-]/gi,"-")}.zip`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        selectedPack.items.forEach((item) => recordDownload(item.id)); recordDownload(selectedPack.id);
      }
      if (activity !== null) finishDownload(activity, true);
      setStatus(kind === "zip" ? "Pack download complete." : "Download complete.");
    } catch { if (activity !== null) finishDownload(activity, false); setFailed(true); setStatus("Download failed. Please try again."); }
    finally { setBusy(null); }
  };
  return createPortal(<div ref={ref} className="vw-dialog" role="dialog" aria-modal="true" aria-labelledby="pack-detail-title" tabIndex={-1}><div className="vw-dialog-backdrop" onClick={onClose} /><div className={`vw-dialog-panel vw-detail-panel ${selectedPack.device === "mobile" ? "vw-phone-panel" : ""}`}><div className="vw-dialog-heading"><span className="micro-label">Voidwallz / pack preview</span><button type="button" className="icon-button" data-autofocus aria-label="Close pack preview" onClick={onClose}><X size={22} /></button></div><div className="vw-detail-layout"><div className="vw-detail-visual"><div className="vw-detail-tools"><div className="segmented-control" role="group" aria-label="Pack preview style"><button type="button" aria-pressed={mode === "screen"} onClick={() => setMode("screen")}>Screen preview</button><button type="button" aria-pressed={mode === "art"} onClick={() => setMode("art")}>Full artwork</button></div><span className="micro-label">{selectedPack.device === "desktop" ? "Desktop" : "Phone"}</span></div>{current ? <><ArtworkStage wallpaper={current} mode={mode} isOledOptimized={isOledOptimized} /><div className="vw-pack-thumbs" aria-label="Images in this pack">{selectedPack.items.map((item, i) => <button type="button" key={item.id} disabled={Boolean(busy)} aria-label={`Preview ${item.title}`} aria-pressed={i === index} onClick={() => setIndex(i)}><img src={item.tinyUrl || item.previewUrl} alt="" /></button>)}</div><div className="vw-detail-pagination"><button className="text-link" type="button" disabled={index === 0 || Boolean(busy)} onClick={() => setIndex(index - 1)}><ChevronLeft size={17} />Previous</button><span className="micro-label">{index + 1} / {selectedPack.items.length}</span><button className="text-link" type="button" disabled={index >= selectedPack.items.length - 1 || Boolean(busy)} onClick={() => setIndex(index + 1)}>Next<ChevronRight size={17} /></button></div></> : <p className="vw-empty">This pack has no images yet.</p>}</div><div className="vw-detail-info"><span className="micro-label">{selectedPack.serial}</span><h2 id="pack-detail-title">{selectedPack.title}</h2><p className="vw-detail-intro">{selectedPack.tagline}</p><dl className="vw-spec-list"><div><dt>Collection</dt><dd>{selectedPack.items.length} {selectedPack.items.length === 1 ? "image" : "images"}</dd></div><div><dt>Category</dt><dd>{selectedPack.category}</dd></div><div><dt>Selected image</dt><dd>{current?.title || "None"}</dd></div></dl><button className="outline-button" type="button" onClick={copy}>Copy pack link<Link2 size={18} /></button><div className="vw-download-block"><button className="btn btn--primary vw-button" type="button" disabled={Boolean(busy) || !current} onClick={() => void download("zip")}>{busy === "zip" ? `Preparing ${progress} / ${selectedPack.items.length}…` : "Download complete pack"}{busy === "zip" ? <LoaderCircle size={20} className="animate-spin" /> : <FolderDown size={20} />}</button><button className="outline-button" type="button" disabled={Boolean(busy) || !current} onClick={() => void download("single")}>{busy === "single" ? "Preparing image…" : "Download selected image"}<ArrowDownToLine size={20} /></button><p role="status" className={failed ? "vw-form-error" : "vw-action-status"}>{status || "ZIP pack or individual PNG. Personal use."}</p></div></div></div></div></div>, document.body);
}
