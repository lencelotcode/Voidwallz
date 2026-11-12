export const LEGAL_DOCUMENTS = [
  { slug: 'privacy', label: 'Privacy Policy', title: 'Privacy Policy', path: '/privacy' },
  { slug: 'terms', label: 'Terms of Service', title: 'Terms of Service', path: '/terms' },
  { slug: 'license', label: 'License', title: 'Personal Use License', path: '/license' },
  { slug: 'cookies', label: 'Cookie Policy', title: 'Cookie & Storage Policy', path: '/cookies' },
  {
    slug: 'refunds',
    label: 'Refund Policy',
    title: 'Refund & Digital Goods Policy',
    path: '/refunds',
  },
  { slug: 'dmca', label: 'DMCA & Copyright', title: 'DMCA & Copyright Policy', path: '/dmca' },
] as const;
export const isLegalPath = (path: string) =>
  LEGAL_DOCUMENTS.some((document) => document.path === path);
