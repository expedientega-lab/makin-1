"use client";

import { useState, useEffect, useRef } from "react";
import { BackgroundCanvas } from "./background-canvas";
import { Ticker } from "./ticker";
import { Header } from "./header";
import { TabNavigation, isValidMystikaTab } from "./tab-navigation";
import { MysticOrb } from "./mystic-orb";
import { MainSection } from "./main-section";
import { GalletaSection } from "./galleta-section";
import { LlavesSection } from "./llaves-section";
import { LlaveInsertEvent } from "./llave-insert-event";
import type { LlaveTier, LlavesStock } from "@/lib/llaves-data";
import { RuletaSection } from "./ruleta-section";
import { InicioSection } from "./inicio-section";
import { DeseosSection } from "./deseos-section";
import { MensajeSection } from "./mensaje-section";
import { MisterioSection } from "./misterio-section";
import { JackpotSection } from "./jackpot-section";
import { CofresSection } from "./cofres-section";
import { BotonRapidoSection } from "./boton-rapido-section";
import { WinModal } from "./win-modal";
import { OrbPrizeModal } from "./orb-prize-modal";
import { PayModal } from "./pay-modal";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ORBE_DISPLAY_NAME, ORBE_PAY_PRIZE_HINT } from "@/lib/orbe-data";
import type { OrbePrizeType } from "@/lib/orbe-data";
import { isLocalDevHost, isLocalDevServer } from "@/lib/is-local-dev";
import { unlockJackpotSession } from "@/lib/jackpot-session-data";
import { unlockJackpotFiveSession } from "@/lib/jackpot-five-data";
import { JackpotFiveStage } from "./jackpot-five-stage";
import {
  paymentFeedbackCopy,
  type PaymentFeedbackKind,
} from "@/lib/mystika-payment-feedback";
import { prefetchDeseosStatus } from "@/lib/deseos-client-cache";
import { prefetchMensajeStatus } from "@/lib/mensaje-client-cache";
import { isDonacionProduct } from "@/lib/donacion-products";
import {
  downloadStiker,
  findStiker,
  isStikerProduct,
  stikerIdFromProductId,
  unlockStiker,
} from "@/lib/stikers-data";

function cofresChestIndexFromProductId(productId: string): number | null {
  const match = productId.match(/^mystika-cofres-([123])$/);
  if (!match) return null;
  return parseInt(match[1], 10) - 1;
}

function isCofresProductId(productId: string) {
  return productId === "mystika-cofres" || cofresChestIndexFromProductId(productId) !== null;
}

const PAYMENT_TOAST_MS = 6000;

function showPaymentFeedback(
  productId: string,
  kind: PaymentFeedbackKind,
) {
  const { title, description } = paymentFeedbackCopy(productId, kind);
  const instance = toast({
    title,
    description,
    className:
      "border-[rgba(179,136,255,0.35)] bg-[#130d22] text-[var(--txt)]",
  });
  window.setTimeout(() => instance.dismiss(), PAYMENT_TOAST_MS);
}

export function MystikaPage() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [hasPaid, setHasPaid] = useState(false);
  const [hasPlayedGalleta, setHasPlayedGalleta] = useState(false);
  const [paidCategories, setPaidCategories] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(847);

  // Modals
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("mystika-orbe");
  const [payModalTitle, setPayModalTitle] = useState(ORBE_DISPLAY_NAME);
  const [payModalDescription, setPayModalDescription] =
    useState(ORBE_PAY_PRIZE_HINT);
  const [payModalPrice, setPayModalPrice] = useState(1);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [llaveStock, setLlaveStock] = useState<LlavesStock>({
    1: 0,
    5: 0,
    20: 0,
  });
  const [llaveInsertTier, setLlaveInsertTier] = useState<LlaveTier | null>(null);
  const skipLlavePersist = useRef(true);
  const paySessionCompletedRef = useRef(false);
  const payProductIdRef = useRef("mystika-orbe");
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [isDevServer, setIsDevServer] = useState(false);
  const [cofresPaidChest, setCofresPaidChest] = useState<number | null>(null);
  const [orbSpinReady, setOrbSpinReady] = useState(false);
  const [orbPrizeModalOpen, setOrbPrizeModalOpen] = useState(false);
  const [orbPrizeType, setOrbPrizeType] = useState<OrbePrizeType | null>(null);
  const [fiveGameOpen, setFiveGameOpen] = useState(false);

  useEffect(() => {
    setIsLocalDev(isLocalDevHost());
    setIsDevServer(isLocalDevServer());
    prefetchDeseosStatus();
    prefetchMensajeStatus();
  }, []);

  // Live counters
  useEffect(() => {
    const onlineInterval = setInterval(() => {
      setOnlineCount((prev) => {
        let newVal = prev + Math.floor(Math.random() * 5) - 2;
        return Math.max(500, Math.min(1200, newVal));
      });
    }, 4200);

    return () => {
      clearInterval(onlineInterval);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const bootstrapPaymentState = async () => {
      try {
        const areaStatus = await fetch("/api/payments/status?area=mystika", {
          cache: "no-store",
        });
        if (areaStatus.ok) {
          const areaData = await areaStatus.json();
          if (isActive && areaData.paid) setHasPaid(true);
        }
      } catch {
        // Ignore transient fetch failures
      }

      const params = new URLSearchParams(window.location.search);
      const paymentState = params.get("payment");
      const orderId = params.get("orderId");

      if (paymentState !== "processing" || !orderId) return;

      setPaymentMessage("Estamos confirmando tu pago...");

      for (let attempt = 0; attempt < 25; attempt++) {
        if (!isActive) return;
        try {
          const response = await fetch(
            `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
            { cache: "no-store" },
          );
          if (response.ok) {
            const data = await response.json();
            if (data.paid) {
              if (data.productId === "mystika-jackpot") {
                unlockJackpotSession(orderId);
                setPayModalOpen(false);
                setPaymentMessage(
                  "Pago confirmado. Tenés 3 giros: 1.º ganás $50, 2.º se retira, 3.º galleta de la fortuna.",
                );
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              if (data.productId === "mystika-ruleta-tercera") {
                try {
                  localStorage.setItem(
                    "mystika-ruleta-pending-paid-spin",
                    "1",
                  );
                } catch {
                  // ignore
                }
                setPayModalOpen(false);
                setPaymentMessage(
                  "Pago confirmado. Volvé a la Ruleta: 3er premio (NADA + bonus galleta).",
                );
                window.dispatchEvent(new Event("mystika-ruleta-unlock"));
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              if (data.productId === "mystika-mensaje-unlock") {
                try {
                  await fetch("/api/mensaje-universo/unlock", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId }),
                  })
                } catch {
                  // PayPal capture may have already unlocked
                }
                setPayModalOpen(false);
                setPaymentMessage(
                  "Pago confirmado. El portal está desbloqueado: podés enviar otro mensaje.",
                );
                setActiveTab("mensaje");
                syncTabToUrl("mensaje");
                window.dispatchEvent(new Event("mystika-mensaje-unlock"));
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              if (data.productId === "mystika-orbe") {
                setHasPaid(true);
                setOrbSpinReady(true);
                setPayModalOpen(false);
                setPaymentMessage(
                  "Pago confirmado. Buscá tu premio dentro del orbe.",
                );
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              if (data.productId === "mystika-jackpot-five") {
                unlockJackpotFiveSession(orderId);
                setFiveGameOpen(true);
                setPayModalOpen(false);
                setPaymentMessage(
                  "Pago listo. Capturá la señal 5 veces para ganar $5 USD.",
                );
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              if (isCofresProductId(data.productId)) {
                const chestIdx = cofresChestIndexFromProductId(data.productId) ?? 0;
                setCofresPaidChest(chestIdx);
                setPayModalOpen(false);
                setPaymentMessage(
                  `Pago confirmado. Tocá el Cofre ${chestIdx + 1} para revelar tu premio.`,
                );
                window.history.replaceState({}, "", window.location.pathname);
                return;
              }
              setHasPaid(true);
              setPayModalOpen(false);
              setPaymentMessage(null);
              setTimeout(() => setWinModalOpen(true), 300);
              window.history.replaceState({}, "", window.location.pathname);
              return;
            }
            if (
              data.status === "failed" ||
              data.status === "expired" ||
              data.status === "refunded"
            ) {
              const productId =
                typeof data.productId === "string"
                  ? data.productId
                  : payProductIdRef.current;
              showPaymentFeedback(productId, "error");
              setPaymentMessage(
                "El pago no se pudo confirmar. Tu progreso se guardó — podés reintentar.",
              );
              window.history.replaceState({}, "", window.location.pathname);
              return;
            }
          }
        } catch {
          // Keep polling
        }
        await sleep(3000);
      }

      if (isActive) {
        setPaymentMessage(
          "Tu pago sigue pendiente de confirmacion en blockchain. Reintentamos en breve.",
        );
      }
    };

    bootstrapPaymentState();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mystika-llaves-stock");
      if (raw) {
        const p = JSON.parse(raw) as Record<string, unknown>;
        setLlaveStock({
          1: Math.max(0, Math.floor(Number(p[1])) || 0),
          5: Math.max(0, Math.floor(Number(p[5])) || 0),
          20: Math.max(0, Math.floor(Number(p[20])) || 0),
        });
      }
    } catch {
      // ignore
    } finally {
      queueMicrotask(() => {
        skipLlavePersist.current = false;
      });
    }
  }, []);

  useEffect(() => {
    if (skipLlavePersist.current) return;
    try {
      localStorage.setItem("mystika-llaves-stock", JSON.stringify(llaveStock));
    } catch {
      // ignore
    }
  }, [llaveStock]);

  // Deep link: ?tab= from URL on load
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "garra") {
      setActiveTab("llaves");
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "llaves");
      window.history.replaceState(
        {},
        "",
        url.pathname + url.search + url.hash,
      );
      return;
    }
    if (t && isValidMystikaTab(t)) setActiveTab(t);
  }, []);

  const syncTabToUrl = (tab: string) => {
    const url = new URL(window.location.href);
    if (tab === "inicio") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    window.history.replaceState(
      {},
      "",
      url.pathname + url.search + url.hash,
    );
  };

  const handleTabChange = (tab: string) => {
    setPaymentMessage(null);
    setActiveTab(tab);
    if (typeof window !== "undefined") syncTabToUrl(tab);
  };

  const handlePlay = () => {
    paySessionCompletedRef.current = false;
    payProductIdRef.current = "mystika-orbe";
    setCurrentProductId("mystika-orbe");
    setPayModalTitle(ORBE_DISPLAY_NAME);
    setPayModalDescription(ORBE_PAY_PRIZE_HINT);
    setPayModalOpen(true);
  };

  const handleDevTestPlay = () => {
    setHasPaid(true);
    setPayModalOpen(false);
    setPaymentMessage(null);
    setOrbSpinReady(true);
  };

  const handleConsumeLlave = (tier: LlaveTier) => {
    setLlaveStock((prev) => ({
      ...prev,
      [tier]: Math.max(0, prev[tier] - 1),
    }));
  };

  const openLlaveInsertEvent = (
    tier: LlaveTier,
    options?: { grantStock?: boolean },
  ) => {
    if (options?.grantStock !== false) {
      setLlaveStock((prev) => ({ ...prev, [tier]: prev[tier] + 1 }));
    }
    setPayModalOpen(false);
    setPaymentMessage(null);
    setActiveTab("llaves");
    if (typeof window !== "undefined") syncTabToUrl("llaves");
    setLlaveInsertTier(tier);
  };

  const handleDevGrantLlave = (tier: LlaveTier) => {
    openLlaveInsertEvent(tier);
  };

  const handleDevTestGrantCofres = (chestIndex: number) => {
    setCofresPaidChest(chestIndex);
  };

  const handleDevTestFiveGame = () => {
    unlockJackpotFiveSession();
    setFiveGameOpen(true);
  };

  const handleRequestPay = (
    productId: string = "mystika-orbe",
    title?: string,
    description?: string,
    price?: number,
  ) => {
    paySessionCompletedRef.current = false;
    payProductIdRef.current = productId;
    setCurrentProductId(productId);
    if (title) setPayModalTitle(title);
    if (description) setPayModalDescription(description);
    if (price !== undefined) setPayModalPrice(price);
    setPayModalOpen(true);
  };

  const handlePayModalDismiss = () => {
    if (!paySessionCompletedRef.current) {
      showPaymentFeedback(payProductIdRef.current, "cancel");
    }
  };

  const handlePayPalCancel = () => {
    if (!paySessionCompletedRef.current) {
      showPaymentFeedback(payProductIdRef.current, "cancel");
    }
  };

  const handlePaymentError = () => {
    if (!paySessionCompletedRef.current) {
      showPaymentFeedback(payProductIdRef.current, "error");
    }
  };

  const closePayModal = () => {
    setPayModalOpen(false);
  };

  return (
    <>
      <BackgroundCanvas />
      <Ticker />

      <div className="relative z-[2] max-w-[1200px] mx-auto px-5 sm:px-6 pt-12 pb-[100px]">
        <div className="min-w-0">
          <Header
            onlineCount={onlineCount}
            onPlay={handlePlay}
            onGoJackpot={() => handleTabChange("jackpot")}
            onOpenFiveGame={() => setFiveGameOpen(true)}
            onDevTestFiveGame={isDevServer ? handleDevTestFiveGame : undefined}
          />
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          {paymentMessage && (
            <div className="mb-4 rounded-lg border border-[var(--mystik)] bg-[var(--bg2)] p-3 text-center text-[12px] text-[var(--txt2)]">
              {paymentMessage}
            </div>
          )}

          <div
            role="tabpanel"
            id="mystika-main-panel"
            aria-labelledby={`mystika-tab-${activeTab}`}
          >
          {activeTab === "inicio" && (
            <InicioSection onTabChange={handleTabChange} />
          )}

          {activeTab === "orbe" && (
            <>
              <MysticOrb
                onPlay={handlePlay}
                spinReady={orbSpinReady}
                onSpinConsumed={() => setOrbSpinReady(false)}
                onPrizeWon={(type) => {
                  setOrbPrizeType(type);
                  setTimeout(() => setOrbPrizeModalOpen(true), 200);
                }}
                onDevTestPlay={isLocalDev ? handleDevTestPlay : undefined}
              />
              <MainSection />
            </>
          )}

          {activeTab === "galleta" && (
            <GalletaSection
              hasPaid={hasPaid}
              paidCategories={paidCategories}
              onRequestPay={handleRequestPay}
              onPlayed={() => setHasPlayedGalleta(true)}
            />
          )}

          {activeTab === "llaves" && (
            <LlavesSection
              onRequestPay={handleRequestPay}
              devTestEnabled={isLocalDev}
              onDevGrantLlave={isLocalDev ? handleDevGrantLlave : undefined}
            />
          )}

          {activeTab === "ruleta" && (
            <RuletaSection onRequestPay={handleRequestPay} devTestEnabled={isLocalDev} />
          )}

          {activeTab === "deseos" && <DeseosSection />}

          {activeTab === "botonrapido" && <BotonRapidoSection />}

          {activeTab === "mensaje" && (
            <MensajeSection onRequestPay={handleRequestPay} />
          )}

          {activeTab === "misterio" && (
            <MisterioSection onRequestPay={handleRequestPay} />
          )}

          {activeTab === "jackpot" && (
            <JackpotSection
              onRequestPay={handleRequestPay}
              devTestEnabled={isLocalDev}
            />
          )}

          {activeTab === "cofres" && (
            <CofresSection
              paidChestIndex={cofresPaidChest}
              onRequestPay={handleRequestPay}
              onConsumePaid={() => setCofresPaidChest(null)}
              devTestEnabled={isLocalDev}
              onDevTestGrantPaid={isLocalDev ? handleDevTestGrantCofres : undefined}
            />
          )}
          </div>
        </div>
      </div>

      {llaveInsertTier !== null && (
        <LlaveInsertEvent
          tier={llaveInsertTier}
          onConsume={() => handleConsumeLlave(llaveInsertTier)}
          onDone={() => setLlaveInsertTier(null)}
        />
      )}
      {fiveGameOpen && (
        <JackpotFiveStage
          onClose={() => setFiveGameOpen(false)}
          onRequestPay={handleRequestPay}
        />
      )}
      <WinModal isOpen={winModalOpen} onClose={() => setWinModalOpen(false)} />
      <OrbPrizeModal
        isOpen={orbPrizeModalOpen}
        prizeType={orbPrizeType}
        onClose={() => {
          setOrbPrizeModalOpen(false);
          setOrbPrizeType(null);
        }}
      />
      <Toaster />
      <PayModal
        isOpen={payModalOpen}
        onClose={closePayModal}
        onDismiss={handlePayModalDismiss}
        onPayPalCancel={handlePayPalCancel}
        onPaymentError={handlePaymentError}
        onPaymentSuccess={({ orderId, productId }) => {
          paySessionCompletedRef.current = true;
          if (productId === "mystika-ruleta-tercera") {
            try {
              localStorage.setItem("mystika-ruleta-pending-paid-spin", "1");
            } catch {
              // ignore
            }
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. Girá el 3er premio: primero NADA, después el bonus con galleta.",
            );
            window.dispatchEvent(new Event("mystika-ruleta-unlock"));
            return;
          }
          if (productId === "mystika-mensaje-unlock") {
            setPayModalOpen(false);
            setPaymentMessage(
              "Portal desbloqueado. Escribí y enviá otro mensaje al universo.",
            );
            setActiveTab("mensaje");
            if (typeof window !== "undefined") syncTabToUrl("mensaje");
            window.dispatchEvent(new Event("mystika-mensaje-unlock"));
            return;
          }
          if (productId.startsWith("mystika-galleta-")) {
            const categoryKey = productId.replace(
              "mystika-galleta-",
              "",
            );
            setPaidCategories((prev) => [...prev, categoryKey]);
            setPayModalOpen(false);
            setTimeout(() => setWinModalOpen(true), 300);
            return;
          }
          if (productId === "mystika-jackpot") {
            unlockJackpotSession(orderId);
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. 3 giros: 1.º +$50, 2.º se retira el acumulado, 3.º galleta de la fortuna.",
            );
            return;
          }
          if (productId === "mystika-jackpot-five") {
            unlockJackpotFiveSession(orderId);
            setFiveGameOpen(true);
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. Entrá a la mina y buscá el tesoro.",
            );
            return;
          }
          if (
            productId === "mystika-llave-1" ||
            productId === "mystika-llave-5" ||
            productId === "mystika-llave-20"
          ) {
            const tier: LlaveTier =
              productId === "mystika-llave-1"
                ? 1
                : productId === "mystika-llave-5"
                  ? 5
                  : 20;
            openLlaveInsertEvent(tier);
            return;
          }
          if (productId === "mystika-orbe") {
            setHasPaid(true);
            setOrbSpinReady(true);
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. Buscá dentro del orbe: galleta de la fortuna o caja misteriosa.",
            );
            return;
          }
          if (isCofresProductId(productId)) {
            const chestIdx = cofresChestIndexFromProductId(productId) ?? 0;
            setCofresPaidChest(chestIdx);
            setPayModalOpen(false);
            setPaymentMessage(
              `Pago listo. Tocá el Cofre ${chestIdx + 1} para revelar tu premio.`,
            );
            return;
          }
          if (isDonacionProduct(productId)) {
            setPayModalOpen(false);
            setPaymentMessage(
              `Donación de $${payModalPrice.toLocaleString("es-AR")} USD confirmada. Ya participás por USD 2.000, USD 500 y USD 100.`,
            );
            window.dispatchEvent(
              new CustomEvent("mystika-donacion-success", {
                detail: { amount: payModalPrice },
              }),
            );
            return;
          }
          if (isStikerProduct(productId)) {
            const stikerId = stikerIdFromProductId(productId);
            const item = stikerId ? findStiker(stikerId) : undefined;
            if (stikerId) unlockStiker(stikerId);
            setPayModalOpen(false);
            setPaymentMessage(
              item
                ? `¡${item.name} desbloqueado! Descargando tu wallpaper...`
                : "Stiker desbloqueado. Descargalo desde la galería.",
            );
            if (stikerId) {
              window.dispatchEvent(
                new CustomEvent("mystika-stiker-unlock", {
                  detail: { stikerId },
                }),
              );
              if (item) {
                window.setTimeout(async () => {
                  const ok = await downloadStiker(item, {
                    skipOwnershipCheck: true,
                  });
                  window.dispatchEvent(
                    new CustomEvent("mystika-stiker-downloaded", {
                      detail: { stikerId, ok },
                    }),
                  );
                }, 350);
              }
            }
            return;
          }
          setHasPaid(true);
          setPayModalOpen(false);
          setTimeout(() => setWinModalOpen(true), 300);
        }}
        productId={currentProductId}
        title={payModalTitle}
        description={payModalDescription}
        price={payModalPrice}
      />
    </>
  );
}
