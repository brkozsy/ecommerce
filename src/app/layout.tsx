import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Providers from "./providers";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <Providers>
            <Header />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
