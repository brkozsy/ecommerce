export const PRODUCT_CATEGORIES = [
    "Bilgisayar",
    "Tablet",
    "Telefon",
    "Oyun Konsolu",
    "Şarj Aleti",
    "Saat",
    "Kulaklık",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];