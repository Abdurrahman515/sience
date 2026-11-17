// رسم الشهادة على Canvas (شكل افقي A4). الخط: Tajawal فقط. لا شعار ولا خانة توقيع.
import type { CertData } from './certificate'
import { arabicDate } from './certificate'


export const CERT_W = 2339 // A4 أفقي بدقة ~٢٠٠ نقطة/إنش
export const CERT_H = 1654
export const FONT = "'Tajawal', sans-serif"

const PINK = '#d81b78'
const PINK_DARK = '#9c1458'
const PINK_MID = '#f06fa8'
const PINK_SOFT = '#fbc6dc'
const PINK_BG = '#fff4f8'
const INK = '#4a1230'

export interface Ctx2D {
  canvas?: unknown
  [k: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w
    if (cur && ctx.measureText(t).width > maxW) {
      lines.push(cur)
      cur = w
    } else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

function flower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save()
  ctx.translate(x, y)
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3)
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.62, r * 0.32, r * 0.6, 0, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? PINK_SOFT : PINK_MID
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

function divider(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  ctx.strokeStyle = PINK_MID
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - 420, y)
  ctx.lineTo(cx - 60, y)
  ctx.moveTo(cx + 60, y)
  ctx.lineTo(cx + 420, y)
  ctx.stroke()
  ctx.fillStyle = PINK
  star(ctx, cx, y, 30)
  ctx.fillStyle = PINK_MID
  star(ctx, cx - 70, y, 14)
  star(ctx, cx + 70, y, 14)
}

export function drawCertificate(c: CanvasRenderingContext2D, d: CertData): void {
  const W = CERT_W
  const H = CERT_H
  const cx = W / 2
  c.save()
  c.direction = 'rtl'
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'

  // خلفية
  c.fillStyle = PINK_BG
  c.fillRect(0, 0, W, H)
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, 'rgba(240,111,168,.18)')
  g.addColorStop(0.5, 'rgba(255,255,255,0)')
  g.addColorStop(1, 'rgba(240,111,168,.18)')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)

  // إطار مزدوج
  c.strokeStyle = PINK
  c.lineWidth = 16
  c.strokeRect(70, 70, W - 140, H - 140)
  c.strokeStyle = PINK_MID
  c.lineWidth = 5
  c.strokeRect(105, 105, W - 210, H - 210)

  // زخارف الزوايا
  for (const [x, y] of [[150, 150], [W - 150, 150], [150, H - 150], [W - 150, H - 150]] as const) {
    c.fillStyle = PINK_BG
    c.beginPath()
    c.arc(x, y, 62, 0, Math.PI * 2)
    c.fill()
    flower(c, x, y, 58)
  }

  // العنوان
  c.fillStyle = PINK
  c.font = `700 170px ${FONT}`
  c.fillText('شهادة شكر وتقدير', cx, 400)
  divider(c, cx, 470)

  c.fillStyle = INK
  c.font = `500 62px ${FONT}`
  c.fillText('تُهدى هذه الشهادة إلى الطالبة المتميزة', cx, 590)

  // الاسم (يصغر الخط حتى يتسع)
  let size = 150
  c.font = `700 ${size}px ${FONT}`
  while (c.measureText(d.name).width > W - 700 && size > 60) {
    size -= 6
    c.font = `700 ${size}px ${FONT}`
  }
  c.fillStyle = PINK_DARK
  c.fillText(d.name, cx, 770)
  const nw = Math.min(c.measureText(d.name).width + 140, W - 500)
  c.strokeStyle = PINK_MID
  c.lineWidth = 6
  c.beginPath()
  c.moveTo(cx - nw / 2, 815)
  c.lineTo(cx + nw / 2, 815)
  c.stroke()

  // نص التقدير
  const body = `وذلك تقديراً لجهدها واجتهادها ونجاحها في «${d.examTitle}» في مادة العلوم. نسأل الله لها دوام التوفيق والتميّز.`
  c.fillStyle = INK
  c.font = `500 66px ${FONT}`
  const lines = wrap(c, body, W - 640)
  lines.forEach((l, i) => c.fillText(l, cx, 960 + i * 100))

  // التاريخ
  c.fillStyle = PINK_DARK
  c.font = `500 54px ${FONT}`
  c.fillText(`التاريخ: ${arabicDate(d.date)}`, cx, H - 230)

  // نجوم سفلية
  c.fillStyle = PINK_MID
  for (let i = -2; i <= 2; i++) star(c, cx + i * 90, H - 170, i === 0 ? 28 : 20)

  c.restore()
}
