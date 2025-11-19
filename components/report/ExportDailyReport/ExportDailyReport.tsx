'use client';

import React from 'react';
import ReactDOM from 'react-dom/client';
import type { DailyReportPayload } from '@/types/report';
import { DailyReportPrint } from '../DailyReport/DailyReportPrint';

// Type for html2pdf function
interface Html2PdfFunction {
  (): {
    from: (element: HTMLElement) => {
      set: (options: object) => {
        save: () => Promise<void>;
      };
    };
  };
}

// ใช้ html2pdf แบบ dynamic import
async function ensureHtml2Pdf(): Promise<Html2PdfFunction> {
  const mod = await import('html2pdf.js');
  return (mod.default ?? mod) as Html2PdfFunction;
}

/** กดแล้วออกไฟล์ PDF */
export async function exportDailyReport({
  data,
  fileName,
}: { data: DailyReportPayload; fileName: string }) {
  if (typeof window === 'undefined') throw new Error('client only');

  const html2pdf = await ensureHtml2Pdf();

  // สร้าง host ชั่วคราว (ต้อง "อยู่บนจอ" เพื่อให้ tailwind/DOM render)
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '0';
  host.style.top = '0';
  host.style.zIndex = '-1';
  host.style.opacity = '0';         // มองไม่เห็น แต่ layout ได้
  host.style.pointerEvents = 'none';
  host.style.background = '#fff';
  document.body.appendChild(host);

  // render React ลง host
  const root = ReactDOM.createRoot(host);
  root.render(<DailyReportPrint data={data} />);

  // รอ 1 frame ให้ layout เสร็จ
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  try {
    await html2pdf()
      .from(host)
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          // ไม่ต้องตั้ง windowWidth/Height ก็ได้ เพราะเรา fix ความกว้างใน component แล้ว
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  } finally {
    // เก็บกวาด
    root.unmount();
    document.body.removeChild(host);
  }
}
