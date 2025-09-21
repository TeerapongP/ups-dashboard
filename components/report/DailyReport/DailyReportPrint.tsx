'use client';

import * as React from 'react';
import type { DailyReportPayload, DeviceReport } from '@/types/report';

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
  card: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', background: '#F9FAFB' },
  cardLabel: { fontSize: '12px', color: '#6B7280' },
  cardValue: { fontSize: '20px', fontWeight: 700 as const, marginTop: '6px' },
  sectionTitle: { fontSize: '16px', fontWeight: 700 as const, margin: '18px 0 8px' },
  subTitle: { fontWeight: 700 as const, margin: '10px 0 6px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '12px' },
  th: { background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '8px', textAlign: 'center' as const },
  td: { border: '1px solid #E5E7EB', padding: '8px', verticalAlign: 'top' as const, textAlign: 'center' as const },
  hint: { fontSize: '11px', color: '#6B7280', marginTop: '6px' },
  footer: { marginTop: '16px', fontSize: '12px', color: '#777', textAlign: 'right' as const, borderTop: '1px solid #E5E7EB', paddingTop: '6px' },
};

// helpers
const minutes = (sec?: number | null) => Math.round(Number(sec ?? 0) / 60);
const sumSec = (items?: { durationSec?: number | null }[]) =>
  (items ?? []).reduce((a, b) => a + Number(b.durationSec ?? 0), 0);
const fmtDT = (v?: string | null) => {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

type AnyEvent = {
  start?: string | null;
  end?: string | null;
  durationSec?: number | null;
  note?: string | null;
  voltage?: number | null;
  threshold?: number | null;
  fromStatus?: string | null;
  toStatus?: string | null;
};

export function DailyReportPrint({ data }: { data: DailyReportPayload }) {
  const devices: DeviceReport[] = Array.isArray(data.devices) ? data.devices : [];

  // KPI summary
  const totalDevices = devices.length;
  const totalDowntimeMin = devices.reduce(
    (acc, d) => acc + minutes(sumSec(d.offline) + sumSec(d.powerFail)),
    0
  );
  const totalEvents = devices.reduce(
    (acc, d) => acc + (d.offline?.length || 0) + (d.powerFail?.length || 0),
    0
  );
  const totalMinInPeriod =
    Math.max(1, totalDevices) * // ป้องกันหารศูนย์
    Math.max(1, Number(data.periodTotalMinutes ?? 0) || 1440); // default 1 วัน
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
      dtMin,
      evCount,
      last: d.meta.last_sta || '-',
    };
  });

  const perDevicePowerFail = devices.map((d) => {
    const dtMin = minutes(sumSec(d.powerFail));
    const evCount = d.powerFail?.length || 0;
    return {
      id: d.meta.upsId,
      ip: d.meta.ip,
      loc: d.meta.location || '-',
      dtMin,
      evCount,
      last: d.meta.lastStatus || '-',
    };
  });

  // unified event log (จาก/เป็น/เวลาเปลี่ยน/ระยะเวลา)
  // ถ้าไม่มี fromStatus/toStatus จะ infer แบบง่าย
  const unifiedEvents: {
    upsId: string;
    from: string;
    to: string;
    changedAt: string;
    durationMin: number;
  }[] = [];

  devices.forEach((d) => {
    (d.offline ?? []).forEach((ev: AnyEvent) => {
      unifiedEvents.push({
        upsId: d.meta.upsId,
        from: (ev.fromStatus ?? 'online') || 'online',
        to: (ev.toStatus ?? 'offline') || 'offline',
        changedAt: fmtDT(ev.start),
        durationMin: minutes(ev.durationSec),
      });
    });
    (d.powerFail ?? []).forEach((ev: AnyEvent) => {
      unifiedEvents.push({
        upsId: d.meta.upsId,
        from: (ev.fromStatus ?? 'online') || 'online',
        to: (ev.toStatus ?? 'warning') || 'warning',
        changedAt: fmtDT(ev.start),
        durationMin: minutes(ev.durationSec),
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
          วันที่ออกรายงาน: {data.generatedAt}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>จำนวน UPS</div>
          <div style={styles.cardValue}>{totalDevices}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Downtime รวม (นาที)</div>
          <div style={styles.cardValue}>{totalDowntimeMin}</div>
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

      {/* Per-device Offline */}
      <div style={styles.sectionTitle}>สรุปต่ออุปกรณ์ Offline</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>UPS ID</th>
            <th style={styles.th}>IP</th>
            <th style={styles.th}>สถานที่</th>
            <th style={styles.th}>Downtime (นาที)</th>
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
              <td style={styles.td}>{r.dtMin}</td>
              <td style={styles.td}>{r.evCount}</td>
              <td style={styles.td}>{r.last}</td>
            </tr>
          ))}
          {perDeviceOffline.length === 0 && (
            <tr><td style={styles.td} colSpan={6}>— ไม่มีข้อมูล —</td></tr>
          )}
        </tbody>
      </table>

      {/* Per-device PowerFail */}
      <div style={styles.sectionTitle}>สรุปต่ออุปกรณ์ PowerFail</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>UPS ID</th>
            <th style={styles.th}>IP</th>
            <th style={styles.th}>สถานที่</th>
            <th style={styles.th}>Downtime (นาที)</th>
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
              <td style={styles.td}>{r.dtMin}</td>
              <td style={styles.td}>{r.evCount}</td>
              <td style={styles.td}>{r.last}</td>
            </tr>
          ))}
          {perDevicePowerFail.length === 0 && (
            <tr><td style={styles.td} colSpan={6}>— ไม่มีข้อมูล —</td></tr>
          )}
        </tbody>
      </table>

      {/* Detailed Events */}
      <div style={styles.sectionTitle}>รายละเอียดเหตุการณ์ (ช่วงที่เลือก)</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>UPS ID</th>
            <th style={styles.th}>จาก</th>
            <th style={styles.th}>เป็น</th>
            <th style={styles.th}>เวลาเปลี่ยน</th>
            <th style={styles.th}>ระยะเวลา (นาที)</th>
          </tr>
        </thead>
        <tbody>
          {unifiedEvents.map((ev, i) => (
            <tr key={`evt-${i}`}>
              <td style={styles.td}>{ev.upsId}</td>
              <td style={styles.td}>{ev.from}</td>
              <td style={styles.td}>{ev.to}</td>
              <td style={styles.td}>{ev.changedAt}</td>
              <td style={styles.td}>{ev.durationMin}</td>
            </tr>
          ))}
          {devices.every(d => (d.offline?.length || 0) === 0) && (
            <tr><td style={styles.td} colSpan={7}>— ไม่มีเหตุการณ์ —</td></tr>
          )}
        </tbody>
      </table>

      <div style={styles.hint}>
        * หมายเหตุ: ระยะเวลา (นาที) จะตัดให้พอดีกับช่วงวันที่ที่เลือก
      </div>

      <div style={styles.footer}>Confidential - Internal Use Only</div>
    </div>
  );
}
