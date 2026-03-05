import AdminProductsClient from "@/components/AdminProductsClient";

export default function AdminProductsListPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ürün Yönetimi</h1>
                <p className="text-slate-500">Tüm mağaza ürünlerini buradan yönetebilirsiniz.</p>
            </div>
            <AdminProductsClient />
        </main>
    );
}