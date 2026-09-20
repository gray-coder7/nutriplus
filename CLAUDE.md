# NutriPlus

App web personal para administrar recetas saludables, calcular macronutrientes,
ajustar porciones y generar listas de super semanales. Un solo usuario (Jorge),
sin necesidad de features multiusuario/colaborativas.

## Visión del producto

- Biblioteca de recetas propias (las agrega Jorge, no hay scraping ni importación
  automática de recetas de terceros).
- Cada receta se etiqueta por tipo de comida: **desayuno, comida, cena, almuerzo,
  snacks** (una receta puede tener más de una etiqueta, ej. un smoothie puede ser
  desayuno + snack).
- Cada receta tiene: imagen generada por IA, descripción general, macronutrientes
  (calorías, proteína, carbohidratos, grasa) y número de porciones base.
- Las recetas son editables: ingredientes, instrucciones y **porciones** (al
  cambiar el número de porciones, las cantidades de ingredientes se recalculan
  proporcionalmente).
- Alta de recetas por **tres vías**: formulario manual, texto libre pegado +
  asistencia de IA (Claude estructura nombre/ingredientes/instrucciones/macros
  a partir del texto), o pegando una **URL** (sitio de recetas, reel de
  Instagram, video de TikTok) — la app intenta extraer el contenido y usa IA
  para convertirlo en una receta estructurada, siempre editable antes de
  guardar.
- Planeador semanal: se eligen recetas + porciones para armar el plan de la
  semana, y de ahí se genera una **lista de super** consolidada (ingredientes
  agregados y sumados entre recetas), agrupada por categoría, con checkboxes
  para ir tachando lo que ya se compró.

## Stack técnico

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (componentes accesibles, fáciles de theming)
- **Base de datos**: PostgreSQL
  - **Desarrollo local**: Postgres 16 vía Homebrew, corriendo nativo en la Mac
    (`brew services`), base `nutriplus_dev`. Se eligió esto en vez de Docker
    porque Docker no está instalado en esta máquina.
  - **Producción**: instancia de Postgres en Coolify (ver `conections.md`).
    Esa instancia **no es pública** (`is_public: false`, sin puerto expuesto)
    — solo es alcanzable desde dentro de la red de Coolify. Por eso no se usa
    para desarrollo local; su `DATABASE_URL` se configura directo como
    variable de entorno del app en Coolify al hacer deploy, nunca en el
    `.env` local.
- **ORM**: Prisma 7 (generator `prisma-client`, requiere driver adapter
  explícito — usamos `@prisma/adapter-pg` + `pg`). El cliente generado vive en
  `src/generated/prisma` (gitignored, se regenera con `npx prisma generate`).
  Prisma 7 introduce cambios importantes respecto a versiones previas (config
  en `prisma7.config.ts` en vez de `datasource.url` en el schema, adapters
  obligatorios, etc.) — hay skills de referencia instaladas en
  `.claude/skills/prisma-*` con el detalle si hace falta consultarlas.
- **Generación de imágenes IA**: Kie API (ver `conections.md` para la key) —
  se usa para generar la imagen de cada receta a partir de su nombre/descripción
- **Asistencia con IA de texto**: API de Anthropic (Claude) — útil para:
  - Parsear una receta pegada en texto libre a estructura (ingredientes,
    instrucciones, porciones)
  - Estimar/sugerir macronutrientes cuando no se proporcionan
  - Generar el prompt de imagen para mandar a Kie
- **Deploy**: Coolify (hay MCP de Coolify RawCloud conectado en este entorno)

### Manejo de secretos

`conections.md` en la raíz del repo contiene credenciales reales en texto plano
(API key de Anthropic, connection string de Postgres con usuario/password, key
de Kie). **Nunca** copiar esos valores a código fuente, commits, o este archivo.

- Las credenciales reales viven en `.env.local` (ignorado por git), leídas desde
  `conections.md` una sola vez al hacer el setup inicial.
- `.gitignore` ya excluye `conections.md`, `.env*` y `node_modules`.
- Antes de cualquier `git push` a un remoto, verificar que no se haya colado
  ningún secreto en el diff.

## Convenciones de desarrollo

- TypeScript estricto, sin `any` salvo justificación clara.
- Server Components por default; Client Components solo donde haya
  interactividad (formularios, drag/drop, checkboxes de la lista de super).
- Mutaciones vía Server Actions de Next.js en vez de API routes cuando sea
  posible; usar API routes solo para llamadas externas (Kie, Anthropic) que
  necesiten ejecutarse server-side con la key protegida.
- Tablas/columnas usan el default de Prisma: nombres de modelo/campo en
  `camelCase` tal cual en la base de datos (sin `@map`/`@@map`) — el único
  consumidor de la DB es Prisma, así que no hay razón para mantener un mapeo
  extra a snake_case.
- Sin autenticación multiusuario. Si se requiere proteger el acceso, usar un
  passcode simple por cookie/middleware — no construir un sistema de cuentas.
- Comentarios solo cuando el *por qué* no sea obvio (ej. por qué se escala así
  una cantidad, por qué se agrupan ciertos ingredientes en la lista de super).
- **Toda Server Action que pueda tardar más de ~30-60s (generación con IA,
  llamadas externas lentas) debe terminar en `redirect()`**, nunca solo
  `revalidatePath()` + return. Ver la nota en Fase 2 — probado que una acción
  sin `redirect()` se queda sin responder pasado ~1 min cuando el request usa
  el fallback de formulario sin JS.

## Modelo de datos

Ya implementado en [`prisma/schema.prisma`](./prisma/schema.prisma) (fuente de
verdad — este bloque es solo un resumen):

```
Recipe
  id, name, description, mealTypes[] (BREAKFAST|LUNCH|DINNER|BRUNCH|SNACK)
  imageUrl, imagePrompt
  baseServings
  caloriesPerServing, proteinGPerServing, carbsGPerServing, fatGPerServing
  instructions (texto/pasos, referidos a baseServings)
  sourceType (MANUAL|TEXT_IMPORT|URL_IMPORT), sourceUrl, sourceRawText
  createdAt, updatedAt

Ingredient
  id, recipeId
  name, quantity, unit, category (PRODUCE|PROTEIN|DAIRY|PANTRY|SPICES|FROZEN|BEVERAGES|OTHER)
  sortOrder

MealPlan
  id, weekStartDate, name

MealPlanItem
  id, mealPlanId, recipeId
  dayOfWeek, mealType, servings

ShoppingList
  id, mealPlanId (nullable, se puede generar suelta), createdAt

ShoppingListItem
  id, shoppingListId
  name, quantity, unit, category
  isChecked, sortOrder
  sourceRecipeIds[] (para saber de qué recetas viene)
```

`sourceType`/`sourceUrl`/`sourceRawText` en `Recipe` existen para soportar las
tres vías de alta (manual, texto + IA, URL/Instagram/TikTok + IA): guardan de
dónde salió la receta y el texto crudo usado para generarla, por si hay que
reprocesar o mostrar la fuente original.

Reglas clave:
- Escalar ingredientes = `cantidad_base * (porciones_deseadas / base_servings)`.
  Los macros por porción **no cambian** al escalar (son "por porción"); lo que
  cambia es cuántas porciones se generan.
- La lista de super se genera sumando `quantity` de ingredientes con mismo
  `name` + `unit` entre todas las recetas del plan semanal, multiplicado por
  el factor de escala de cada receta.

## Plan de desarrollo

### Fase 0 — Setup
- [x] `create-next-app` (TypeScript, Tailwind, App Router, src/) en la raíz
      del repo
- [ ] Configurar shadcn/ui (pendiente — se hace al entrar a Fase 1 cuando ya
      haya mockups que definan qué componentes hacen falta)
- [x] Prisma 7 + adapter de Postgres, schema inicial, `prisma migrate dev`
      contra la DB local (`nutriplus_dev` en Postgres 16 de Homebrew)
- [x] `.env` con `DATABASE_URL` (local), `ANTHROPIC_API_KEY`, `KIE_API_KEY`
- [x] `.gitignore`, `git init`, primer commit
- [x] Layout base + paleta de colores/tema provisional (fitness, alegre,
      colores vivos) — se refina con los mockups de Claude Design

### Fase 1 — CRUD de recetas
- [x] Modelo Prisma: `Recipe`, `Ingredient` (con `sourceType`/`sourceUrl` para
      soportar las 3 vías de alta)
- [x] Formulario de alta/edición **manual** de receta (nombre, descripción,
      tags de meal_type, porciones base, macros, ingredientes, instrucciones)
      — `RecipeForm` en `src/components/recipe-form.tsx`, server actions en
      `src/app/recetas/actions.ts`. Probado extremo a extremo (crear, editar,
      validación de datos incompletos) contra la DB local.
- [x] Alta por **texto libre + IA** y **URL** — `/recetas/importar`
      (`src/app/recetas/importar/page.tsx`). Un solo flujo en dos fases:
      1. `extractRecipe` (`src/app/recetas/actions.ts`) recibe texto pegado o
         una URL, arma un "contexto" de texto (ver `fetchUrlContent` en
         `src/lib/recipe-extraction.ts`) y llama a Claude
         (`claude-opus-5`, `client.messages.parse` con `zodOutputFormat`)
         para estructurarlo en el mismo shape que usa `RecipeForm`.
      2. El resultado se muestra en `RecipeForm` pre-llenado (con banner de
         aviso) para revisar/editar antes de guardar — nunca se guarda
         directo. `sourceType`/`sourceUrl`/`sourceRawText` viajan como campos
         ocultos hasta `createRecipe`.
      - **Extracción de URL** (`fetchUrlContent`): primero intenta JSON-LD
        `schema.org/Recipe` (dato estructurado, el más confiable, típico en
        sitios de recetas); si no hay, cae a `og:description` + texto plano
        de la página. Para TikTok usa el endpoint público de oEmbed
        (caption del video, no hay transcripción de audio). Instagram no
        tiene una vía confiable sin login — si la extracción da muy poco
        contenido, se le pide al usuario pegar el texto/caption directamente
        en vez de la URL.
      - Probado extremo a extremo con una llamada real a Claude (texto libre)
        y con un fixture local de JSON-LD (URL) — ambos casos guardaron
        correctamente. El oEmbed de TikTok no se probó contra un video real
        (requiere una URL pública real) — validar con un link real cuando se
        use por primera vez.
      - Pendiente futuro si hace falta mejor cobertura de Instagram/TikTok:
        evaluar un servicio de transcripción de audio/video dedicado; no se
        integró en esta pasada.
- [x] Vista de biblioteca de recetas con filtro por etiqueta
      (desayuno/comida/cena/almuerzo/snacks) — `src/app/recetas/page.tsx`,
      filtro vía query string (`?tag=`), sin JS necesario para filtrar
- [x] Vista de detalle de receta — `src/app/recetas/[id]/page.tsx`, incluye
      editar/eliminar (`src/app/recetas/[id]/editar/page.tsx`,
      `src/components/delete-recipe-button.tsx`)

### Fase 2 — Generación de imagen con IA
- [x] Integración con Kie API (`src/lib/kie.ts`) — modelo `4o-image-api` via
      `POST /jobs/createTask` + polling de `GET /jobs/recordInfo` hasta
      `state: success`. Cada fetch tiene su propio timeout (no solo un
      deadline global) para no depender de una sola llamada lenta.
- [x] Anthropic redacta el prompt de imagen antes de mandarlo a Kie
      (`src/lib/recipe-image-prompt.ts`, `claude-opus-5`) — asegura que todas
      las imágenes mantengan el mismo estilo de fotografía de comida
      vibrante/apetitosa de la app, en vez de depender de lo que el usuario
      haya escrito en la descripción.
- [x] Botón "generar/regenerar imagen" en el detalle de receta
      (`src/components/generate-image-button.tsx`)
- [x] **Los bytes de la imagen se guardan en Postgres** (`RecipeImage`,
      modelo separado 1:1 con `Recipe`), no en el filesystem — las URLs que
      da Kie expiran ~24h y Coolify no garantiza disco persistente. Se sirven
      via `GET /api/recipe-images/[id]` (`src/app/api/recipe-images/[id]/route.ts`).
- [x] Probado extremo a extremo con una generación real (Claude + Kie +
      Postgres): ~70-90s por imagen, resultado visualmente excelente.

**Hallazgo importante (afecta cualquier Server Action futura que tarde
mucho):** un Server Action que **no** hace `redirect()` y tarda más de ~1
minuto se queda sin responder cuando el request no trae JS habilitado (el
fallback de formulario progresivo de Next) — probado exhaustivamente en dev
y producción, con y sin `revalidatePath`, con distintos clientes HTTP,
incluso con una acción de prueba que solo hacía `sleep`. La única acción
"sin lógica" que sí respondió de forma confiable fue una que terminaba en
`redirect()`. Por eso `generateRecipeImage` termina con
`redirect(\`/recetas/\${recipeId}\`)` en vez de solo `revalidatePath` +
retornar — **cualquier acción nueva que pueda tardar más de ~30-60s debe
terminar en `redirect()`**, no solo revalidar y retornar.

### Fase 3 — Escalado de porciones
- [x] Selector de porciones en el detalle de receta (stepper +/−, con
      "Restablecer" cuando no coincide con las porciones base) —
      `src/components/recipe-servings.tsx`
- [x] Recálculo en vivo de cantidades de ingredientes — cálculo 100%
      client-side (`quantity * servings/baseServings`), sin round-trip al
      servidor; los macros por porción no cambian (son por porción, no por
      receta completa)
- [x] Edición manual de ingredientes/instrucciones persistida — ya existía
      desde Fase 1 (`RecipeForm` / `updateRecipe`); el escalado es solo una
      vista, no reemplaza la edición real de la receta

### Fase 4 — Planeador semanal
- [x] Vista de semana (lun-dom) con slots por meal_type — `/plan`
      (`src/app/plan/page.tsx`), filas en orden cronológico del día
      (desayuno → almuerzo → comida → snack → cena, ver
      `MEAL_TYPE_ORDER` en `src/lib/constants.ts`), navegación
      anterior/siguiente/hoy vía `?week=YYYY-MM-DD`
- [x] Agregar receta a un slot + definir porciones — cada slot es un mini
      formulario (`src/components/plan-slot.tsx`) con `<select>` de recetas
      (agrupadas: las que ya traen esa etiqueta de comida primero) + cantidad
      de porciones; sin JS necesario (progressive enhancement, igual que el
      resto de la app). Un slot puede tener más de una receta.
- [x] Guardar/cargar planes semanales — `MealPlan` se crea perezosamente (al
      primer `assignMealPlanItem` de esa semana, no al visitar la página) via
      `getOrCreateMealPlan`; `weekStartDate` es `@unique` y siempre se
      normaliza a medianoche UTC del lunes (`src/lib/week.ts`) para evitar
      duplicados. Probado extremo a extremo: asignar, mostrar, quitar,
      navegar entre semanas.

**Limitación conocida (aceptable para MVP):** "la semana actual" por default
se calcula con fecha UTC del servidor, no con la zona horaria real del
usuario — cerca de medianoche local puede mostrar la semana equivocada por
default. Se resuelve navegando manualmente con los links de
anterior/siguiente; no se resolvió con detección de zona horaria porque
requeriría un client component solo para eso.

### Fase 5 — Lista de super
- [x] Generar lista consolidada a partir del plan semanal — botón en `/plan`
      (o "Regenerar" en la lista misma) llama a `generateOrRegenerateShoppingList`
      (`src/app/listas/actions.ts`), que suma ingredientes de todas las
      recetas del plan escalados por `servings/baseServings` de cada item
      (`buildConsolidatedItems` en `src/lib/shopping-list.ts`). Regenerar
      conserva los ítems agregados a mano (solo se borran los que vienen de
      receta, filtrando por `sourceRecipeIds` no vacío).
- [x] Agrupar por categoría de ingrediente — `/listas/[id]`
      (`src/components/shopping-list-checklist.tsx`), orden de
      `INGREDIENT_CATEGORY_ORDER`
- [x] Checkboxes para marcar comprado (tachado + opacidad), persistidos en BD
      — único pedazo de la app con UI optimista (`useOptimistic` +
      `useTransition`) porque es la pantalla que se usa parada en el súper:
      no puede sentirse como un recarga de página por cada tap. El resto de
      la app usa el patrón normal de redirect tras server action.
- [x] Permitir agregar ítems manuales a la lista — formulario simple al final
      de `/listas/[id]`, con categoría opcional (default OTHER)

También se agregó `/listas` como índice de todas las listas generadas (no
estaba en el checklist original, pero es la forma natural de volver a ver
listas de semanas pasadas).

### Fase 6 — Pulido
- [ ] Responsive / mobile-first (la lista de super se usa desde el súper, en
      el celular)
- [ ] Empty states, loading states, manejo de errores de las APIs externas
- [ ] Revisar accesibilidad básica (contraste, labels de formularios)

### Fase 7 — Deploy
- [ ] Deploy a Coolify
- [ ] Variables de entorno configuradas en Coolify (no en el repo)
- [ ] Verificar conexión a la Postgres de producción

## Assets de diseño

Ver [`design-mockups-prompt.md`](./design-mockups-prompt.md): prompt listo
para usar en Claude Design y generar los mockups de todas las pantallas antes
de implementar la UI.

**Mockups ya generados** (Claude Design, canvas con las 7 pantallas en
desktop + mobile más una guía de estilo): https://claude.ai/artifact/361RvDSm4Bbxxcvcpve2jH

Resumen del sistema de diseño real (fuente de verdad para Fase 6 — reemplaza
la paleta/tipografía provisional usada en Fases 0-5):
- Tipografía: **Fredoka** (títulos, 500/600/700) + **Manrope** (cuerpo,
  400-800), vía Google Fonts.
- Paleta: Coral `#FF6A3D` (primario), Lima `#8CC63F`, Aqua `#21C7B8`,
  Sol `#FFC633`, Berry `#E14F82` (acentos); Ink `#2B2A28` (texto),
  `#6B6862` (texto secundario), `#EAE7E0` (borde), `#F6F5F0` (fondo app),
  blanco (superficie).
- Botones tipo pill (`border-radius: 999px`), tags de comida con punto de
  color + texto, cards de receta con imagen 4:3 y sombra suave, anillos de
  macros (conic-gradient) en el detalle de receta, checkboxes cuadrados
  custom (no el checkbox nativo del navegador) en la lista de super.
- Layout con sidebar de navegación a la izquierda (no un header horizontal
  como el provisional actual).
