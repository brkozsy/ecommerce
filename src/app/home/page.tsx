"use client";

import FilterBar from "@/components/FilterBar";
import HomeProductsClient from "@/components/HomeProductsClient";
import { ShoppingBag, Truck, ShieldCheck, Zap, Tag } from "lucide-react";

export default function HomePage() {
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
          {(
            [
              { icon: Truck, title: "Hızlı Teslimat", desc: "Aynı gün kargo imkanı" },
              { icon: ShieldCheck, title: "Güvenli Ödeme", desc: "256-bit SSL koruması" },
              { icon: Tag, title: "Uygun Fiyat", desc: "En iyi fiyat garantisi" },
              { icon: ShoppingBag, title: "Kolay İade", desc: "14 gün içinde iade hakkı" },
            ] as const
          ).map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
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
              Sizin için seçtiğimiz en popüler ürünleri inceleyin.
            </p>
          </div>

          <FilterBar />
        </div>

        <HomeProductsClient />
      </div>
    </main>
  );
}