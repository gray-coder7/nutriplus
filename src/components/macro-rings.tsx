function percentOfCalories(grams: number, kcalPerGram: number, totalCalories: number): number {
  if (totalCalories <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(((grams * kcalPerGram) / totalCalories) * 100)));
}

function Ring({
  color,
  percent,
  value,
  label,
  size = 88,
}: {
  color: string;
  percent: number;
  value: string;
  label: string;
  size?: number;
}) {
  const inner = size - 18;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${color} 0% ${percent}%, var(--color-border) ${percent}% 100%)`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-surface font-bold"
          style={{ width: inner, height: inner, fontSize: size > 80 ? 15 : 12 }}
        >
          {value}
        </div>
      </div>
      <div className="text-[11px] font-bold text-ink-soft">{label}</div>
    </div>
  );
}

export function MacroRings({
  caloriesPerServing,
  proteinG,
  carbsG,
  fatG,
  size,
}: {
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  size?: number;
}) {
  return (
    <div className="flex justify-between gap-2">
      <Ring color="var(--color-coral)" percent={100} value={String(caloriesPerServing)} label="Kcal" size={size} />
      <Ring
        color="var(--color-berry)"
        percent={percentOfCalories(proteinG, 4, caloriesPerServing)}
        value={`${proteinG}g`}
        label="Proteína"
        size={size}
      />
      <Ring
        color="var(--color-aqua)"
        percent={percentOfCalories(carbsG, 4, caloriesPerServing)}
        value={`${carbsG}g`}
        label="Carbos"
        size={size}
      />
      <Ring
        color="var(--color-sun)"
        percent={percentOfCalories(fatG, 9, caloriesPerServing)}
        value={`${fatG}g`}
        label="Grasa"
        size={size}
      />
    </div>
  );
}
