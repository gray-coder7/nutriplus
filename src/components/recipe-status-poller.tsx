"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * La importación y la generación de imagen corren en segundo plano en el
 * servidor (ver src/lib/recipe-import.ts y src/lib/recipe-image-generation.ts).
 * No hay websockets en la app, así que mientras `active` sea true este
 * componente refresca la página cada 3s para que el usuario vea el
 * resultado sin recargar a mano.
 */
export function RecipeStatusPoller({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [active, router]);

  return null;
}
