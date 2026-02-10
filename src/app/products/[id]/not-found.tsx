import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto max-w-2xl p-6 space-y-4">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="opacity-70">Bu ürün yok veya silinmiş olabilir.</p>
            <Link
                href="/"
                className="inline-block rounded-2xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
                Back to products
            </Link>
        </main>
    );
}
