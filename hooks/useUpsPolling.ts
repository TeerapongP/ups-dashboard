"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { UPSData } from "@/types/ups";

interface UseUpsPollingReturn {
  upsData: UPSData[];
  loading: boolean;
  error: string | null;
}


export const useUpsPolling = (
requestUrl: string, intervalMs: number = 30000): UseUpsPollingReturn => {
  const [upsData, setUpsData] = useState<UPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const aliveRef = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(requestUrl, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items = data?.items ?? [];
      setUpsData(items);
      setError(null);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [requestUrl]);

  const scheduleNext = useCallback(() => {
    if (!aliveRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = window.setTimeout(async () => {
      await fetchOnce();
      scheduleNext();
    }, intervalMs);
  }, [fetchOnce, intervalMs]);

  useEffect(() => {
    aliveRef.current = true;

    // เริ่มรอบแรกทันที แล้วตั้งโพลลิ่งต่อ
    setLoading(true);
    fetchOnce().then(() => scheduleNext());

    return () => {
      aliveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      inFlightRef.current = false;
    };
  }, [fetchOnce, scheduleNext]);

  return { upsData, loading, error };
};
