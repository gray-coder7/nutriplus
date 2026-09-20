export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-lime/20 px-4 py-1 text-sm font-semibold tracking-wide text-coral-dark uppercase">
        Fase 0 · Setup
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Nutri<span className="text-coral">Plus</span>
      </h1>
      <p className="max-w-md text-lg text-foreground/70">
        Recetas, macros y lista de super para comer mejor. La biblioteca de
        recetas y el planeador semanal llegan en las siguientes fases.
      </p>
    </div>
  );
}
