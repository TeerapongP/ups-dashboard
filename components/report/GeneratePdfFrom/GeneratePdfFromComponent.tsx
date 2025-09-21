// components/report/generatePdfFrom.ts
'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { PDFDocument } from 'pdf-lib';
const loadHtml2Canvas = () => import('html2canvas').then(m => m.default);

import type { DailyReportPayload } from '@/types/report';
import { DailyReportPrint } from '../DailyReport/DailyReportPrint';

let running = false; // กันเรียกซ้ำ

export async function generatePdfFrom({
  data,
  fileName,
  margin = 0,        // mm
  a4Dpi = 192,       // ความละเอียดสำหรับแรสเตอร์สู่ A4
}: {
  data: DailyReportPayload;
  fileName: string;
  margin?: number;
  a4Dpi?: number;
}) {
  if (running) return;
  running = true;

  try {
    // 1) render คอมโพเนนต์ลง container ซ่อน
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '794px',      // A4 ~96dpi
      minHeight: '1123px',
      background: '#ffffff',
      zIndex: '-1',
    } as CSSStyleDeclaration);
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<DailyReportPrint data={data} />);
    await new Promise((r) => setTimeout(r, 120));

    // 2) snapshot DOM → canvas
    const html2canvas = await loadHtml2Canvas();
    const snap = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });

    // 3) แรสเตอร์รูปลง “ผ้าใบ A4” ก่อน
    const mmToIn = (mm: number) => mm / 25.4;
    const A4_W_MM = 210;
    const A4_H_MM = 297;

    const pxW = Math.round(a4Dpi * mmToIn(A4_W_MM));
    const pxH = Math.round(a4Dpi * mmToIn(A4_H_MM));
    const marginPx = Math.round(a4Dpi * mmToIn(margin));

    const drawWMax = pxW - marginPx * 2;
    const drawHMax = pxH - marginPx * 2;
    const scale = Math.min(drawWMax / snap.width, drawHMax / snap.height);
    const drawW = Math.round(snap.width * scale);
    const drawH = Math.round(snap.height * scale);
    const offX = marginPx + Math.round((drawWMax - drawW) / 2);
    const offY = marginPx + Math.round((drawHMax - drawH) / 2);

    const a4Canvas = document.createElement('canvas');
    a4Canvas.width = pxW;
    a4Canvas.height = pxH;
    const ctx = a4Canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, pxW, pxH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(snap, offX, offY, drawW, drawH);

    // 4) ใช้ pdf-lib ทำ PDF หน้าเดียวพอดี A4
    const a4DataUrl = a4Canvas.toDataURL('image/jpeg', 0.92);
    const jpgBytes = await (await fetch(a4DataUrl)).arrayBuffer();

    const pdfDoc = await PDFDocument.create();
    // หน่วยของ pdf-lib = points (1 inch = 72 pt)
    const A4_W_PT = 595.276; // 210mm
    const A4_H_PT = 841.89;  // 297mm
    const page = pdfDoc.addPage([A4_W_PT, A4_H_PT]);

    const jpg = await pdfDoc.embedJpg(jpgBytes);
    // วาดรูปเต็มหน้า A4
    page.drawImage(jpg, {
      x: 0,
      y: 0,
      width: A4_W_PT,
      height: A4_H_PT,
    });

    const pdfBytes = await pdfDoc.save();

    // 5) ดาวน์โหลด
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    // 6) cleanup
    root.unmount();
    container.remove();
  } finally {
    running = false;
  }
}
