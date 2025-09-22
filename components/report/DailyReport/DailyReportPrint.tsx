'use client';

import * as React from 'react';
import type { DailyReportPayload, DeviceReport } from '@/types/report';
import { AnyEvent } from '@/types/anyEvent';

const styles = {
  page: {
    width: '794px', // A4 portrait ~96dpi
    minHeight: '1123px',
    background: '#ffffff',
    color: '#111827',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
    padding: '16px 16px 24px 16px',
    boxSizing: 'border-box' as const,
  },
  header: { textAlign: 'center' as const, borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '16px' },
  h1: { fontSize: '22px', fontWeight: 700 as const, margin: '0 0 6px' },
  meta: { fontSize: '12px', color: '#6B7280' },

  cardsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '10px 0 16px' },
  // ทำให้การ์ดจัดกึ่งกลางทั้งหมด
  card: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', background: '#F9FAFB', textAlign: 'center' as const },

  cardLabel: { fontSize: '12px', color: '#6B7280', margin: '0 auto' },
  cardValue: { fontSize: '20px', fontWeight: 700 as const, marginTop: '6px' },

  sectionTitle: { fontSize: '16px', fontWeight: 700 as const, margin: '18px 0 8px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '12px' },
  th: { background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '8px', textAlign: 'center' as const },
  td: { border: '1px solid #E5E7EB', padding: '8px', verticalAlign: 'top' as const, textAlign: 'center' as const },
  hint: { fontSize: '11px', color: '#6B7280', marginTop: '6px' },
  footer: { marginTop: '16px', fontSize: '12px', color: '#777', textAlign: 'right' as const, borderTop: '1px solid #E5E7EB', paddingTop: '6px' },
};

// -----------------------------
// helpers
// -----------------------------
const minutes = (sec?: number | null) => Math.round(Number(sec ?? 0) / 60);
const sumSec = (items?: { durationSec?: number | null }[]) =>
  (items ?? []).reduce((a, b) => a + Number(b.durationSec ?? 0), 0);

// เวลาไทย 24 ชม.
const fmtDTTH24 = (v?: string | null) => {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

// แปลง "นาที" → "X ชม. Y นาที"
const toHMThaiFromMinutes = (totalMin: number) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} ชม. ${m} นาที`;
};

export function DailyReportPrint({ data }: { data: DailyReportPayload }) {
  const devices: DeviceReport[] = Array.isArray(data.devices) ? data.devices : [];

  // KPI summary
  const totalDevices = devices.length;

  // รวม downtime ทั้งหมดเป็น "นาที" (ไว้ใช้คำนวณ uptime %) แต่เวลาแสดงจะเป็น ชม:นาที
  const totalDowntimeMin = devices.reduce(
    (acc, d) => acc + minutes(sumSec(d.offline) + sumSec(d.powerFail)),
    0
  );

  const totalEvents = devices.reduce(
    (acc, d) => acc + (d.offline?.length || 0) + (d.powerFail?.length || 0),
    0
  );

  const totalMinInPeriod =
    Math.max(1, totalDevices) *
    Math.max(1, Number(data.periodTotalMinutes ?? 0) || 1440);

  const uptimePercent =
    totalMinInPeriod > 0 ? ((totalMinInPeriod - totalDowntimeMin) / totalMinInPeriod) * 100 : 100;

  // per-device rows
  const perDeviceOffline = devices.map((d) => {
    const dtMin = minutes(sumSec(d.offline));
    const evCount = d.offline?.length || 0;
    return {
      id: d.meta.upsId,
      ip: d.meta.ip,
      loc: d.meta.location || '-',
      dtMin, // minutes (for raw calc)
      dtHM: toHMThaiFromMinutes(dtMin), // ชม:นาที (for display)
      evCount,
      last: d.meta.lastStatus || '-',
    };
  }).filter(r => r.evCount > 0); // แสดงเฉพาะที่มีเหตุการณ์

  const perDevicePowerFail = devices.map((d) => {
    const dtMin = minutes(sumSec(d.powerFail));
    const evCount = d.powerFail?.length || 0;
    return {
      id: d.meta.upsId,
      ip: d.meta.ip,
      loc: d.meta.location || '-',
      dtMin,
      dtHM: toHMThaiFromMinutes(dtMin),
      evCount,
      last: d.meta.lastStatus || '-',
    };
  }).filter(r => r.evCount > 0); // แสดงเฉพาะที่มีเหตุการณ์

  // unified event log (จาก/เป็น/เวลาเปลี่ยน/ระยะเวลา)
  const unifiedEvents: {
    upsId: string;
    from: string;
    to: string;
    changedAt: string;   // ไทย 24 ชม.
    durationHM: string;  // ชม:นาที
  }[] = [];

  devices.forEach((d) => {
    (d.offline ?? []).forEach((ev: AnyEvent) => {
      const durMin = minutes(ev.durationSec);
      unifiedEvents.push({
        upsId: d.meta.upsId,
        from: (ev.fromStatus ?? 'online') || 'online',
        to: (ev.toStatus ?? 'offline') || 'offline',
        changedAt: fmtDTTH24(ev.start),
        durationHM: toHMThaiFromMinutes(durMin),
      });
    });
    (d.powerFail ?? []).forEach((ev: AnyEvent) => {
      const durMin = minutes(ev.durationSec);
      unifiedEvents.push({
        upsId: d.meta.upsId,
        from: (ev.fromStatus ?? 'online') || 'online',
        to: (ev.toStatus ?? 'warning') || 'warning',
        changedAt: fmtDTTH24(ev.start),
        durationHM: toHMThaiFromMinutes(durMin),
      });
    });
  });

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.h1}>UPS Downtime Report</h1>
        <div style={styles.meta}>
          ช่วงวันที่: {data.periodStart} ถึง {data.periodEnd}
          <br />
          วันที่ออกรายงาน: {fmtDTTH24(String(data.generatedAt))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>จำนวน UPS</div>
          <div style={styles.cardValue}>{totalDevices}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Downtime รวม (ชม:นาที)</div>
          <div style={styles.cardValue}>{toHMThaiFromMinutes(totalDowntimeMin)}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>เหตุการณ์สถานะเปลี่ยน (ครั้ง)</div>
          <div style={styles.cardValue}>{totalEvents}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>อัพไทม์โดยรวม (%)</div>
          <div style={styles.cardValue}>{uptimePercent.toFixed(2)}%</div>
        </div>
      </div>

      {/* Per-device Offline - แสดงเฉพาะเมื่อมีเหตุการณ์ */}
      {perDeviceOffline.length > 0 && (
        <>
          <div style={styles.sectionTitle}>สรุปต่ออุปกรณ์ Offline</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>UPS ID</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>สถานที่</th>
                <th style={styles.th}>Downtime (ชม:นาที)</th>
                <th style={styles.th}>เหตุการณ์</th>
                <th style={styles.th}>สถานะล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {perDeviceOffline.map((r, idx) => (
                <tr key={`offsum-${idx}`}>
                  <td style={styles.td}>{r.id}</td>
                  <td style={styles.td}>{r.ip}</td>
                  <td style={styles.td}>{r.loc}</td>
                  <td style={styles.td}>{r.dtHM}</td>
                  <td style={styles.td}>{r.evCount}</td>
                  <td style={styles.td}>{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Per-device PowerFail - แสดงเฉพาะเมื่อมีเหตุการณ์ */}
      {perDevicePowerFail.length > 0 && (
        <>
          <div style={styles.sectionTitle}>สรุปต่ออุปกรณ์ PowerFail</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>UPS ID</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>สถานที่</th>
                <th style={styles.th}>Downtime (ชม:นาที)</th>
                <th style={styles.th}>เหตุการณ์</th>
                <th style={styles.th}>สถานะล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {perDevicePowerFail.map((r, idx) => (
                <tr key={`pfsum-${idx}`}>
                  <td style={styles.td}>{r.id}</td>
                  <td style={styles.td}>{r.ip}</td>
                  <td style={styles.td}>{r.loc}</td>
                  <td style={styles.td}>{r.dtHM}</td>
                  <td style={styles.td}>{r.evCount}</td>
                  <td style={styles.td}>{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Detailed Events - แสดงเฉพาะเมื่อมีเหตุการณ์ */}
      {unifiedEvents.length > 0 && (
        <>
          <div style={styles.sectionTitle}>รายละเอียดเหตุการณ์ (ช่วงที่เลือก)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>UPS ID</th>
                <th style={styles.th}>สถานะเดิม</th>
                <th style={styles.th}>สถานะปัจจุบัน</th>
                <th style={styles.th}>เวลาที่เกิดเหตุการณ์ (ไทย 24ชม.)</th>
                <th style={styles.th}>ระยะเวลา (ชม:นาที)</th>
              </tr>
            </thead>
            <tbody>
              {unifiedEvents.map((ev, i) => (
                <tr key={`evt-${i}`}>
                  <td style={styles.td}>{ev.upsId}</td>
                  <td style={styles.td}>{ev.from}</td>
                  <td style={styles.td}>{ev.to}</td>
                  <td style={styles.td}>{ev.changedAt}</td>
                  <td style={styles.td}>{ev.durationHM}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ข้อความเมื่อไม่มีเหตุการณ์เลย */}
      {unifiedEvents.length === 0 && (
        <div style={styles.sectionTitle}>
          ✅ ไม่มีเหตุการณ์ Offline หรือ PowerFail ในช่วงเวลาที่เลือก - ระบบทำงานปกติ
        </div>
      )}

      <div style={styles.hint}>
        * หมายเหตุ: ระยะเวลา (ชม:นาที) ถูกคำนวณจากนาทีโดยปัดค่าตามมาตรฐาน Math.round()
      </div>

      <div style={styles.footer}>Confidential - Internal Use Only</div>
    </div>
  );
}