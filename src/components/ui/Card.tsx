import { cn } from "@/lib/cn";

export default function Card({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-black/10 bg-white shadow-sm",
                className
            )}
        >
            {children}
        </div>
    );
}
