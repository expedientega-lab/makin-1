"use client";

import { LLAVE_TIERS, type LlaveTier } from "@/lib/llaves-data";
import { DevTestButton } from "./dev-test-button";
import { LlaveTierCardLights } from "./llave-tier-card-lights";
import { LlavesHeroLights } from "./llaves-hero-lights";

interface LlavesSectionProps {
  onRequestPay: (
    productId: string,
    title: string,
    description: string,
    price: number,
  ) => void;
  devTestEnabled?: boolean;
  onDevGrantLlave?: (tier: LlaveTier) => void;
}

export function LlavesSection({
  onRequestPay,
  devTestEnabled,
  onDevGrantLlave,
}: LlavesSectionProps) {
  return (
    <div className="animate-[fadeup_0.4s_ease]">
        <LlavesHeroLights />

        {devTestEnabled && onDevGrantLlave && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {LLAVE_TIERS.map((t) => (
              <DevTestButton
                key={t.tier}
                label={`PROBAR +llave $${t.priceUSD}`}
                onClick={() => onDevGrantLlave(t.tier)}
              />
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:gap-4 sm:grid-cols-3 sm:items-stretch mb-6 px-1 sm:px-0">
          {LLAVE_TIERS.map((t) => (
            <LlaveTierCardLights
              key={t.tier}
              tier={t}
              onBuy={() =>
                onRequestPay(
                  t.productId,
                  `LLAVE CÓSMICA — ${t.shortName}`,
                  `Comprás la llave de USD ${t.priceUSD}. Después la metés en el cofre y recibís una galleta de la fortuna digital o un mensaje positivo del universo.`,
                  t.priceUSD,
                )
              }
            />
          ))}
        </div>
    </div>
  );
}
