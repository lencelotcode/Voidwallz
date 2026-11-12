import { canonicalUrl, SITE_ORIGIN } from './siteUrls';

export const SITE_NAME = 'Voidwallz';
export const DEFAULT_TITLE = 'Voidwallz | Wallpaper Beyond Reality';
export const DEFAULT_DESCRIPTION =
  'Find wallpapers and collections for your desktop and phone. Preview, save and download your next screen.';
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
}

export const STATIC_META: Record<string, { title: string; description: string }> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/packs': {
    title: 'Wallpaper Packs | Voidwallz',
    description:
      'Browse coordinated wallpaper collections for desktop and phone. Preview each image and download the full pack or a single image.',
  },
  '/desktop': {
    title: 'Desktop Wallpapers | Voidwallz',
    description:
      'Browse, save and download wallpapers for desktop and laptop screens. Preview the artwork before you download.',
  },
  '/mobile': {
    title: 'Phone Wallpapers | Voidwallz',
    description:
      'Browse portrait wallpapers for your phone. Preview the artwork and download the original image.',
  },
  '/updates': {
    title: 'Journal & Updates | Voidwallz',
    description: 'A record of features, experiments and visual changes at Voidwallz.',
  },
  '/report': {
    title: 'Report an Issue | Voidwallz',
    description: 'Tell us about a problem with Voidwallz so we can help fix it.',
  },
  '/privacy': {
    title: 'Privacy Policy | Voidwallz',
    description: 'How Voidwallz handles your information.',
  },
  '/terms': {
    title: 'Terms of Service | Voidwallz',
    description: 'Terms for using Voidwallz and its wallpaper collection.',
  },
  '/license': {
    title: 'Image Licence | Voidwallz',
    description: 'Personal use terms for Voidwallz wallpapers.',
  },
  '/cookies': {
    title: 'Cookie & Storage Policy | Voidwallz',
    description: 'How Voidwallz uses cookies and local device storage.',
  },
  '/refunds': {
    title: 'Refund Policy | Voidwallz',
    description: 'Voidwallz refund and digital goods policy.',
  },
  '/dmca': {
    title: 'Copyright Policy | Voidwallz',
    description: 'Copyright information and contact details for Voidwallz.',
  },
  '/admin': {
    title: 'Publishing Studio | Voidwallz',
    description: 'Voidwallz pack publishing tools.',
  },
};

export function wallpaperMeta(
  wallpaper: { title: string; device: 'desktop' | 'mobile'; previewUrl?: string },
  url: string,
): PageMeta {
  const screen = wallpaper.device === 'desktop' ? 'Desktop' : 'Phone';
  return {
    title: `${wallpaper.title} — ${screen} Wallpaper | Voidwallz`,
    description: `${wallpaper.title} — a ${screen.toLowerCase()} wallpaper by Voidwallz. Preview the artwork and download the original image.`,
    image: wallpaper.previewUrl,
    imageAlt: `${wallpaper.title} — ${screen.toLowerCase()} wallpaper`,
    url,
  };
}

export function resolvePageMeta(meta: PageMeta) {
  let image = DEFAULT_IMAGE;
  try {
    const candidate = new URL(meta.image ?? DEFAULT_IMAGE, SITE_ORIGIN);
    if (candidate.protocol === 'https:' && !candidate.username && !candidate.password)
      image = candidate.href;
  } catch {
    /* Use the branded fallback for an invalid image URL. */
  }
  return {
    title: meta.title,
    description: meta.description ?? DEFAULT_DESCRIPTION,
    image,
    imageAlt:
      image === DEFAULT_IMAGE
        ? 'Voidwallz — wallpapers for desktop and phone'
        : (meta.imageAlt ?? meta.title),
    url: canonicalUrl(meta.url ?? '/'),
  };
}

export function socialTags(
  meta: PageMeta,
): Array<{ attr: 'name' | 'property'; key: string; content: string }> {
  const resolved = resolvePageMeta(meta);
  const properties: Record<string, string> = {
    'og:type': 'website',
    'og:site_name': SITE_NAME,
    'og:locale': 'en_GB',
    'og:title': resolved.title,
    'og:description': resolved.description,
    'og:url': resolved.url,
    'og:image': resolved.image,
    'og:image:secure_url': resolved.image,
    'og:image:alt': resolved.imageAlt,
  };
  // Only assert dimensions we actually know; phone artwork is not 1200 × 630.
  if (resolved.image === DEFAULT_IMAGE) {
    Object.assign(properties, {
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
    });
  }
  const names: Record<string, string> = {
    description: resolved.description,
    'twitter:card': 'summary_large_image',
    'twitter:site': '@Voidwallz',
    'twitter:title': resolved.title,
    'twitter:description': resolved.description,
    'twitter:url': resolved.url,
    'twitter:image': resolved.image,
    'twitter:image:alt': resolved.imageAlt,
  };
  return [
    ...Object.entries(properties).map(([key, content]) => ({
      attr: 'property' as const,
      key,
      content,
    })),
    ...Object.entries(names).map(([key, content]) => ({ attr: 'name' as const, key, content })),
  ];
}
