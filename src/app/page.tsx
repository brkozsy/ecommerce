import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductList />
    </main>
  );
}
