import { getPrisma } from "@/lib/prisma";

export type NavItem = { label: string; href: string };

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
};

export type SiteProfile = {
  siteName: string;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  showTopBar: boolean;
  headerNavItems: NavItem[];
  socialLinks: SocialLinks;
  aboutUsContent: string | null;
  contactPageContent: string | null;
  footerTagline: string | null;
  footerCopyright: string | null;
};

const DEFAULT_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/categories" },
  { label: "Tags", href: "/tags" },
  { label: "All Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

function parseNavItems(raw: unknown): NavItem[] {
  if (!Array.isArray(raw)) return DEFAULT_NAV;
  const out: NavItem[] = [];
  for (const item of raw) {
    if (item && typeof item === "object" && "label" in item && "href" in item) {
      const label = String((item as { label: unknown }).label).trim();
      const href = String((item as { href: unknown }).href).trim();
      if (label && href) out.push({ label, href });
    }
  }
  return out.length > 0 ? out : DEFAULT_NAV;
}

function parseSocialLinks(raw: unknown): SocialLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const links: SocialLinks = {};
  const keys = ["facebook", "twitter", "instagram", "linkedin", "youtube"] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) links[k] = v.trim();
  }
  return links;
}

export async function getSiteProfile(): Promise<SiteProfile> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.storeSettings === "undefined") {
    return {
      siteName: "Ecom Store",
      logoUrl: null,
      contactEmail: "hello@ecomstore.com",
      contactPhone: "+1 234 567 890",
      showTopBar: true,
      headerNavItems: DEFAULT_NAV,
      socialLinks: {},
      aboutUsContent: null,
      contactPageContent: null,
      footerTagline: "Curated products, simple shopping. Designed with care.",
      footerCopyright: null,
    };
  }

  const s = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });

  if (!s) {
    return {
      siteName: "Ecom Store",
      logoUrl: null,
      contactEmail: "hello@ecomstore.com",
      contactPhone: "+1 234 567 890",
      showTopBar: true,
      headerNavItems: DEFAULT_NAV,
      socialLinks: {},
      aboutUsContent: null,
      contactPageContent: null,
      footerTagline: "Curated products, simple shopping. Designed with care.",
      footerCopyright: null,
    };
  }

  return {
    siteName: s.siteName?.trim() || "Ecom Store",
    logoUrl: s.logoUrl?.trim() || null,
    contactEmail: s.contactEmail?.trim() || null,
    contactPhone: s.contactPhone?.trim() || null,
    showTopBar: s.showTopBar ?? true,
    headerNavItems: parseNavItems(s.headerNavItems),
    socialLinks: parseSocialLinks(s.socialLinks),
    aboutUsContent: s.aboutUsContent?.trim() || null,
    contactPageContent: s.contactPageContent?.trim() || null,
    footerTagline: s.footerTagline?.trim() || null,
    footerCopyright: s.footerCopyright?.trim() || null,
  };
}
