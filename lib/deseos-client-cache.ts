import type { Deseo } from "@/lib/deseos-pool";

export type DeseosStatus = {
  locked: boolean;
  name?: string;
  deseos?: Deseo[];
  lockedUntil?: string;
  remainingMs?: number;
  reason?: "ip_cooldown";
};

const CACHE_KEY = "mystika-deseos-status";

export function readDeseosCache(): DeseosStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DeseosStatus;
  } catch {
    return null;
  }
}

export function writeDeseosCache(status: DeseosStatus) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(status));
  } catch {
    /* quota / private mode */
  }
}

export async function fetchDeseosStatus(): Promise<DeseosStatus> {
  const res = await fetch("/api/deseos", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return { locked: false };
  const data = (await res.json()) as DeseosStatus;
  writeDeseosCache(data);
  return data;
}

/** Precarga en segundo plano (p. ej. al abrir Mystika o hover en la pestaña). */
export function prefetchDeseosStatus() {
  if (typeof window === "undefined") return;
  void fetchDeseosStatus().catch(() => {});
}

export function hydrateDeseosFromCache(): {
  name: string;
  phase: "idle" | "done";
  deseos: Deseo[];
  lockedUntil: number | null;
} {
  const status = readDeseosCache();
  if (status?.locked && status.lockedUntil) {
    const until = new Date(status.lockedUntil).getTime();
    if (until > Date.now()) {
      return {
        name: status.name ?? "",
        phase: "done",
        deseos: status.deseos?.length === 3 ? status.deseos : [],
        lockedUntil: until,
      };
    }
  }
  return { name: "", phase: "idle", deseos: [], lockedUntil: null };
}
