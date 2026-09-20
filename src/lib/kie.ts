const KIE_API_BASE = "https://api.kie.ai/api/v1";
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 180000;
const REQUEST_TIMEOUT_MS = 20000;
const DOWNLOAD_TIMEOUT_MS = 30000;

function kieHeaders() {
  return {
    Authorization: `Bearer ${process.env.KIE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function createImageTask(prompt: string): Promise<string> {
  const res = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({
      model: "4o-image-api",
      input: { prompt, size: "1:1" },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = (await res.json()) as {
    code: number;
    msg: string;
    data?: { taskId: string };
  };

  if (!res.ok || body.code !== 200 || !body.data?.taskId) {
    throw new Error(`No se pudo iniciar la generación de imagen: ${body.msg ?? res.statusText}`);
  }

  return body.data.taskId;
}

type RecordInfoResponse = {
  code: number;
  msg: string;
  data?: {
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    resultJson?: string;
    failMsg?: string;
  };
};

async function pollImageTask(taskId: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    let body: RecordInfoResponse | null = null;

    try {
      const res = await fetch(`${KIE_API_BASE}/jobs/recordInfo?taskId=${taskId}`, {
        headers: kieHeaders(),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const parsed = (await res.json()) as RecordInfoResponse;
      if (!res.ok || parsed.code !== 200 || !parsed.data) {
        throw new Error(`No se pudo consultar el estado de la imagen: ${parsed.msg ?? res.statusText}`);
      }
      body = parsed;
    } catch (err) {
      // Una sola consulta lenta/fallida no debe tirar todo el proceso: se
      // reintenta mientras quede tiempo dentro del deadline general.
      if (Date.now() >= deadline) throw err;
    }

    if (body?.data?.state === "success") {
      const parsed = JSON.parse(body.data.resultJson ?? "{}") as { resultUrls?: string[] };
      const url = parsed.resultUrls?.[0];
      if (!url) throw new Error("Kie no regresó ninguna imagen para esta receta");
      return url;
    }

    if (body?.data?.state === "fail") {
      throw new Error(`La generación de imagen falló: ${body.data.failMsg ?? "error desconocido"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("La generación de imagen tardó demasiado, intenta de nuevo");
}

export async function generateImage(
  prompt: string,
): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string }> {
  const taskId = await createImageTask(prompt);
  const resultUrl = await pollImageTask(taskId);

  const imageRes = await fetch(resultUrl, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!imageRes.ok) {
    throw new Error("No se pudo descargar la imagen generada");
  }

  const mimeType = imageRes.headers.get("content-type") ?? "image/png";
  const data = new Uint8Array(await imageRes.arrayBuffer());
  return { data, mimeType };
}
