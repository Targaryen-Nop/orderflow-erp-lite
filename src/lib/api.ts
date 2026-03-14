export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? "Request failed");
  }

  return json as T;
}
