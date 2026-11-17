// يولّد شهادة PDF أفقية بلا إنترنت: الرسم على Canvas بخط Tajawal المضمَّن، ثم jsPDF.
import type { CertData } from './certificate'
import { CERT_H, CERT_W, FONT, drawCertificate } from './certificateDraw'

/** تحميل خط Tajawal (مثبّت كحزمة @fontsource ومُخزَّن مع التطبيق للعمل دون اتصال). */
async function loadFonts(): Promise<void> {
  await Promise.all([
    import('@fontsource/tajawal/500.css'),
    import('@fontsource/tajawal/700.css'),
  ])
  const sample = 'شهادة شكر وتقدير'
  await Promise.all([
    document.fonts.load(`500 60px ${FONT}`, sample),
    document.fonts.load(`700 60px ${FONT}`, sample),
  ])
  await document.fonts.ready
}

export async function makeCertificatePdf(data: CertData): Promise<Blob> {
  await loadFonts()
  const canvas = document.createElement('canvas')
  canvas.width = CERT_W
  canvas.height = CERT_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unavailable')
  drawCertificate(ctx, data)
  const img = canvas.toDataURL('image/jpeg', 0.95)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  pdf.addImage(img, 'JPEG', 0, 0, 297, 210)
  return pdf.output('blob')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
