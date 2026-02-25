import { headers } from "next/headers";
import ProductList from "@/components/ProductList";
import FilterBar from "@/components/FilterBar";
import type { Product } from "@/types/product";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Zap,
  Tag
} from "lucide-react";



async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

async function getProducts(): Promise<Product[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/products`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return [];
    return (data.items ?? []) as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const items = await getProducts();
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort;

  let filteredItems = items.filter((item) => {
    if (!category || category === "Hepsi") return true;

    const selectedCat = category.toLowerCase().trim();
    const itemTitle = (item.title || "").toLowerCase().trim();



    if (selectedCat === "telefon" && (itemTitle.includes("telefon") || itemTitle.includes("iphone"))) return true;
    if (selectedCat === "bilgisayar" && (itemTitle.includes("laptop") || itemTitle.includes("pc") || itemTitle.includes("bilgisayar"))) return true;
    if (selectedCat === "oyun konsolu" && (itemTitle.includes("playstation") || itemTitle.includes("xbox") || itemTitle.includes("konsol") || itemTitle.includes("ps5"))) return true;
    if (selectedCat === "tablet" && itemTitle.includes("tablet")) return true;
    if (selectedCat === "şarj aleti" && itemTitle.includes("şarj")) return true;
    if (selectedCat === "saat" && itemTitle.includes("saat")) return true;

    return false;
  });

  if (sort === "price-asc") {
    filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
  }

  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-8">

        <section className="relative mb-12 overflow-hidden rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
          <div className="relative z-10 grid items-center gap-8 px-6 py-12 lg:grid-cols-2 lg:px-12 lg:py-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-sm border border-indigo-400/30">
                <Zap className="h-3 w-3 text-yellow-300" />
                <span>Yeni Sezon İndirimleri Başladı</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Teknolojiyi Keşfet, <br />
                <span className="text-indigo-200">Fark Yarat.</span>
              </h1>
              <p className="max-w-md text-lg text-indigo-100">
                En yeni teknoloji ürünlerinde indirimleri kaçırma. Sınırlı stok!
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Hızlı Teslimat", desc: "Aynı gün kargo imkanı" },
            { icon: ShieldCheck, title: "Güvenli Ödeme", desc: "256-bit SSL koruması" },
            { icon: Tag, title: "Uygun Fiyat", desc: "En iyi fiyat garantisi" },
            { icon: ShoppingBag, title: "Kolay İade", desc: "14 gün içinde iade hakkı" },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Öne Çıkan Ürünler
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {category && category !== "Hepsi" ? `${category} kategorisi için sonuçlar.` : "Sizin için seçtiğimiz en popüler ürünleri inceleyin."}
            </p>
          </div>

          <FilterBar />

          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              {filteredItems.length} Ürün Bulundu
            </span>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <ProductList items={filteredItems} />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <p className="text-gray-500">Bu kriterlere uygun ürün bulunamadı.</p>
          </div>
        )}
      </div>
    </main>
  );
}

