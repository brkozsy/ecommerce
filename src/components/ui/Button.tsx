import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
};

export default function Button({
    className,
    variant = "primary",
    size = "md",
    ...props
}: Props) {
    const base =
        "inline-flex items-center justify-center rounded-xl font-medium transition " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black " +
        "disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary:
            "bg-white text-black hover:bg-white/90 focus:ring-white",
        secondary:
            "bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/15 focus:ring-white/60",
        ghost:
            "bg-transparent text-white hover:bg-white/10 focus:ring-white/60",
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
    };

    return (
        <button
            className={cn(base, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}
