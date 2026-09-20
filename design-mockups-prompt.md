# Prompt para Claude Design — Mockups de NutriPlus

> Copia y pega todo el bloque de abajo (desde "Diseña...") en Claude Design.
> Está pensado para generar el set completo de mockups de la app en una sola
> sesión, pantalla por pantalla.

---

Diseña el sistema de UI y los mockups de alta fidelidad de **NutriPlus**, una
web app personal para planear comidas saludables: administrar recetas propias,
ver sus macronutrientes, ajustar porciones y generar la lista de super de la
semana. Es una app de uso diario, para consultar en escritorio mientras se
planea la semana y en el celular mientras se hace la compra en el súper.

## Dirección de arte

- **Sensación general**: alegre, energética, motivadora — que dé ganas de
  cocinar sano y de entrenar. Nada clínico ni "app de hospital"; nada
  minimalista-frío tampoco.
- **Paleta de color**: colores vivos y saturados tipo "fitness app moderna":
  un naranja/coral vibrante y un verde lima como acentos principales, apoyados
  con un turquesa/aqua y un amarillo sol para variedad; fondos en blanco o gris
  muy claro para que los colores respiren; texto en un gris carbón oscuro (no
  negro puro). Evita tonos pastel apagados — deben verse saturados y frescos.
- **Tipografía**: sans-serif redondeada y amigable para títulos (con
  personalidad, tipo geométrica redondeada), combinada con una sans-serif
  limpia y muy legible para texto de cuerpo. Jerarquía clara, títulos grandes
  y seguros.
- **Formas**: esquinas redondeadas generosas en cards y botones, mucho aire
  entre elementos, sombras suaves (no planas ni duras). Botones grandes,
  táctiles, fáciles de tocar en mobile.
- **Iconografía**: set de iconos simple, de línea gruesa o duotono, con
  toques de color — comida, calorías, reloj, porciones, checklist, carrito de
  super.
- **Imágenes de recetas**: fotografía de comida vibrante, bien iluminada, tipo
  "food photography" apetitosa — las imágenes de receta son generadas por IA,
  así que deben lucir como fotos reales de platillos, no ilustraciones.
- **Micro-motivación**: espacio para pequeños indicadores de progreso (ej.
  anillos o barras de macros, badges de "completado") que refuercen la
  sensación de logro.

## Sistema de componentes a definir primero

1. Paleta de color completa (primarios, acentos, superficie, texto, estados
   de éxito/alerta) con sus valores hex.
2. Escala tipográfica (H1–H4, body, caption, botón).
3. Botones (primario, secundario, texto, icon-button) en sus estados normal/
   hover/disabled.
4. Tag/chip para las etiquetas de comida (Desayuno, Comida, Cena, Almuerzo,
   Snacks) — cada una con su propio color de acento dentro de la paleta.
5. Card de receta (usada en grids de biblioteca y en el planeador semanal).
6. Badge/indicador de macronutrientes (calorías, proteína, carbos, grasa) —
   reusable en card y en detalle.
7. Checkbox/list-item con estado "tachado" para la lista de super.

## Pantallas a diseñar (desktop y su versión mobile responsive)

1. **Dashboard / Home**
   Vista de bienvenida al abrir la app: resumen del plan de la semana actual
   (qué días ya tienen recetas asignadas y cuáles faltan), accesos directos a
   "Agregar receta", "Ver biblioteca", "Planear semana" y "Lista de super
   activa" si hay una en curso.

2. **Biblioteca de recetas**
   Grid de cards de receta (imagen, nombre, tags de tipo de comida, calorías
   por porción). Filtro por etiqueta (Desayuno/Comida/Cena/Almuerzo/Snacks) —
   puede ser multi-selección — y buscador por nombre. Botón flotante o header
   con CTA "Nueva receta".

3. **Detalle de receta**
   Header con imagen grande generada por IA, nombre, tags, descripción
   general. Sección de macronutrientes por porción (calorías, proteína,
   carbohidratos, grasa) con un componente visual claro (ej. anillos o barras).
   Selector de número de porciones que recalcula en vivo la lista de
   ingredientes. Lista de ingredientes con cantidades. Instrucciones de
   preparación paso a paso. Botones de "Editar receta" y "Agregar al plan de
   la semana".

4. **Crear / editar receta**
   Formulario completo: nombre, descripción, selector múltiple de etiquetas de
   comida, porciones base, macros por porción, editor de lista de
   ingredientes (agregar/quitar filas con cantidad + unidad + nombre), editor
   de instrucciones (pasos numerados, reordenables), y un bloque para la
   imagen generada por IA con botón "Generar imagen" / "Regenerar imagen".

5. **Planeador semanal**
   Vista tipo calendario/tabla de lunes a domingo, con columnas por día y
   filas por tipo de comida (Desayuno/Comida/Cena/Almuerzo/Snacks). Cada slot
   permite arrastrar o seleccionar una receta de la biblioteca y define
   cuántas porciones. Barra o resumen de progreso de cuántos slots de la
   semana ya están planeados. CTA destacado "Generar lista de super" una vez
   armado el plan.

6. **Lista de super**
   Lista consolidada de ingredientes de todas las recetas de la semana,
   agrupada por categoría (ej. Frutas y verduras, Proteínas, Lácteos,
   Despensa, Congelados). Cada ítem con checkbox grande, cantidad total y
   unidad; al marcarlo se tacha visualmente (texto con strikethrough y opacidad
   reducida) y se mueve o se atenúa dentro de su sección. Debe verse muy usable
   en mobile con el celular en mano dentro del súper: checkboxes grandes,
   texto legible, scroll simple. Incluir opción de agregar un ítem manual.

7. **Estados vacíos**
   Ilustraciones/mensajes alegres para: biblioteca sin recetas todavía,
   semana sin planear, lista de super vacía/recién generada.

## Qué entregar

- Set de mockups por pantalla (desktop 1440px y mobile 390px) mostrando
  estados con contenido real de ejemplo (usa nombres de recetas saludables
  reales: ej. "Avena con plátano y almendras", "Bowl de pollo teriyaki",
  "Salmón al horno con espárragos", "Smoothie verde detox").
- La guía de estilo (paleta, tipografía, componentes) como una primera lámina
  antes de las pantallas.
- Consistencia visual entre todas las pantallas usando el mismo sistema de
  componentes.
