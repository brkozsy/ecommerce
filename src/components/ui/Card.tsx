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
                "rounded-2xl bg-gradient-to-b from-white/10 to-white/5 " +
                "ring-1 ring-white/15 backdrop-blur-xl",
                className
            )}
        >
            {children}
        </div>
    );
}
