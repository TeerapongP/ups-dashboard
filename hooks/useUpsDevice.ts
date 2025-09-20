import { useEffect, useState } from "react";
import { Device } from "@/lib/device";

export function useUpsDevice(url: string) {
  const [deviceData, setDeviceData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",  
          headers: {
            Accept: "application/json",
          },
          signal: ctrl.signal,
        });

        if (!res.ok) {
          let msg = `Request failed: ${res.status}`;
          try {
            const body = await res.json();
            if (body?.detail) msg += ` - ${JSON.stringify(body.detail)}`;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        if (active) setDeviceData(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (active && err?.name !== "AbortError") {
          setError(err?.message || "Error fetching data");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [url]);

  return { deviceData, loading, error };
}
