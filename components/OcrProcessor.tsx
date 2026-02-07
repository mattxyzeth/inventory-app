"use client";

import { useEffect, useState } from "react";
import type { OcrResult } from "@/types";

interface OcrProcessorProps {
  imageData: string | null;
  onResult: (result: OcrResult) => void;
}

function parseOcrText(text: string): OcrResult {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Look for SKU patterns: "SKU: ABC-12345", "SKU ABC12345", standalone codes
  const skuPattern = /(?:SKU[:\s#-]*)?([A-Z]{2,}[\-]?\d{3,}[\w-]*)/i;
  let sku = "";
  let skuLineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(skuPattern);
    if (match && !sku) {
      sku = match[1].toUpperCase();
      skuLineIdx = i;
      break;
    }
  }

  // Name: longest line that isn't the SKU line
  const candidateLines = lines.filter((_, i) => i !== skuLineIdx);
  const name =
    candidateLines.sort((a, b) => b.length - a.length)[0] || "";

  return { name, sku, confidence: 0 };
}

export function OcrProcessor({ imageData, onResult }: OcrProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageData) return;

    let cancelled = false;

    async function runOcr() {
      setProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng", undefined, {
          logger: (m) => {
            if (m.status === "recognizing text" && !cancelled) {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });

        const { data } = await worker.recognize(imageData as string);
        await worker.terminate();

        if (!cancelled) {
          const parsed = parseOcrText(data.text);
          onResult(parsed);
        }
      } catch (err) {
        console.error("OCR failed:", err);
        if (!cancelled) {
          setError("OCR failed. Please try again or enter details manually.");
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    }

    runOcr();
    return () => {
      cancelled = true;
    };
  }, [imageData, onResult]);

  if (!processing && !error) return null;

  return (
    <div className="p-3 rounded-lg bg-gray-100 text-sm">
      {processing && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600">Reading label...</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
