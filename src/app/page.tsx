import Link from "next/link";
import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link className="rounded-2xl border px-4 py-2" href="/cart">Cart</Link>
      </div>
      <ProductList />


    </main>
  );
}
