"use client";

import { SWRConfig } from "swr";
import { jsonFetcher } from "@/lib/swr/fetcher";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher: jsonFetcher,
                revalidateOnFocus: false,
            }}
        >
            {children}
        </SWRConfig>
    );
}
