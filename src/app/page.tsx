import { headers } from "next/headers";
import Link from "next/link";
import ProductList from "@/components/ProductList";
import type { Product } from "@/types/product";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
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


export default async function HomePage() {
  const items = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <section className="relative mb-12 overflow-hidden rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500 blur-3xl opacity-50"></div>

          <div className="relative z-10 grid items-center gap-8 px-6 py-12 lg:grid-cols-2 lg:px-12 lg:py-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-sm border border-indigo-400/30">
                <Zap className="h-3 w-3 text-yellow-300" />
                <span>Yeni Sezon İndirimleri Başladı</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Tarzını Keşfet, <br />
                <span className="text-indigo-200">Fark Yarat.</span>
              </h1>

              <p className="max-w-md text-lg text-indigo-100">
                En yeni teknoloji ürünlerinde %50'ye varan indirimleri kaçırma. Sınırlı stok!
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-900/20">
                  Alışverişe Başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-indigo-700/50 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-indigo-700 border border-indigo-500/30">
                  Kategoriler
                </button>
              </div>
            </div>


            <div className="hidden lg:block ">
              <div className="relative mx-auto aspect-square w-full max-w-sm rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 p-8 backdrop-blur-sm border border-white/10">
                <div className="flex h-full w-full items-center justify-center text-indigo-200/50">
                  <ShoppingBag className="h-32 w-32" />
                </div>
                {/* Yüzen Kart Efekti */}
                <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-4 shadow-xl shadow-black/5 animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white"></div>
                      <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white"></div>
                      <div className="h-8 w-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    </div>
                    <div className="text-xs font-bold text-gray-900">
                      1k+ <span className="font-normal text-gray-500">Mutlu Müşteri</span>
                    </div>
                  </div>
                </div>
              </div>
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

        <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Öne Çıkan Ürünler
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sizin için seçtiğimiz en popüler ürünleri inceleyin.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              {items.length} Ürün Bulundu
            </span>
          </div>
        </div>

        {items.length > 0 ? (
          <ProductList items={items} />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <p className="text-gray-500">Şu an gösterilecek ürün bulunmuyor.</p>
          </div>
        )}

      </div>
    </main>
  );
}