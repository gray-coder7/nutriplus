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
- Nombres de tablas/columnas en `snake_case` en la base de datos, mapeados a
  `camelCase` en Prisma/TS.
- Sin autenticación multiusuario. Si se requiere proteger el acceso, usar un
  passcode simple por cookie/middleware — no construir un sistema de cuentas.
- Comentarios solo cuando el *por qué* no sea obvio (ej. por qué se escala así
  una cantidad, por qué se agrupan ciertos ingredientes en la lista de super).

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
- [ ] Formulario de alta/edición **manual** de receta (nombre, descripción,
      tags de meal_type, porciones base, macros, ingredientes, instrucciones)
- [ ] Alta por **texto libre + IA**: textarea donde se pega una receta en
      texto suelto (ej. copiada de una nota) y Claude la estructura a
      nombre/descripción/ingredientes/instrucciones/macros estimados; el
      resultado se muestra editable antes de guardar (nunca se guarda directo)
- [ ] Alta por **URL** (sitio de recetas / Instagram / TikTok): se pega el
      link, el backend intenta obtener el contenido (texto de la página,
      caption/transcripción del video cuando sea posible) y se manda a Claude
      con el mismo flujo de estructuración + edición manual antes de guardar.
      Nota: la extracción de video de Instagram/TikTok puede requerir un
      servicio externo de transcripción — decidir proveedor cuando se llegue
      a esta fase, probablemente reutilizando Kie API si ofrece algo, si no
      evaluar alternativas puntuales en ese momento
- [ ] Vista de biblioteca de recetas con filtro por etiqueta
      (desayuno/comida/cena/almuerzo/snacks)
- [ ] Vista de detalle de receta

### Fase 2 — Generación de imagen con IA
- [ ] Integración con Kie API para generar imagen a partir de nombre +
      descripción de la receta
- [ ] (Opcional) Usar Anthropic para redactar un buen prompt de imagen antes
      de mandarlo a Kie
- [ ] Botón "regenerar imagen" en el detalle de receta

### Fase 3 — Escalado de porciones
- [ ] Selector de porciones en el detalle de receta
- [ ] Recalculo en vivo de cantidades de ingredientes
- [ ] Edición manual de ingredientes/instrucciones persistida (no solo el
      escalado automático)

### Fase 4 — Planeador semanal
- [ ] Vista de semana (lun-dom) con slots por meal_type
- [ ] Agregar receta a un slot + definir porciones
- [ ] Guardar/cargar planes semanales

### Fase 5 — Lista de super
- [ ] Generar lista consolidada a partir del plan semanal
- [ ] Agrupar por categoría de ingrediente
- [ ] Checkboxes para marcar comprado (con tachado visual), persistidos en BD
- [ ] Permitir agregar ítems manuales a la lista

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
