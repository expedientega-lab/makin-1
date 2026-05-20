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
import type { LlaveTier, LlavesStock } from "@/lib/llaves-data";
import { RuletaSection } from "./ruleta-section";
import { InicioSection } from "./inicio-section";
import { DeseosSection } from "./deseos-section";
import { MensajeSection } from "./mensaje-section";
import { MisterioSection } from "./misterio-section";
import { JackpotSection } from "./jackpot-section";
import { CofresSection } from "./cofres-section";
import { WinModal } from "./win-modal";
import { PayModal } from "./pay-modal";
import { isLocalDevHost } from "@/lib/is-local-dev";

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
  const [payModalTitle, setPayModalTitle] = useState("REVELAR TU DESTINO");
  const [payModalDescription, setPayModalDescription] = useState(
    "Por solo $1 accedes al portal mistico y descubres tu fortuna",
  );
  const [payModalPrice, setPayModalPrice] = useState(1);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [llaveStock, setLlaveStock] = useState<LlavesStock>({
    1: 0,
    5: 0,
    20: 0,
  });
  const skipLlavePersist = useRef(true);
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [jackpotFreeSpin, setJackpotFreeSpin] = useState(false);

  useEffect(() => {
    setIsLocalDev(isLocalDevHost());
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
                setPayModalOpen(false);
                setJackpotFreeSpin(true);
                setPaymentMessage(
                  "Pago confirmado. Tocá GIRAR en Jackpot para girar los carretes.",
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
                  "Pago confirmado. Volvé a la Ruleta y girá: tu Gran Fortuna está sellada en el giro.",
                );
                window.dispatchEvent(new Event("mystika-ruleta-unlock"));
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
              setPaymentMessage(
                "El pago no se pudo confirmar. Intenta nuevamente.",
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
    // Show pay modal for the orb
    setCurrentProductId("mystika-orbe");
    setPayModalTitle("REVELAR TU DESTINO");
    setPayModalDescription(
      "Por solo $1 accedes al portal mistico y descubres tu fortuna",
    );
    setPayModalOpen(true);
  };

  const handleDevTestPlay = () => {
    setHasPaid(true);
    setPayModalOpen(false);
    setPaymentMessage(null);
    setTimeout(() => setWinModalOpen(true), 300);
  };

  const handleDevGrantLlave = (tier: LlaveTier) => {
    setLlaveStock((prev) => ({ ...prev, [tier]: prev[tier] + 1 }));
    setPaymentMessage(
      `Modo prueba: llave $${tier} agregada. Metela en el cofre abajo.`,
    );
  };

  const handleConsumeLlave = (tier: LlaveTier) => {
    setLlaveStock((prev) => ({
      ...prev,
      [tier]: Math.max(0, prev[tier] - 1),
    }));
  };

  const handleRequestPay = (
    productId: string = "mystika-orbe",
    title?: string,
    description?: string,
    price?: number,
  ) => {
    setCurrentProductId(productId);
    if (title) setPayModalTitle(title);
    if (description) setPayModalDescription(description);
    if (price !== undefined) setPayModalPrice(price);
    setPayModalOpen(true);
  };

  return (
    <>
      <BackgroundCanvas />
      <Ticker />

      <div className="relative z-[2] max-w-[980px] mx-auto px-5 pt-12 pb-[100px]">
        <div className="min-w-0">
          <Header
            onlineCount={onlineCount}
            onPlay={handlePlay}
            onGoJackpot={() => handleTabChange("jackpot")}
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
              llaveStock={llaveStock}
              onConsumeLlave={handleConsumeLlave}
              onRequestPay={handleRequestPay}
              devTestEnabled={isLocalDev}
              onDevGrantLlave={isLocalDev ? handleDevGrantLlave : undefined}
            />
          )}

          {activeTab === "ruleta" && (
            <RuletaSection onRequestPay={handleRequestPay} />
          )}

          {activeTab === "deseos" && <DeseosSection />}

          {activeTab === "mensaje" && <MensajeSection />}

          {activeTab === "misterio" && <MisterioSection />}

          {activeTab === "jackpot" && (
            <JackpotSection
              onRequestPay={handleRequestPay}
              hasFreeSpin={jackpotFreeSpin}
              onConsumeFreeSpin={() => setJackpotFreeSpin(false)}
              devTestEnabled={isLocalDev}
            />
          )}

          {activeTab === "cofres" && (
            <CofresSection hasPaid={hasPaid} onRequestPay={handleRequestPay} />
          )}
          </div>
        </div>
      </div>

      <WinModal isOpen={winModalOpen} onClose={() => setWinModalOpen(false)} />
      <PayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaymentSuccess={() => {
          if (currentProductId === "mystika-ruleta-tercera") {
            try {
              localStorage.setItem("mystika-ruleta-pending-paid-spin", "1");
            } catch {
              // ignore
            }
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. Girá la ruleta: el universo reservó tu Gran Fortuna para este giro.",
            );
            window.dispatchEvent(new Event("mystika-ruleta-unlock"));
            return;
          }
          if (currentProductId.startsWith("mystika-galleta-")) {
            const categoryKey = currentProductId.replace(
              "mystika-galleta-",
              "",
            );
            setPaidCategories((prev) => [...prev, categoryKey]);
            setPayModalOpen(false);
            setTimeout(() => setWinModalOpen(true), 300);
            return;
          }
          if (currentProductId === "mystika-jackpot") {
            setPayModalOpen(false);
            setJackpotFreeSpin(true);
            setPaymentMessage(
              "Pago listo. Tocá GIRAR en Jackpot para girar los carretes.",
            );
            return;
          }
          if (
            currentProductId === "mystika-llave-1" ||
            currentProductId === "mystika-llave-5" ||
            currentProductId === "mystika-llave-20"
          ) {
            const tier: LlaveTier =
              currentProductId === "mystika-llave-1"
                ? 1
                : currentProductId === "mystika-llave-5"
                  ? 5
                  : 20;
            setLlaveStock((prev) => ({ ...prev, [tier]: prev[tier] + 1 }));
            setPayModalOpen(false);
            setPaymentMessage(
              "Pago listo. Tu llave ya está en el bolsillo astral — metela en el cofre para tu galleta o mensaje del universo.",
            );
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
