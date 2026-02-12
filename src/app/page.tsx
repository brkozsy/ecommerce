import { headers } from "next/headers";
import ProductList from "@/components/ProductList";
import type { Product } from "@/types/product";

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

export default async function HomePage() {
  const items = await getProducts();

  return (
    <main className="container-page py-8">
      {/* Hero */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-orange-500 to-sky-500 p-8 text-white shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Yeni Sezon Fırsatları
          </h1>
          <p className="mt-2 max-w-xl text-white/90">
            Next.js App Router + Firebase ile gerçek e-ticaret mantığı: admin panel,
            ürün yönetimi, stok kontrolü, sepet ve checkout.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold">
            ⭐ Bugün %20’ye varan indirim
          </div>
        </div>


      </section>

      {/* Title */}
      <section className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Products</h2>
        <p className="text-sm text-slate-600">{items.length} ürün</p>
      </section>

      <ProductList items={items} />
    </main>
  );
}
