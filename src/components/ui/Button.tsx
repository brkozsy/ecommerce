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
        "inline-flex items-center justify-center rounded-xl font-semibold transition " +
        "focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-white " +
        "disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-orange-600 text-white hover:bg-orange-700",
        secondary: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
    };

    return (
        <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
    );
}
