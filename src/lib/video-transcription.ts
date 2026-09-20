import { execFile } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { openai } from "@/lib/openai-client";

const execFileAsync = promisify(execFile);

// Reels/TikToks son típicamente <3 min; un tope generoso evita costos/tiempos
// de Whisper fuera de control si alguien pega por error un video larguísimo.
const MAX_DURATION_SECONDS = 15 * 60;
const MAX_FILESIZE = "80M";
const METADATA_TIMEOUT_MS = 20_000;
const DOWNLOAD_TIMEOUT_MS = 90_000;
const EXEC_MAX_BUFFER = 10 * 1024 * 1024;

type YtDlpMetadata = {
  title?: string;
  description?: string;
  duration?: number;
};

export type VideoTranscriptionResult = {
  transcript: string;
  title?: string;
  description?: string;
};

async function getMetadata(url: string): Promise<YtDlpMetadata> {
  const { stdout } = await execFileAsync(
    "yt-dlp",
    ["--skip-download", "-j", "--no-playlist", url],
    { timeout: METADATA_TIMEOUT_MS, maxBuffer: EXEC_MAX_BUFFER },
  );
  return JSON.parse(stdout) as YtDlpMetadata;
}

/** Descarga solo el audio a `<dir>/audio.mp3` — el nombre de salida es fijo. */
async function downloadAudio(url: string, dir: string): Promise<string> {
  await execFileAsync(
    "yt-dlp",
    [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "5",
      "--no-playlist",
      "--max-filesize",
      MAX_FILESIZE,
      "-o",
      path.join(dir, "audio.%(ext)s"),
      url,
    ],
    { timeout: DOWNLOAD_TIMEOUT_MS, maxBuffer: EXEC_MAX_BUFFER },
  );
  return path.join(dir, "audio.mp3");
}

/**
 * Descarga el audio de un reel/video (Instagram o TikTok) con yt-dlp, lo
 * transcribe con Whisper y borra el archivo descargado al terminar —
 * siempre, haya éxito o error, porque no nos sirve de nada guardarlo.
 */
export async function transcribeVideoFromUrl(url: string): Promise<VideoTranscriptionResult> {
  let metadata: YtDlpMetadata;
  try {
    metadata = await getMetadata(url);
  } catch {
    throw new Error(
      "No pudimos leer ese video (puede requerir iniciar sesión o ya no estar disponible).",
    );
  }

  if (metadata.duration && metadata.duration > MAX_DURATION_SECONDS) {
    throw new Error(
      `El video dura más de ${Math.round(MAX_DURATION_SECONDS / 60)} minutos, demasiado largo para transcribir automáticamente.`,
    );
  }

  const dir = await mkdtemp(path.join(tmpdir(), "nutriplus-video-"));
  try {
    let audioPath: string;
    try {
      audioPath = await downloadAudio(url, dir);
    } catch {
      throw new Error(
        "No pudimos descargar el audio de ese video (puede requerir iniciar sesión o ya no estar disponible).",
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      // audioPath es un archivo temporal en runtime, no algo que Next deba
      // rastrear/empaquetar como dependencia estática del build.
      file: createReadStream(/*turbopackIgnore: true*/ audioPath),
      model: "gpt-4o-transcribe",
    });

    return {
      transcript: transcription.text,
      title: metadata.title,
      description: metadata.description,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
