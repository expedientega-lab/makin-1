"use client";

import { useState } from "react";
import { fortunes, fortuneCategories, luckColors } from "@/lib/mystika-data";

interface GalletaSectionProps {
  hasPaid: boolean;
  paidCategories: string[];
  onRequestPay: (
    productId: string,
    title: string,
    description: string,
    price: number,
  ) => void;
  onPlayed: () => void;
}

export function GalletaSection({
  hasPaid,
  paidCategories,
  onRequestPay,
  onPlayed,
}: GalletaSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [detailSubcategory, setDetailSubcategory] = useState<string | null>(
    null,
  );
  const [fortune, setFortune] = useState<string | null>(null);
  const [luckColor, setLuckColor] = useState<string | null>(null);
  const [luckNumber, setLuckNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCracking, setIsCracking] = useState(false);

  const handleBackToCategories = () => {
    // Go back to subcategories of the current category
    setSelectedSubcategory(null);
    setDetailSubcategory(null);
  };

  const handleBackToMainCategories = () => {
    // Go back to main 4 categories
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setDetailSubcategory(null);
  };

  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key);
    setSelectedSubcategory(null);
    setDetailSubcategory(null);
    setFortune(null);
    setLuckColor(null);
    setLuckNumber(null);
  };

  const handleSubcategorySelect = (key: string) => {
    setSelectedSubcategory(key);
    setFortune(null);
    setLuckColor(null);
    setLuckNumber(null);
  };

  const revealFortune = () => {
    if (!selectedSubcategory) return;

    const isSubcategoryPaid = paidCategories.includes(selectedSubcategory);

    if (!isSubcategoryPaid) {
      const subcategory = fortuneCategories
        .find((cat) => cat.key === selectedCategory)
        ?.subcategories?.find((sub) => sub.key === selectedSubcategory);

      onRequestPay(
        `mystika-galleta-${selectedSubcategory}`,
        `GALLETA DE LA FORTUNA - ${subcategory?.name}`,
        `Revela tu mensaje personalizado del destino en la categoria ${subcategory?.name} por $${subcategory?.price}.`,
        subcategory?.price || 1,
      );
      return;
    }

    setIsRevealing(true);
    setIsCracking(true);

    // Check if this subcategory includes luck extras (price > $1)
    const subPrice =
      fortuneCategories
        .find((cat) => cat.key === selectedCategory)
        ?.subcategories?.find((sub) => sub.key === selectedSubcategory)
        ?.price ?? 1;

    setTimeout(() => {
      setIsCracking(false);
      const categoryFortunes =
        fortunes[selectedSubcategory as keyof typeof fortunes];
      const randomFortune =
        categoryFortunes[Math.floor(Math.random() * categoryFortunes.length)];

      setFortune(randomFortune);
      // Only reveal luck extras for price > $1
      if (subPrice > 1) {
        const randomColor =
          luckColors[Math.floor(Math.random() * luckColors.length)];
        const randomNumber = Math.floor(Math.random() * 99) + 1;
        setLuckColor(randomColor);
        setLuckNumber(randomNumber);
      } else {
        setLuckColor(null);
        setLuckNumber(null);
      }
      setIsRevealing(false);
      onPlayed();
    }, 1500);
  };

  const resetFortune = () => {
    // Don't reset selectedCategory when going back to subcategories
    // setSelectedCategory(null)
    setSelectedSubcategory(null);
    setDetailSubcategory(null);
    setFortune(null);
    setLuckColor(null);
    setLuckNumber(null);
  };

  // Derived: next subcategory for upsell
  const currentSubIndex = selectedSubcategory
    ? (fortuneCategories
        .find((c) => c.key === selectedCategory)
        ?.subcategories?.findIndex((s) => s.key === selectedSubcategory) ?? -1)
    : -1;
  const nextSub =
    currentSubIndex >= 0
      ? fortuneCategories.find((c) => c.key === selectedCategory)
          ?.subcategories?.[currentSubIndex + 1]
      : null;
  const showUpsell =
    fortune && nextSub && !paidCategories.includes(nextSub.key);

  // Derived: the subcategory object being previewed
  const detailSub = detailSubcategory
    ? fortuneCategories
        .find((c) => c.key === selectedCategory)
        ?.subcategories?.find((s) => s.key === detailSubcategory)
    : null;
  const mainCat = fortuneCategories.find((c) => c.key === selectedCategory);

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Header */}
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          GALLETA DE LA FORTUNA
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5"
          style={{ fontSize: "clamp(32px,8vw,52px)" }}
        >
          Tu{" "}
          <span
            className="text-[var(--gold)]"
            style={{ textShadow: "0 0 20px rgba(255,215,0,.5)" }}
          >
            mensaje
          </span>{" "}
          te espera
        </h2>
        <p className="text-[13px] text-[var(--txt2)] max-w-[360px] mx-auto leading-[1.8] font-light">
          Elige una categoria y rompe la galleta mistica para descubrir lo que
          el destino tiene preparado para ti.
        </p>
      </div>

      {/* Cookie Visual */}
      <div className="flex justify-center mb-8">
        <div
          className={`relative cursor-pointer transition-transform flex flex-col items-center ${isCracking ? "" : "hover:scale-105"}`}
          onClick={selectedSubcategory && !fortune ? revealFortune : undefined}
          style={{
            animation: isCracking ? "cookie-crack 1.5s ease-in-out" : undefined,
          }}
        >
          <div
            className="text-[120px] drop-shadow-2xl"
            style={{
              filter:
                selectedSubcategory &&
                paidCategories.includes(selectedSubcategory)
                  ? "none"
                  : "grayscale(50%)",
              textShadow:
                selectedSubcategory &&
                paidCategories.includes(selectedSubcategory)
                  ? "0 0 40px rgba(255,215,0,0.5)"
                  : "none",
            }}
          >
            🥠
          </div>
          {!selectedSubcategory && (
            <div className="text-center text-[var(--txt)] text-lg font-display font-bold tracking-[2px] animate-pulse mt-2">
              Elige subcategoría
            </div>
          )}
          {selectedSubcategory &&
            !paidCategories.includes(selectedSubcategory) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[var(--gold)] text-lg font-display font-bold tracking-[2px] animate-pulse">
                  Desbloquea por $
                  {fortuneCategories
                    .find((c) => c.key === selectedCategory)
                    ?.subcategories?.find((s) => s.key === selectedSubcategory)
                    ?.price || 1}
                </span>
              </div>
            )}
          {selectedSubcategory &&
            paidCategories.includes(selectedSubcategory) &&
            !fortune &&
            !isRevealing && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[var(--gold)] text-base font-display font-bold tracking-[2px] animate-pulse bg-gradient-to-r from-[var(--gold)] to-[var(--gold3)] bg-clip-text text-transparent">
                  Toca para revelar
                </span>
              </div>
            )}
          {isRevealing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Main Categories */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {fortuneCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategorySelect(cat.key)}
              className="p-5 rounded-lg border transition-all relative text-left bg-[var(--bg2)] border-[var(--border)] hover:border-[var(--gold)] hover:bg-[rgba(255,215,0,0.1)] hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl">{cat.emoji}</div>
                <div className="px-3 py-1.5 rounded-full bg-[var(--mystik)] text-[12px] font-black text-[var(--bg0)] shadow-lg">
                  4 niveles
                </div>
              </div>
              <div className="font-display text-[19px] tracking-[2px] text-[var(--txt)] font-black mb-2 drop-shadow-lg">
                {cat.name}
              </div>

              <div className="mt-3 text-[14px] text-[var(--txt)] flex items-center gap-2 font-medium">
                <span className="text-xl">🎯</span>
                <span className="bg-gradient-to-r from-[var(--gold)] to-[var(--mystik)] bg-clip-text text-transparent font-bold">
                  ELIGE TU NIVEL
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Subcategories */}
      {selectedCategory && !selectedSubcategory && !fortune && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBackToMainCategories}
              className="text-[14px] text-[var(--txt)] hover:text-[var(--gold)] transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
            >
              <span>←</span> Volver a categorías principales
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl mb-2">
              {fortuneCategories.find((c) => c.key === selectedCategory)?.emoji}
            </div>
            <div className="font-display text-[20px] tracking-[3px] text-[var(--txt)] font-black mb-3 bg-gradient-to-r from-[var(--mystik)] to-[var(--gold)] bg-clip-text text-transparent">
              {fortuneCategories.find((c) => c.key === selectedCategory)?.name}
            </div>
            <p className="text-[15px] text-[var(--txt)] leading-relaxed font-medium">
              ✨ Elige tu nivel de lectura personalizada ✨
            </p>
          </div>

          {/* Detail panel for unpaid subcategory */}
          {detailSubcategory &&
          detailSub &&
          !paidCategories.includes(detailSubcategory) ? (
            <div className="animate-[fadeup_0.3s_ease] mb-4">
              <button
                onClick={() => setDetailSubcategory(null)}
                className="text-[15px] text-[var(--txt2)] hover:text-[var(--gold)] transition-colors flex items-center gap-2 mb-5 font-medium"
              >
                ← Volver a niveles
              </button>

              {/* Header del detalle */}
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">{mainCat?.emoji}</div>
                <div className="font-display font-black text-[24px] tracking-[2px] text-[var(--txt)] mb-2">
                  {detailSub.name}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(255,215,0,0.15)] border border-[rgba(255,215,0,0.4)] mt-1">
                  <span className="text-[15px] font-black text-[var(--gold)]">
                    💰 PRECIO: ${detailSub.price} USD
                  </span>
                </div>
              </div>

              {/* Lo que vas a recibir */}
              <div className="mb-5">
                <div className="font-mono text-[11px] tracking-[4px] text-[var(--mystik3)] text-center mb-4">
                  ✦ LO QUE VAS A RECIBIR ✦
                </div>

                {/* Siempre: mensaje */}
                <div className="flex items-center gap-4 p-5 rounded-xl border border-[rgba(179,136,255,0.25)] bg-[rgba(179,136,255,0.07)] mb-3">
                  <span className="text-4xl flex-shrink-0">🥠</span>
                  <div className="flex-1">
                    <div className="font-bold text-[18px] text-[var(--txt)] mb-1">
                      Mensaje del destino
                    </div>
                    <div className="text-[14px] text-[var(--txt2)]">
                      Un mensaje mistico personalizado para vos
                    </div>
                  </div>
                  <span className="ml-auto text-[var(--green)] text-2xl font-bold flex-shrink-0">
                    ✓
                  </span>
                </div>

                {/* Solo para precio > $1 */}
                {detailSub.price > 1 ? (
                  <>
                    <div className="flex items-center gap-4 p-5 rounded-xl border border-[rgba(179,136,255,0.25)] bg-[rgba(179,136,255,0.07)] mb-3">
                      <span className="text-4xl flex-shrink-0">🍀</span>
                      <div className="flex-1">
                        <div className="font-bold text-[18px] text-[var(--txt)] mb-1">
                          Número de la suerte
                        </div>
                        <div className="text-[14px] text-[var(--txt2)]">
                          Tu numero cosmico para esta etapa
                        </div>
                      </div>
                      <span className="ml-auto text-[var(--green)] text-2xl font-bold flex-shrink-0">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-xl border border-[rgba(179,136,255,0.25)] bg-[rgba(179,136,255,0.07)]">
                      <span className="text-4xl flex-shrink-0">🎨</span>
                      <div className="flex-1">
                        <div className="font-bold text-[18px] text-[var(--txt)] mb-1">
                          Color de la suerte
                        </div>
                        <div className="text-[14px] text-[var(--txt2)]">
                          El color que potencia tu energia
                        </div>
                      </div>
                      <span className="ml-auto text-[var(--green)] text-2xl font-bold flex-shrink-0">
                        ✓
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <span className="text-[14px] text-[var(--txt3)] font-mono tracking-[1px]">
                      Subi de nivel para desbloquear mas beneficios ✨
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de pago */}
              <button
                onClick={() => {
                  onRequestPay(
                    `mystika-galleta-${detailSubcategory}`,
                    `GALLETA DE LA FORTUNA - ${detailSub.name}`,
                    `Revela tu mensaje personalizado del destino en la categoria ${detailSub.name} por $${detailSub.price}.`,
                    detailSub.price,
                  );
                }}
                className="w-full py-5 rounded-xl font-mono text-[15px] tracking-[3px] font-black transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  border: "2px solid var(--gold)",
                  boxShadow:
                    "0 0 24px rgba(255,215,0,.35), inset 0 1px 0 rgba(255,255,255,0.05)",
                  color: "var(--gold)",
                }}
              >
                <span className="text-xl">💳</span>
                <span>PAGAR ${detailSub.price} — REVELAR AHORA</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {fortuneCategories
                .find((cat) => cat.key === selectedCategory)
                ?.subcategories?.map((sub) => {
                  const isPaid = paidCategories.includes(sub.key);

                  return (
                    <button
                      key={sub.key}
                      onClick={() => {
                        if (!isPaid) {
                          setDetailSubcategory(sub.key);
                        } else {
                          handleSubcategorySelect(sub.key);
                        }
                      }}
                      className={`
                      p-5 rounded-xl border transition-all relative text-left
                      ${
                        isPaid
                          ? "bg-[rgba(179,136,255,0.2)] border-[var(--mystik)] shadow-[0_0_20px_rgba(179,136,255,0.4)]"
                          : "bg-[var(--bg2)] border-[var(--border)] hover:border-[var(--gold)] hover:bg-[rgba(255,215,0,0.1)] hover:scale-[1.02]"
                      }
                    `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">
                          {
                            fortuneCategories.find(
                              (c) => c.key === selectedCategory,
                            )?.emoji
                          }
                        </div>
                        {!isPaid ? (
                          <div
                            className="px-4 py-2 rounded-full shadow-lg flex items-center justify-center min-w-[96px] border"
                            style={{
                              background: "var(--bg0)",
                              borderColor: "var(--gold)",
                              boxShadow: "0 0 14px rgba(255,215,0,0.35)",
                            }}
                          >
                            <span className="font-mono text-[11px] tracking-[2px] text-[var(--gold)]">
                              ${sub.price} USD
                            </span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[var(--green)] flex items-center justify-center shadow-lg">
                            <span className="text-[11px] text-white font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="font-display text-[15px] tracking-[1px] text-[var(--txt)] font-black mb-3">
                        {sub.name}
                      </div>

                      <div className="text-[13px] text-[var(--txt)] flex items-center gap-2 font-medium">
                        {!isPaid ? (
                          <>
                            <span className="text-xl">👁️</span>
                            <span className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold3)] bg-clip-text text-transparent font-bold">
                              VER DETALLES
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">✨</span>
                            <span className="bg-gradient-to-r from-[var(--green)] to-[var(--mystik)] bg-clip-text text-transparent font-bold">
                              LISTO PARA LEER
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Fortune Result */}
      {fortune && (
        <div
          className="bg-[var(--bg2)] border border-[var(--gold)] rounded-lg p-6 mb-6 relative overflow-hidden"
          style={{ animation: "reveal-message 0.6s ease-out" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--gold),transparent)",
            }}
          />

          {/* Category badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[var(--goldS)] border border-[rgba(255,215,0,0.3)]">
              <span>
                {
                  fortuneCategories.find((c) => c.key === selectedCategory)
                    ?.emoji
                }
              </span>
              <span className="font-mono text-[10px] tracking-[2px] text-[var(--gold)]">
                {
                  fortuneCategories.find((c) => c.key === selectedCategory)
                    ?.name
                }
              </span>
            </div>
          </div>

          {/* Fortune message */}
          <div className="text-center mb-6">
            <p className="text-[16px] text-[var(--txt)] leading-[1.8] font-light italic">
              &ldquo;{fortune}&rdquo;
            </p>
          </div>

          {/* Luck info — solo si aplica (precio > $1) */}
          {luckColor && luckNumber ? (
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="font-mono text-[8px] tracking-[2px] text-[var(--txt3)] mb-1">
                  COLOR DE SUERTE
                </div>
                <div className="font-sans font-bold text-[14px] text-[var(--mystik)]">
                  {luckColor}
                </div>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div>
                <div className="font-mono text-[8px] tracking-[2px] text-[var(--txt3)] mb-1">
                  NUMERO DE SUERTE
                </div>
                <div className="font-sans font-bold text-[14px] text-[var(--gold)]">
                  {luckNumber}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-[11px] text-[var(--txt3)] font-mono tracking-[1px]">
                Subi de nivel para desbloquear Número y Color de suerte ✨
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={resetFortune}
              className="flex-1 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--txt2)] font-mono text-[11px] tracking-[2px] hover:border-[var(--borderH)] transition-all"
            >
              NUEVA LECTURA
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Mi fortuna de Mystika",
                    text: fortune,
                  });
                }
              }}
              className="flex-1 py-3 rounded-lg border border-[var(--mystik)] bg-[var(--mystikS)] text-[var(--mystik)] font-mono text-[11px] tracking-[2px] hover:bg-[var(--mystikG)] transition-all"
            >
              COMPARTIR
            </button>
          </div>

          {/* Upsell — siguiente nivel */}
          {showUpsell && nextSub && (
            <div
              className="mt-5 rounded-xl p-4 relative overflow-hidden animate-[fadeup_0.5s_ease]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(179,136,255,0.12) 0%, rgba(179,136,255,0.04) 100%)",
                border: "1px solid rgba(179,136,255,0.35)",
                boxShadow: "0 0 24px rgba(179,136,255,0.1)",
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--mystik), transparent)",
                }}
              />

              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(179,136,255,0.15)] border border-[rgba(179,136,255,0.3)]">
                  <span className="text-[10px] font-black font-mono tracking-[2px] text-[var(--mystik)]">
                    ⬆ SIGUIENTE NIVEL
                  </span>
                </div>
                <span className="text-[var(--mystik3)] text-sm">✦</span>
              </div>

              {/* Content */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: "rgba(179,136,255,0.15)",
                    border: "1px solid rgba(179,136,255,0.25)",
                  }}
                >
                  {mainCat?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-[16px] text-[var(--txt)] tracking-[1px]">
                    {nextSub.name}
                  </div>
                  <div className="text-[12px] text-[var(--txt3)] mt-0.5">
                    {nextSub.price > 1
                      ? "Incluye mensaje + número de suerte + color de suerte"
                      : "Mensaje personalizado del destino"}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display font-black text-[22px] leading-none"
                    style={{
                      color: "var(--gold)",
                      textShadow: "0 0 12px rgba(255,215,0,0.4)",
                    }}
                  >
                    ${nextSub.price}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--txt3)]">
                    USD
                  </div>
                </div>
              </div>

              {/* Extras para precio > 1 */}
              {nextSub.price > 1 && (
                <div className="flex gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(0,255,157,0.08)] border border-[rgba(0,255,157,0.2)]">
                    <span className="text-sm">🍀</span>
                    <span className="text-[11px] text-[var(--green)] font-medium">
                      Nº de suerte
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(0,255,157,0.08)] border border-[rgba(0,255,157,0.2)]">
                    <span className="text-sm">🎨</span>
                    <span className="text-[11px] text-[var(--green)] font-medium">
                      Color de suerte
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => {
                  onRequestPay(
                    `mystika-galleta-${nextSub.key}`,
                    `GALLETA DE LA FORTUNA - ${nextSub.name}`,
                    `Revela tu mensaje personalizado del destino en la categoria ${nextSub.name} por $${nextSub.price}.`,
                    nextSub.price,
                  );
                }}
                className="w-full py-3.5 rounded-xl font-mono text-[13px] tracking-[2px] font-black transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(179,136,255,0.25) 0%, rgba(179,136,255,0.1) 100%)",
                  border: "2px solid var(--mystik)",
                  boxShadow: "0 0 20px rgba(179,136,255,0.2)",
                  color: "var(--mystik)",
                }}
              >
                <span>✦</span>
                <span>
                  DESBLOQUEAR {nextSub.name.toUpperCase()} — ${nextSub.price}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
