import type { UniversalResponse } from "@/lib/mensaje-universo-data";

export type MensajeStatus = {
  locked: boolean;
  message?: string;
  response?: UniversalResponse;
  lockedUntil?: string;
  remainingMs?: number;
  reason?: "ip_cooldown";
  error?: string;
};

const CACHE_KEY = "mystika-mensaje-status";

export function readMensajeCache(): MensajeStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MensajeStatus;
  } catch {
    return null;
  }
}

export function writeMensajeCache(status: MensajeStatus) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(status));
  } catch {
    /* quota / private mode */
  }
}

export async function fetchMensajeStatus(): Promise<MensajeStatus> {
  const res = await fetch("/api/mensaje-universo", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return { locked: false };
  const data = (await res.json()) as MensajeStatus;
  writeMensajeCache(data);
  return data;
}

export function prefetchMensajeStatus() {
  if (typeof window === "undefined") return;
  void fetchMensajeStatus().catch(() => {});
}

export function hydrateMensajeFromCache(): {
  message: string;
  sent: boolean;
  response: UniversalResponse | null;
  lockedUntil: number | null;
} {
  const status = readMensajeCache();
  if (status?.locked && status.lockedUntil) {
    const until = new Date(status.lockedUntil).getTime();
    if (until > Date.now()) {
      return {
        message: status.message ?? "",
        sent: true,
        response: status.response ?? null,
        lockedUntil: until,
      };
    }
  }
  return { message: "", sent: false, response: null, lockedUntil: null };
}
