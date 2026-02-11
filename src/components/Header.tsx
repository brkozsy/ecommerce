import Link from "next/link";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="text-lg font-semibold tracking-tight text-white">
                    E-commerce
                </Link>

                <div className="flex items-center gap-2">
                    <Link href="/cart">
                        <Button variant="secondary" size="sm">Cart</Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                </div>
            </Container>
        </header>
    );
}
