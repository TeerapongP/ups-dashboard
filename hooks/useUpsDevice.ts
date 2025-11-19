import { useEffect, useState, useRef, useCallback } from "react";
import { Device } from "@/lib/device";

export function useUpsDevice(url: string) {
  const [deviceData, setDeviceData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setDeviceData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  // โหลดครั้งแรก / เวลา url เปลี่ยน
  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  // ให้ component อื่นเรียกดึงใหม่ได้ทันที
  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { deviceData, loading, error, refetch, setDeviceData };
}
