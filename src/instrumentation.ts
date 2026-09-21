const SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // una vez al día
const FIRST_RUN_DELAY_MS = 10_000; // no esperar un día entero para el backfill inicial

/**
 * Hook de arranque de Next.js (corre una sola vez cuando el server long-lived
 * de Coolify levanta). No hay job runner externo en este proyecto, así que
 * el barrido de compresión de imágenes (ver src/lib/image-compression-sweep.ts)
 * vive aquí como un setInterval en el mismo proceso de Node — suficiente
 * porque Coolify corre un solo contenedor de esta app, sin réplicas.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { compressUncompressedImages } = await import("@/lib/image-compression-sweep");
  const runSweep = () => {
    compressUncompressedImages().catch((err) => {
      console.error("Falló el barrido de compresión de imágenes:", err);
    });
  };

  setTimeout(runSweep, FIRST_RUN_DELAY_MS);
  setInterval(runSweep, SWEEP_INTERVAL_MS);
}
