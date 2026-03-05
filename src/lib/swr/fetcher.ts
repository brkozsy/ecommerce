export async function jsonFetcher(url: string) {
    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
    }

    return res.json();
}
