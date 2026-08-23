import { useState, useEffect, useMemo } from "react";
import { VoidPack } from "../types";
import { supabase } from "../lib/supabase";

export const PACKS_BUCKET_NAME = "wallpapers";
export const DESKTOP_PACKS_FOLDER = "packs/desktop";
export const MOBILE_PACKS_FOLDER = "packs/mobile";

export const VOID_PACKS_DATA: VoidPack[] = [
  // --- DESKTOP SUITES ---
  {
    id: "pack-desktop-obsidian-matrix",
    title: "OBSIDIAN MATRIX",
    serial: "PACK: VP-01",
    tagline: "Dark architectural voids & metallic geometric structures.",
    category: "Dark / Geometry",
    device: "desktop",
    format: "8K MASTER SUITE",
    downloads: 84300,
    createdAt: "2026-08-15T10:00:00Z",
    featuredImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=2880",
    items: [
      {
        id: "om-01",
        title: "Angular Drift I",
        serial: "ID: VP-01-A",
        category: "Dark / Geometry",
        format: "8K AVIF",
        downloads: 18200,
        previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "om-02",
        title: "Monolith Horizon",
        serial: "ID: VP-01-B",
        category: "Dark / Geometry",
        format: "8K AVIF",
        downloads: 21400,
        previewUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "om-03",
        title: "Chrome Aesthetic II",
        serial: "ID: VP-01-C",
        category: "3D / Silver",
        format: "8K WEBP",
        downloads: 15300,
        previewUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "om-04",
        title: "Subsurface Ray",
        serial: "ID: VP-01-D",
        category: "Dark / Render",
        format: "8K AVIF",
        downloads: 14800,
        previewUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "om-05",
        title: "Void Lattice",
        serial: "ID: VP-01-E",
        category: "Dark / Geometry",
        format: "8K AVIF",
        downloads: 14600,
        previewUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
    ],
  },
  {
    id: "pack-desktop-liquid-ether",
    title: "LIQUID ETHER",
    serial: "PACK: VP-02",
    tagline: "Dynamic fluid physics, refractive glass & atmospheric chrome swells.",
    category: "Liquid / Fluid",
    device: "desktop",
    format: "8K MASTER SUITE",
    downloads: 96200,
    createdAt: "2026-08-18T14:30:00Z",
    featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=2880",
    items: [
      {
        id: "le-01",
        title: "Liquid Void Primary",
        serial: "ID: VP-02-A",
        category: "Liquid / Fluid",
        format: "8K AVIF",
        downloads: 24100,
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "le-02",
        title: "Prismatic Wave",
        serial: "ID: VP-02-B",
        category: "Fluid / Gradient",
        format: "8K AVIF",
        downloads: 19800,
        previewUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "le-03",
        title: "Mercury Crest",
        serial: "ID: VP-02-C",
        category: "3D / Silver",
        format: "8K AVIF",
        downloads: 17400,
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "le-04",
        title: "Neon Mirage",
        serial: "ID: VP-02-D",
        category: "Fluid / Glow",
        format: "8K AVIF",
        downloads: 18900,
        previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "le-05",
        title: "Deep Current",
        serial: "ID: VP-02-E",
        category: "Minimal / Flow",
        format: "8K AVIF",
        downloads: 16000,
        previewUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
    ],
  },
  {
    id: "pack-desktop-cyber-abyss",
    title: "CYBER ABYSS",
    serial: "PACK: VP-03",
    tagline: "Synthetic luminescent horizons, wireframe vectors & dystopian neon.",
    category: "Cyber / Synth",
    device: "desktop",
    format: "8K MASTER SUITE",
    downloads: 71900,
    createdAt: "2026-08-20T11:20:00Z",
    featuredImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=95&w=2880",
    items: [
      {
        id: "ca-01",
        title: "Neon Nexus",
        serial: "ID: VP-03-A",
        category: "Cyber / Synth",
        format: "8K AVIF",
        downloads: 19400,
        previewUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "ca-02",
        title: "Vector Grid V",
        serial: "ID: VP-03-B",
        category: "Cyber / Neon",
        format: "8K AVIF",
        downloads: 13900,
        previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "ca-03",
        title: "Pulse Ray",
        serial: "ID: VP-03-C",
        category: "Cyber / Glow",
        format: "8K AVIF",
        downloads: 12500,
        previewUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "ca-04",
        title: "Circuit Void",
        serial: "ID: VP-03-D",
        category: "Cyber / Dark",
        format: "8K AVIF",
        downloads: 14100,
        previewUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
      {
        id: "ca-05",
        title: "Zero Matrix",
        serial: "ID: VP-03-E",
        category: "Cyber / Abstract",
        format: "8K AVIF",
        downloads: 12000,
        previewUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=95&w=2880",
        tinyUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=20&w=50&h=50",
        originalUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=100&w=3840",
        device: "desktop",
      },
    ],
  },

  // --- PHONE DECKS ---
  {
    id: "pack-mobile-singularity-deck",
    title: "SINGULARITY DECK",
    serial: "PACK: VP-M01",
    tagline: "High-contrast OLED deep space vectors with astronomical singularity cores.",
    category: "Space / OLED",
    device: "mobile",
    format: "4K RETINA DECK",
    downloads: 112000,
    createdAt: "2026-08-16T12:00:00Z",
    featuredImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=95&w=1440&h=2560",
    items: [
      {
        id: "sd-01",
        title: "Singularity Core",
        serial: "ID: VP-M01-A",
        category: "Space / OLED",
        format: "4K MOBILE",
        downloads: 32000,
        previewUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "sd-02",
        title: "Event Horizon",
        serial: "ID: VP-M01-B",
        category: "Dark / Cosmos",
        format: "4K MOBILE",
        downloads: 24100,
        previewUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "sd-03",
        title: "Void Aura",
        serial: "ID: VP-M01-C",
        category: "Gradient / Minimal",
        format: "4K MOBILE",
        downloads: 19800,
        previewUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "sd-04",
        title: "Obsidian Wave Vertical",
        serial: "ID: VP-M01-D",
        category: "Liquid / Fluid",
        format: "4K MOBILE",
        downloads: 21300,
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "sd-05",
        title: "Grain Matrix Pro",
        serial: "ID: VP-M01-E",
        category: "Texture / Film",
        format: "4K MOBILE",
        downloads: 14800,
        previewUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
    ],
  },
  {
    id: "pack-mobile-chroma-noir",
    title: "CHROMA NOIR",
    serial: "PACK: VP-M02",
    tagline: "Vibrant neon accents colliding with impenetrable pure black backgrounds.",
    category: "Noir / Chroma",
    device: "mobile",
    format: "4K RETINA DECK",
    downloads: 89400,
    createdAt: "2026-08-19T16:15:00Z",
    featuredImage: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=95&w=1440&h=2560",
    items: [
      {
        id: "cn-01",
        title: "Chromatic Wave",
        serial: "ID: VP-M02-A",
        category: "Noir / Chroma",
        format: "4K MOBILE",
        downloads: 26100,
        previewUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cn-02",
        title: "Spectral Flow",
        serial: "ID: VP-M02-B",
        category: "Liquid / Fluid",
        format: "4K MOBILE",
        downloads: 20300,
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cn-03",
        title: "Cosmic Filament",
        serial: "ID: VP-M02-C",
        category: "Space / Glow",
        format: "4K MOBILE",
        downloads: 17400,
        previewUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cn-04",
        title: "Prism Void",
        serial: "ID: VP-M02-D",
        category: "Abstract / Dark",
        format: "4K MOBILE",
        downloads: 14200,
        previewUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cn-05",
        title: "Titanium Ray",
        serial: "ID: VP-M02-E",
        category: "3D / Silver",
        format: "4K MOBILE",
        downloads: 11400,
        previewUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
    ],
  },
  {
    id: "pack-mobile-cyber-grid",
    title: "NEO CYBERPUNK",
    serial: "PACK: VP-M03",
    tagline: "Blade runner neon grids, holographic noise & futuristic Tokyo horizons.",
    category: "Cyber / Synth",
    device: "mobile",
    format: "4K RETINA DECK",
    downloads: 98100,
    createdAt: "2026-08-21T09:40:00Z",
    featuredImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=95&w=1440&h=2560",
    items: [
      {
        id: "cg-01",
        title: "Neon Skyline",
        serial: "ID: VP-M03-A",
        category: "Cyber / Synth",
        format: "4K MOBILE",
        downloads: 29800,
        previewUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cg-02",
        title: "Holo Grid Vector",
        serial: "ID: VP-M03-B",
        category: "Cyber / Glow",
        format: "4K MOBILE",
        downloads: 21400,
        previewUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cg-03",
        title: "Acid Stream",
        serial: "ID: VP-M03-C",
        category: "Cyber / Neon",
        format: "4K MOBILE",
        downloads: 16700,
        previewUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cg-04",
        title: "Dark Synth V",
        serial: "ID: VP-M03-D",
        category: "Dark / Retro",
        format: "4K MOBILE",
        downloads: 15900,
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
      {
        id: "cg-05",
        title: "Glitch Aura",
        serial: "ID: VP-M03-E",
        category: "Abstract / Cyber",
        format: "4K MOBILE",
        downloads: 14300,
        previewUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=95&w=1440&h=2560",
        tinyUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=20&w=50&h=89",
        originalUrl: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=100&w=2160&h=3840",
        device: "mobile",
      },
    ],
  },
];

export function useVoidPacks() {
  const [packs, setPacks] = useState<VoidPack[]>(VOID_PACKS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPacksFromSupabase() {
      if (!supabase) return;

      try {
        setLoading(true);
        // 1. Check if there is a 'void_packs' table
        const { data: dbPacks, error: dbError } = await supabase
          .from("void_packs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!dbError && dbPacks && dbPacks.length > 0) {
          const mapped: VoidPack[] = dbPacks.map((row: any) => ({
            id: row.id,
            title: row.title,
            serial: row.serial,
            tagline: row.tagline || "",
            category: row.category || "General",
            device: row.device,
            format: row.format || (row.device === "desktop" ? "8K MASTER SUITE" : "4K RETINA DECK"),
            downloads: row.downloads || 15000,
            createdAt: row.created_at,
            featuredImage: row.featured_image || row.items?.[0]?.previewUrl,
            items: row.items || [],
          }));
          setPacks(mapped);
          setLoading(false);
          return;
        }

        // 2. Zero-Hassle Smart Storage Loader (Supports both direct files & subfolders)
        const storagePacks: VoidPack[] = [];

        // Process Desktop Packs
        const { data: desktopEntries } = await supabase.storage
          .from(PACKS_BUCKET_NAME)
          .list(DESKTOP_PACKS_FOLDER);

        if (desktopEntries && desktopEntries.length > 0) {
          // Check if entries are subfolders or direct files
          const subfolders = desktopEntries.filter((e) => !e.name.includes("."));
          const directFiles = desktopEntries.filter((e) => e.name.includes(".") && !e.name.startsWith("."));

          // Handle subfolders if any exist
          for (const folder of subfolders) {
            const { data: files } = await supabase.storage
              .from(PACKS_BUCKET_NAME)
              .list(`${DESKTOP_PACKS_FOLDER}/${folder.name}`);

            if (files && files.length > 0) {
              const items = files
                .filter((f) => !f.name.startsWith("."))
                .map((f, i) => {
                  const path = `${DESKTOP_PACKS_FOLDER}/${folder.name}/${f.name}`;
                  const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                  const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                  return {
                    id: `${folder.name}-${f.name}`,
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    serial: `ID: VP-D${i + 1}`,
                    category: "Desktop Suite",
                    format: "8K AVIF",
                    downloads: 14000 + i * 1200,
                    previewUrl: pubUrl,
                    tinyUrl: pubUrl,
                    originalUrl: pubUrl,
                    device: "desktop" as const,
                  };
                });

              const packTitle = folder.name.replace(/[-_]/g, " ").toUpperCase();
              storagePacks.push({
                id: `pack-desktop-${folder.name}`,
                title: packTitle,
                serial: `PACK: VP-D${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece desktop wallpaper suite.`,
                category: "Desktop Suite",
                device: "desktop",
                format: "8K MASTER SUITE",
                downloads: 48000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }

          // Handle direct files with common prefix (e.g. Cyberpunk_1.png, Cyberpunk_2.png)
          if (directFiles.length > 0) {
            const groups: Record<string, typeof directFiles> = {};
            for (const f of directFiles) {
              const match = f.name.match(/^([a-zA-Z0-9\s_-]+?)(?:[-_ ]+(?:0?[1-9]|10)|\.[^/.]+$)/);
              const prefix = match ? match[1].replace(/[-_]/g, " ").trim() : "Master";
              if (!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(f);
            }

            for (const [groupName, groupFiles] of Object.entries(groups)) {
              const items = groupFiles.map((f, i) => {
                const path = `${DESKTOP_PACKS_FOLDER}/${f.name}`;
                const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                return {
                  id: `direct-d-${f.name}`,
                  title: title.charAt(0).toUpperCase() + title.slice(1),
                  serial: `ID: VP-D${i + 1}`,
                  category: "Desktop Suite",
                  format: "8K AVIF",
                  downloads: 16000 + i * 1100,
                  previewUrl: pubUrl,
                  tinyUrl: pubUrl,
                  originalUrl: pubUrl,
                  device: "desktop" as const,
                };
              });

              storagePacks.push({
                id: `pack-direct-desktop-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
                title: groupName.toUpperCase(),
                serial: `PACK: VP-D${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece desktop wallpaper suite.`,
                category: "Desktop Suite",
                device: "desktop",
                format: "8K MASTER SUITE",
                downloads: 52000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }
        }

        // Process Mobile Packs
        const { data: mobileEntries } = await supabase.storage
          .from(PACKS_BUCKET_NAME)
          .list(MOBILE_PACKS_FOLDER);

        if (mobileEntries && mobileEntries.length > 0) {
          const subfolders = mobileEntries.filter((e) => !e.name.includes("."));
          const directFiles = mobileEntries.filter((e) => e.name.includes(".") && !e.name.startsWith("."));

          for (const folder of subfolders) {
            const { data: files } = await supabase.storage
              .from(PACKS_BUCKET_NAME)
              .list(`${MOBILE_PACKS_FOLDER}/${folder.name}`);

            if (files && files.length > 0) {
              const items = files
                .filter((f) => !f.name.startsWith("."))
                .map((f, i) => {
                  const path = `${MOBILE_PACKS_FOLDER}/${folder.name}/${f.name}`;
                  const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                  const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                  return {
                    id: `${folder.name}-${f.name}`,
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    serial: `ID: VP-M${i + 1}`,
                    category: "Phone Deck",
                    format: "4K MOBILE",
                    downloads: 21000 + i * 1800,
                    previewUrl: pubUrl,
                    tinyUrl: pubUrl,
                    originalUrl: pubUrl,
                    device: "mobile" as const,
                  };
                });

              const packTitle = folder.name.replace(/[-_]/g, " ").toUpperCase();
              storagePacks.push({
                id: `pack-mobile-${folder.name}`,
                title: packTitle,
                serial: `PACK: VP-M${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece mobile retina deck.`,
                category: "Phone Deck",
                device: "mobile",
                format: "4K RETINA DECK",
                downloads: 64000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }

          if (directFiles.length > 0) {
            const groups: Record<string, typeof directFiles> = {};
            for (const f of directFiles) {
              const match = f.name.match(/^([a-zA-Z0-9\s_-]+?)(?:[-_ ]+(?:0?[1-9]|10)|\.[^/.]+$)/);
              const prefix = match ? match[1].replace(/[-_]/g, " ").trim() : "Master";
              if (!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(f);
            }

            for (const [groupName, groupFiles] of Object.entries(groups)) {
              const items = groupFiles.map((f, i) => {
                const path = `${MOBILE_PACKS_FOLDER}/${f.name}`;
                const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                return {
                  id: `direct-m-${f.name}`,
                  title: title.charAt(0).toUpperCase() + title.slice(1),
                  serial: `ID: VP-M${i + 1}`,
                  category: "Phone Deck",
                  format: "4K MOBILE",
                  downloads: 24000 + i * 1600,
                  previewUrl: pubUrl,
                  tinyUrl: pubUrl,
                  originalUrl: pubUrl,
                  device: "mobile" as const,
                };
              });

              storagePacks.push({
                id: `pack-direct-mobile-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
                title: groupName.toUpperCase(),
                serial: `PACK: VP-M${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece mobile retina deck.`,
                category: "Phone Deck",
                device: "mobile",
                format: "4K RETINA DECK",
                downloads: 72000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }
        }

        if (storagePacks.length > 0) {
          setPacks(storagePacks);
        }
      } catch (err: any) {
        console.warn("Supabase void pack fetch error, fallback active:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPacksFromSupabase();
  }, []);

  const desktopPacks = useMemo(() => packs.filter((p) => p.device === "desktop"), [packs]);
  const mobilePacks = useMemo(() => packs.filter((p) => p.device === "mobile"), [packs]);

  return {
    allPacks: packs,
    desktopPacks,
    mobilePacks,
    loading,
    error,
  };
}
