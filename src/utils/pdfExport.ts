import { jsPDF } from 'jspdf';
import { AppState } from '../types';

// REEMPLAZA ESTA URL CON LA QUE TE DA GOOGLE AL IMPLEMENTAR LA APLICACIÓN WEB
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBJTP37mQAW1LlCAz9CE3L8sK07iI5VY46WeKRh6eUDpZhRwkOh1seESV_brQeDKRdpw/exec';

const STATUS_COLORS: Record<string, [number, number, number]> = {
  Reviewed: [5, 150, 105],
  Pending: [148, 163, 184],
  Error: [239, 68, 68],
};

const loadImg = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

function addNewPage(pdf: jsPDF): number {
  pdf.addPage();
  pdf.setFillColor(27, 115, 64);
  pdf.rect(0, 0, 210, 8, 'F');
  return 20;
}

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; background: #1b7340; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-family: sans-serif; max-width: 300px; border-left: 5px solid #f2b705; animation: slideIn 0.3s ease-out;">
      <p style="margin: 0; font-weight: bold; font-size: 14px;">✅ Reporte Finalizado</p>
      <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">${message}</p>
    </div>
    <style>
      @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { 
    toast.style.opacity = '0'; 
    toast.style.transition = '0.5s'; 
    setTimeout(() => toast.remove(), 500); 
  }, 6000);
}

export async function buildPDF(data: AppState): Promise<jsPDF> {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  
  pdf.setFillColor(11, 43, 26);
  pdf.rect(0, 0, PAGE_W, 52, 'F');
  pdf.setFillColor(27, 115, 64);
  pdf.rect(0, 0, PAGE_W, 46, 'F');
  
  pdf.setTextColor(242, 183, 5);
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SprAI', MARGIN, 22);
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('FIELD OPS', MARGIN + 36, 22);
  
  pdf.setTextColor(242, 183, 5);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.sprAiNumber || 'S/N', PAGE_W - MARGIN, 22, { align: 'right' });

  let y = 60;

  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, 'F'); 
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text('CLIENTE / ESTABLECIMIENTO', MARGIN + 6, y + 8);
  pdf.text('PERÍODO DE INSTALACIÓN', MARGIN + CONTENT_W / 2 + 4, y + 8);
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.clientName || '—', MARGIN + 6, y + 16);
  const periodo = `Del ${data.dateInicio || '—'} al ${data.dateFin || '—'}`;
  pdf.text(periodo, MARGIN + CONTENT_W / 2 + 4, y + 16);
  
  y += 40;

  for (const section of data.sections) {
    if (y > 240) y = addNewPage(pdf);
    pdf.setFillColor(27, 115, 64);
    pdf.rect(MARGIN, y, 4, 10, 'F');
    pdf.setFontSize(11);
    pdf.setTextColor(27, 115, 64);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, MARGIN + 8, y + 8);
    y += 16;

    for (const item of section.items) {
      if (y > 240) y = addNewPage(pdf);
      const statusColor = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pending;
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(MARGIN, y, 3, 8, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'normal');
      const labelLines = pdf.splitTextToSize(item.label, CONTENT_W - 10);
      pdf.text(labelLines, MARGIN + 6, y + 6);
      y += (labelLines.length * 5) + 2;

      if (item.observations?.trim()) {
        const obsLines = pdf.splitTextToSize(`Obs: ${item.observations}`, CONTENT_W - 12);
        const rectH = obsLines.length * 4 + 4;
        pdf.setFillColor(241, 245, 249);
        pdf.rect(MARGIN + 6, y, CONTENT_W - 6, rectH, 'F');
        pdf.setTextColor(30, 41, 59);
        pdf.text(obsLines, MARGIN + 9, y + 4);
        y += rectH + 4;
      } else { y += 2; }

      if (item.taskStatus === 'incomplete') {
        pdf.setTextColor(220, 38, 38);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PENDIENTE EN CAMPO', MARGIN + 6, y + 2);
        y += 6;
        if (item.incompleteReason) {
          const reasonLines = pdf.splitTextToSize(`Motivo: ${String(item.incompleteReason).trim()}`, CONTENT_W - 12);
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.text(reasonLines, MARGIN + 6, y);
          y += (reasonLines.length * 4) + 2;
        }
        pdf.setTextColor(30, 41, 59);
        pdf.setFont('helvetica', 'normal');
      }

      if (item.photos && item.photos.length > 0) {
        const numPhotos = Math.min(item.photos.length, 3);
        const spacing = 4;
        const targetW = (CONTENT_W - 12 - (spacing * (numPhotos - 1))) / 3.2;
        let rowMaxH = 0;
        const loadedData = [];
        for (let i = 0; i < numPhotos; i++) {
          try {
            const imgEl = await loadImg(item.photos[i]);
            const ratio = imgEl.width / imgEl.height;
            const finalH = Math.min(targetW / ratio, 35);
            if (finalH > rowMaxH) rowMaxH = finalH;
            loadedData.push({ data: item.photos[i], h: finalH, w: targetW });
          } catch (e) {}
        }
        if (y + rowMaxH > 270) y = addNewPage(pdf);
        for (let i = 0; i < loadedData.length; i++) {
          pdf.addImage(loadedData[i].data, 'JPEG', MARGIN + 6 + (i * (targetW + spacing)), y, loadedData[i].w, loadedData[i].h, undefined, 'MEDIUM');
        }
        y += rowMaxH + 6;
      }
      y += 4;
    }
  }

  if (y > 200) y = addNewPage(pdf);
  y += 10;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Instalador: ${data.signerName || '—'}  |  Empresa: ${data.signerCompany || '—'}`, PAGE_W / 2, y, { align: 'center' });
  y += 5;

  if (data.signature) {
    try {
       const sigImg = await loadImg(data.signature);
       const sigW = 40;
       const sigH = sigW / (sigImg.width / sigImg.height);
       pdf.addImage(data.signature, 'PNG', PAGE_W / 2 - (sigW/2), y, sigW, sigH);
       y += sigH + 2;
    } catch(e) { y += 10; }
  }
  pdf.setDrawColor(200);
  pdf.line(PAGE_W / 2 - 30, y, PAGE_W / 2 + 30, y);
  pdf.text('FIRMA RESPONSABLE', PAGE_W / 2, y + 5, { align: 'center' });
  return pdf;
}

export async function finalizeReport(data: AppState, metrics: any) {
  const pdf = await buildPDF(data);
  const filename = `Reporte_${data.sprAiNumber || 'SN'}.pdf`;
  
  pdf.save(filename);

  const base64 = pdf.output('datauristring').split(',')[1];
  
  const incompletos = data.sections.flatMap(s => s.items).filter(i => i.taskStatus === 'incomplete');
  const countIncompletos = incompletos.length;
  const descIncompletos = incompletos.map(i => `${i.label} (Motivo: ${i.incompleteReason || 'No especificado'})`).join(' | ');

  const itemMateriales = data.sections
    .flatMap(s => s.items)
    .find(item => item.id === 'rev-faltantes' || item.label.toLowerCase().includes("listado de materiales faltantes"));

  const materiales = itemMateriales && itemMateriales.observations?.trim() 
    ? itemMateriales.observations.trim() 
    : "Ninguno";

  // 🔄 1. NUEVO: EXTRACCIÓN DE MATERIALES NO CONFORMES
  const itemNoConformes = data.sections
    .flatMap(s => s.items)
    .find(item => item.id === 'rev-noconformes' || item.label.toLowerCase().includes("listado de materiales no conformes"));

  const noConformes = itemNoConformes && itemNoConformes.observations?.trim() 
    ? itemNoConformes.observations.trim() 
    : "Ninguno";
  
  // 2. MAPEO DOBLE TANQUE
  let dobleTanque = "No";
  if (data.dobleTanqueConfig === 'SI') dobleTanque = "Sí";
  else if (data.dobleTanqueConfig === 'NO') dobleTanque = "No";

  // 3. MAPEO COMPRESOR
  let compresorStatus = "No lleva";
  if (data.compresorConfig === 'SI') compresorStatus = "Sí, Funciona";
  else if (data.compresorConfig === 'NO') compresorStatus = "No lleva";

  // 4. MAPEO FAROS EXTRA
  let farosExtraStatus = "No Lleva";
  if (data.farosExtraConfig === 'SI') farosExtraStatus = "Sí, Instalados";
  else if (data.farosExtraConfig === 'NO') farosExtraStatus = "No Lleva";

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({ 
        filename, 
        base64, 
        mimeType: 'application/pdf',
        photos: data.sections.flatMap(s => s.items).flatMap(i => i.photos || []),
        metrics: {
          sprAiNumber: data.sprAiNumber,
          clientName: data.clientName,
          dateInicio: data.dateInicio,
          dateFin: data.dateFin,
          signerName: data.signerName,
          signerCompany: data.signerCompany,
          itemsIncompletosCount: countIncompletos,
          itemsIncompletosDesc: descIncompletos,
          materialesFaltantes: materiales,
          materialesNoConformes: noConformes, // 🔄 2. NUEVO: Enviamos el dato al JSON de Google Apps Script
          dobleTanque: dobleTanque,
          compresor: compresorStatus,    
          farosExtra: farosExtraStatus,  
          ...metrics
        }
      }),
    });

    const resData = await response.json();
    if (resData.success) {
      showToast("Reporte guardado en Google Drive y Sheet con éxito.");
    } else {
      showToast("Descargado. Error al subir: " + resData.error);
    }
    
  } catch (err) {
    console.error("Error en la sincronización:", err);
    showToast("Reporte descargado localmente. Error al sincronizar con Google.");
  }

  return { success: true, filename };
}