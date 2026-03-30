"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Sparkles } from "lucide-react";
import type { ReceiptScanResult } from "@/lib/receipt-scanner";

type ScanState = "idle" | "uploading" | "scanning" | "error";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ReceiptScannerProps {
  onScanComplete: (result: ReceiptScanResult, receiptUrl: string) => void;
  isPlus: boolean;
}

export function ReceiptScanner({ onScanComplete, isPlus }: ReceiptScannerProps) {
  const [state, setState] = useState<ScanState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 10 MB.");
        return;
      }

      setState("uploading");

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Not authenticated");
          setState("error");
          return;
        }

        const safeName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .substring(0, 50);
        const fileName = `${user.id}/receipt/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("hsa-documents")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          setState("error");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("hsa-documents").getPublicUrl(fileName);

        setState("scanning");

        const response = await fetch("/api/receipts/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: publicUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to scan receipt");
          setState("error");
          return;
        }

        onScanComplete(data as ReceiptScanResult, publicUrl);
        setState("idle");
      } catch (err) {
        console.error("Receipt scan failed:", err);
        setError("Something went wrong. Please try again or enter details manually.");
        setState("error");
      }
    },
    [onScanComplete]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleScan(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isProcessing = state === "uploading" || state === "scanning";

  if (!isPlus) {
    return (
      <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full bg-amber-100 p-2">
            <Camera className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0C1220]">Scan a Receipt</p>
            <p className="text-xs text-[#64748B]">
              Auto-fill expense details from a photo
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            <Sparkles className="h-3 w-3" />
            Plus
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.heic"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
        className="w-full h-auto py-3 border-dashed border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {state === "uploading" ? "Uploading receipt..." : "Scanning with AI..."}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Camera className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Scan Receipt</span>
            <span className="text-xs text-[#64748B]">Upload or take a photo</span>
          </div>
        )}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
