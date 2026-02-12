"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";

function cn(...c: Array<string | false | null | undefined>) {
    return c.filter(Boolean).join(" ");
}

const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Ürünler", icon: Package },
    { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <div className="border-b border-black/10 bg-white">
            <div className="container-page flex items-center gap-2 py-3">
                <div className="mr-2 text-sm font-semibold text-slate-900">Yönetim</div>

                {items.map((it) => {
                    const Icon = it.icon;
                    const active =
                        pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));

                    return (
                        <Link
                            key={it.href}
                            href={it.href}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                                active
                                    ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                                    : "text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {it.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
