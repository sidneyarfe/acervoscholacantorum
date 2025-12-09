import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface ConversionProgress {
  progress: number;
  message: string;
}

interface UseAudioConverterReturn {
  convertToMp3: (file: File) => Promise<File>;
  isConverting: boolean;
  conversionProgress: ConversionProgress | null;
  error: string | null;
}

// Formats that need conversion (not natively supported well on iOS Safari)
const FORMATS_NEEDING_CONVERSION = [
  "audio/opus",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/x-m4a",
];

// Check file extension as fallback
const EXTENSIONS_NEEDING_CONVERSION = [
  ".opus",
  ".ogg",
  ".webm",
  ".flac",
  ".wav",
  ".aac",
  ".m4a",
];

export function useAudioConverter(): UseAudioConverterReturn {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const needsConversion = (file: File): boolean => {
    // Already MP3, no conversion needed
    if (file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3")) {
      return false;
    }

    // Check MIME type
    if (FORMATS_NEEDING_CONVERSION.includes(file.type)) {
      return true;
    }

    // Check extension as fallback
    const fileName = file.name.toLowerCase();
    return EXTENSIONS_NEEDING_CONVERSION.some((ext) => fileName.endsWith(ext));
  };

  const loadFFmpeg = async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      const percent = Math.round(progress * 100);
      setConversionProgress({
        progress: percent,
        message: `Convertendo: ${percent}%`,
      });
    });

    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    setConversionProgress({
      progress: 0,
      message: "Carregando conversor...",
    });

    // Load single-threaded core (no COOP/COEP required)
    await ffmpeg.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
    });

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const convertToMp3 = useCallback(async (file: File): Promise<File> => {
    setError(null);

    // If already MP3 or doesn't need conversion, return as-is
    if (!needsConversion(file)) {
      console.log("[AudioConverter] File is already MP3 or compatible, skipping conversion");
      return file;
    }

    setIsConverting(true);
    setConversionProgress({ progress: 0, message: "Iniciando conversão..." });

    try {
      const ffmpeg = await loadFFmpeg();

      // Get file extension for input
      const inputExt = file.name.split(".").pop()?.toLowerCase() || "audio";
      const inputFileName = `input.${inputExt}`;
      const outputFileName = "output.mp3";

      setConversionProgress({ progress: 10, message: "Preparando arquivo..." });

      // Write input file to FFmpeg virtual filesystem
      const inputData = await fetchFile(file);
      await ffmpeg.writeFile(inputFileName, inputData);

      setConversionProgress({ progress: 20, message: "Convertendo para MP3..." });

      // Run conversion with good quality settings
      // -i: input, -vn: no video, -ar: sample rate, -ac: channels, -b:a: bitrate
      await ffmpeg.exec([
        "-i", inputFileName,
        "-vn",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "192k",
        "-f", "mp3",
        outputFileName,
      ]);

      setConversionProgress({ progress: 90, message: "Finalizando..." });

      // Read output file
      const outputData = await ffmpeg.readFile(outputFileName);

      // Clean up virtual filesystem
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      // Create new File with MP3 extension
      // Convert FileData to a new ArrayBuffer for Blob constructor
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const uint8Array = outputData as Uint8Array;
      // Create a copy to ensure it's a proper ArrayBuffer (not SharedArrayBuffer)
      const copiedArray = new Uint8Array(uint8Array);
      const mp3File = new File(
        [copiedArray],
        `${originalName}.mp3`,
        { type: "audio/mpeg" }
      );

      setConversionProgress({ progress: 100, message: "Conversão concluída!" });

      console.log(
        `[AudioConverter] Converted ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to MP3 (${(mp3File.size / 1024 / 1024).toFixed(2)}MB)`
      );

      return mp3File;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro na conversão";
      console.error("[AudioConverter] Conversion error:", err);
      setError(errorMessage);
      throw new Error(`Falha na conversão para MP3: ${errorMessage}`);
    } finally {
      setIsConverting(false);
      // Clear progress after a short delay
      setTimeout(() => setConversionProgress(null), 2000);
    }
  }, []);

  return {
    convertToMp3,
    isConverting,
    conversionProgress,
    error,
  };
}
