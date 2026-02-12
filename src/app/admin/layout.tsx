import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <header className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Admin Panel</h1>
                    <nav className="flex gap-4 text-sm">
                        <Link className="underline" href="/admin">Dashboard</Link>
                        <Link className="underline" href="/admin/orders">Orders</Link>
                        <Link className="underline" href="/">Site</Link>
                        <Link className="underline" href="/admin/products">Products</Link>

                    </nav>
                </div>
            </header>

            <main className="p-6">{children}</main>
        </div>
    );
}
