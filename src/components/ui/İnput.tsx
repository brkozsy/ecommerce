import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: Props) {
    return (
        <input
            className={cn(
                "h-10 w-full rounded-xl bg-white/5 px-3 text-sm text-white " +
                "ring-1 ring-white/15 placeholder:text-white/40 " +
                "focus:outline-none focus:ring-2 focus:ring-white/50",
                className
            )}
            {...props}
        />
    );
}
