interface DevTestButtonProps {
  onClick: () => void;
  label?: string;
}

export function DevTestButton({
  onClick,
  label = "PROBAR (local)",
}: DevTestButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-3 rounded-xl border-2 border-dashed border-amber-400/70 bg-amber-500/10 font-mono text-[11px] font-black tracking-[2px] text-amber-200 cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-amber-500/20 active:scale-95"
      title="Solo visible en localhost durante desarrollo"
    >
      {label}
    </button>
  );
}
