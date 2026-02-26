type FetchJSONOptions = RequestInit & {
    throwOnHttpError?: boolean;
};

function isAbsolute(url: string) {
    return /^https?:\/\//i.test(url);
}

export async function fetchJSON<T>(url: string, options: FetchJSONOptions = {}): Promise<T> {
    const { throwOnHttpError = true, headers, ...rest } = options;

    const finalUrl = isAbsolute(url) ? url : url; // relative ise olduğu gibi bırak

    const res = await fetch(finalUrl, {
        ...rest,
        headers: {
            ...(headers || {}),
        },
    });

    const text = await res.text();
    let data: any = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (throwOnHttpError && !res.ok) {
        const msg =
            (data && typeof data === "object" && "error" in data && String(data.error)) ||
            `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
}