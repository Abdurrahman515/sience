import type { GenId, NumQ } from '../content/types'
import type { Rng } from './rng'
import { pick } from './rng'
import { formatNumber } from './arabicText'

const f = (n: number) => formatNumber(n)

type Gen = (rng: Rng, id: string) => NumQ

const avgSpeed: Gen = (rng, id) => {
  const t = pick(rng, [2, 3, 4, 5, 6])
  const v = pick(rng, [40, 50, 60, 80, 90, 100])
  const d = v * t
  return {
    kind: 'num', id, answer: v, unit: 'كم/س',
    q: `قطعت سيارة مسافة ${d} كم في ${t} ساعات. ما سرعتها المتوسطة؟`,
    law: 'السرعة المتوسطة = المسافة ÷ الزمن',
    sub: `ع = ${d} ÷ ${t}`,
    explain: `ع = ف ÷ ز = ${d} ÷ ${t} = ${v} كم/س`,
    mistakes: [
      { value: d * t, why: 'ضربتِ المسافة في الزمن! السرعة تُحسب بالقسمة: المسافة ÷ الزمن.' },
      { value: t / d, why: 'قلبتِ القسمة! المسافة هي المقسوم والزمن هو المقسوم عليه.' },
    ],
  }
}

const distance: Gen = (rng, id) => {
  const t = pick(rng, [2, 3, 4, 5])
  const v = pick(rng, [30, 40, 60, 80])
  const d = v * t
  return {
    kind: 'num', id, answer: d, unit: 'كم',
    q: `سارت حافلة بسرعة ثابتة ${v} كم/س مدة ${t} ساعات. ما المسافة التي قطعتها؟`,
    law: 'المسافة = السرعة × الزمن (ف = ع × ز)',
    sub: `ف = ${v} × ${t}`,
    explain: `ف = ع × ز = ${v} × ${t} = ${d} كم`,
    mistakes: [{ value: v / t, why: 'قسمتِ السرعة على الزمن! لحساب المسافة نضرب السرعة في الزمن.' }],
  }
}

const acceleration: Gen = (rng, id) => {
  const v1 = pick(rng, [0, 2, 4, 8])
  const a = pick(rng, [2, 3, 4, 5])
  const t = pick(rng, [2, 3, 4, 5])
  const v2 = v1 + a * t
  return {
    kind: 'num', id, answer: a, unit: 'م/ث²',
    q: `زادت سرعة دراجة من ${v1} م/ث إلى ${v2} م/ث خلال ${t} ثوانٍ. ما تسارعها؟`,
    law: 'التسارع = (السرعة النهائية − السرعة الابتدائية) ÷ الزمن',
    sub: `ت = (${v2} − ${v1}) ÷ ${t}`,
    explain: `ت = (ع₂ − ع₁) ÷ ز = (${v2} − ${v1}) ÷ ${t} = ${a} م/ث²`,
    mistakes: [
      { value: v2 / t, why: 'نسيتِ أن تطرحي السرعة الابتدائية! التسارع هو مقدار التغيّر في السرعة (النهائية − الابتدائية).' },
      { value: v2 - v1, why: 'هذا مقدار التغيّر في السرعة فقط. بقي أن تقسميه على الزمن.' },
    ],
  }
}

const accFromForce: Gen = (rng, id) => {
  const m = pick(rng, [2, 4, 5, 10, 20])
  const a = pick(rng, [2, 3, 5])
  const F = m * a
  return {
    kind: 'num', id, answer: a, unit: 'م/ث²',
    q: `أثّرت قوة محصلة مقدارها ${F} نيوتن في جسم كتلته ${m} كجم. ما تسارع الجسم؟`,
    law: 'التسارع = القوة المحصلة ÷ الكتلة (ت = ق ÷ ك)',
    sub: `ت = ${F} ÷ ${m}`,
    explain: `ت = ق ÷ ك = ${F} ÷ ${m} = ${a} م/ث²`,
    mistakes: [
      { value: F * m, why: 'ضربتِ القوة في الكتلة! حسب القانون الثاني لنيوتن نقسم القوة على الكتلة.' },
      { value: m / F, why: 'قلبتِ القسمة! القوة هي المقسوم والكتلة هي المقسوم عليه.' },
    ],
  }
}

const netForce: Gen = (rng, id) => {
  const a = pick(rng, [30, 40, 50, 60, 80])
  const b = pick(rng, [10, 15, 20, 25])
  return {
    kind: 'num', id, answer: a - b, unit: 'نيوتن',
    q: `يدفع أحمد صندوقاً بقوة ${a} نيوتن نحو اليمين، وتؤثر قوة احتكاك ${b} نيوتن نحو اليسار. ما مقدار القوة المحصلة؟`,
    law: 'القوتان المتعاكستان: القوة المحصلة = الفرق بينهما',
    sub: `ق = ${a} − ${b}`,
    explain: `القوتان متعاكستان فنطرح: ${a} − ${b} = ${a - b} نيوتن (نحو اليمين)`,
    mistakes: [{ value: a + b, why: 'جمعتِ القوتين! الجمع يكون للقوى في الاتجاه نفسه. هنا القوتان متعاكستان فنطرح.' }],
  }
}

const weight: Gen = (rng, id) => {
  const m = pick(rng, [2, 5, 10, 20, 50])
  const w = Number((m * 9.8).toFixed(1))
  return {
    kind: 'num', id, answer: w, unit: 'نيوتن',
    q: `ما وزن جسم كتلته ${m} كجم؟ (اعتبري تسارع الجاذبية ٩٫٨ م/ث²)`,
    law: 'الوزن = الكتلة × ٩٫٨',
    sub: `الوزن = ${m} × 9.8`,
    explain: `الوزن = ${m} × 9.8 = ${f(w)} نيوتن`,
    mistakes: [{ value: m / 9.8, why: 'قسمتِ بدل أن تضربي! الوزن = الكتلة × ٩٫٨.' }],
  }
}

const work: Gen = (rng, id) => {
  const F = pick(rng, [10, 20, 50, 100, 200])
  const d = pick(rng, [2, 3, 5, 10])
  return {
    kind: 'num', id, answer: F * d, unit: 'جول',
    q: `دفع عامل صندوقاً بقوة ${F} نيوتن في اتجاه حركته مسافة ${d} أمتار. ما الشغل الذي بذله؟`,
    law: 'الشغل = القوة × المسافة (ش = ق × ف)',
    sub: `ش = ${F} × ${d}`,
    explain: `ش = ق × ف = ${F} × ${d} = ${F * d} جول`,
    mistakes: [{ value: F / d, why: 'قسمتِ القوة على المسافة! الشغل = القوة × المسافة.' }],
  }
}

const mechAdv: Gen = (rng, id) => {
  const inF = pick(rng, [10, 20, 25, 50])
  const k = pick(rng, [2, 3, 4, 5, 10])
  const out = inF * k
  return {
    kind: 'num', id, answer: k, unit: '',
    q: `آلة بسيطة تبذل عليها قوة ${inF} نيوتن فتعطي قوة ناتجة ${out} نيوتن. ما فائدتها الآلية؟`,
    law: 'الفائدة الآلية = القوة الناتجة ÷ القوة المبذولة',
    sub: `${out} ÷ ${inF}`,
    explain: `الفائدة الآلية = ${out} ÷ ${inF} = ${k}`,
    mistakes: [{ value: inF / out, why: 'قلبتِ القسمة! القوة الناتجة هي المقسوم والقوة المبذولة هي المقسوم عليه.' }],
  }
}

const density: Gen = (rng, id) => {
  const V = pick(rng, [2, 4, 5, 10])
  const rho = pick(rng, [2, 3, 5, 8])
  const m = rho * V
  return {
    kind: 'num', id, answer: rho, unit: 'جم/سم³',
    q: `كتلة قطعة معدنية ${m} جم وحجمها ${V} سم³. ما كثافتها؟`,
    law: 'الكثافة = الكتلة ÷ الحجم',
    sub: `ث = ${m} ÷ ${V}`,
    explain: `ث = ك ÷ ح = ${m} ÷ ${V} = ${rho} جم/سم³`,
    mistakes: [{ value: V / m, why: 'قلبتِ القسمة! الكتلة هي المقسوم والحجم هو المقسوم عليه.' }],
  }
}

const densityMass: Gen = (rng, id) => {
  const V = pick(rng, [2, 3, 5, 10])
  const rho = pick(rng, [2, 3, 5, 9])
  return {
    kind: 'num', id, answer: rho * V, unit: 'جم',
    q: `كثافة معدن ${rho} جم/سم³. ما كتلة قطعة منه حجمها ${V} سم³؟`,
    law: 'الكتلة = الكثافة × الحجم',
    sub: `ك = ${rho} × ${V}`,
    explain: `الكثافة = الكتلة ÷ الحجم، إذن الكتلة = ${rho} × ${V} = ${rho * V} جم`,
    mistakes: [{ value: rho / V, why: 'قسمتِ الكثافة على الحجم! من ث = ك ÷ ح نجد أن ك = ث × ح.' }],
  }
}

const ELEMENTS = [
  { name: 'الصوديوم', z: 11, a: 23 },
  { name: 'الألمنيوم', z: 13, a: 27 },
  { name: 'البوتاسيوم', z: 19, a: 39 },
  { name: 'الفوسفور', z: 15, a: 31 },
  { name: 'الكربون', z: 6, a: 12 },
  { name: 'الأكسجين', z: 8, a: 16 },
  { name: 'الكالسيوم', z: 20, a: 40 },
  { name: 'المغنيسيوم', z: 12, a: 24 },
]

const neutrons: Gen = (rng, id) => {
  const e = pick(rng, ELEMENTS)
  return {
    kind: 'num', id, answer: e.a - e.z, unit: 'نيوترون',
    q: `العدد الكتلي لذرة ${e.name} هو ${e.a} وعدد بروتوناتها ${e.z}. كم نيوتروناً في نواتها؟`,
    law: 'العدد الكتلي = عدد البروتونات + عدد النيوترونات',
    sub: `${e.a} − ${e.z}`,
    explain: `عدد النيوترونات = ${e.a} − ${e.z} = ${e.a - e.z}`,
    mistakes: [{ value: e.a + e.z, why: 'جمعتِ العددين! العدد الكتلي هو المجموع أصلاً، فنطرح عدد البروتونات لنجد النيوترونات.' }],
  }
}

const massNumber: Gen = (rng, id) => {
  const p = pick(rng, [3, 6, 8, 11, 17, 20])
  const n = p + pick(rng, [0, 1, 2, 3, 4])
  return {
    kind: 'num', id, answer: p + n, unit: '',
    q: `في نواة ذرة ${p} بروتوناً و${n} نيوتروناً. ما عددها الكتلي؟`,
    law: 'العدد الكتلي = عدد البروتونات + عدد النيوترونات',
    sub: `${p} + ${n}`,
    explain: `العدد الكتلي = ${p} + ${n} = ${p + n}`,
    mistakes: [{ value: n - p, why: 'طرحتِ! العدد الكتلي هو مجموع البروتونات والنيوترونات.' }],
  }
}

const massLaw: Gen = (rng, id) => {
  const a = pick(rng, [20, 30, 50, 100])
  const b = pick(rng, [12, 18, 32, 64])
  const start = Math.max(a, b + 8)
  return {
    kind: 'num', id, answer: start - b, unit: 'جم',
    q: `سُخّنت ${start} جم من مركّب فتحلّل إلى ${b} جم من مادة صلبة وكمية من غاز. ما كتلة الغاز؟`,
    law: 'مجموع كتل المواد الناتجة = مجموع كتل المواد المتفاعلة (قانون حفظ الكتلة)',
    sub: `${start} − ${b}`,
    explain: `الكتلة قبل التفاعل = الكتلة بعده، فكتلة الغاز = ${start} − ${b} = ${start - b} جم`,
    mistakes: [{ value: start + b, why: 'جمعتِ! الكتلة الكلية ثابتة، فالغاز هو الباقي بعد طرح الصلب من الكتلة الأصلية.' }],
  }
}

const mapScale: Gen = (rng, id) => {
  const s = pick(rng, [2, 5, 10])
  const d = pick(rng, [2, 3, 4, 6])
  return {
    kind: 'num', id, answer: d * s, unit: 'كم',
    q: `مقياس رسم خريطة: كل ١ سم يعادل ${s} كم. كم المسافة الحقيقية بين مدينتين تبعدان ${d} سم على الخريطة؟`,
    law: 'المسافة الحقيقية = المسافة على الخريطة × قيمة السنتيمتر الواحد',
    sub: `${d} × ${s}`,
    explain: `${d} × ${s} = ${d * s} كم`,
    mistakes: [{ value: d / s, why: 'قسمتِ! كل سنتيمتر على الخريطة يمثّل عدة كيلومترات، فنضرب.' }],
  }
}

const plateDrift: Gen = (rng, id) => {
  const rate = pick(rng, [2, 3, 4, 5])
  if (rng() < 0.5) {
    const years = pick(rng, [1000, 5000, 10000])
    const m = (rate * years) / 100
    return {
      kind: 'num', id, answer: m, unit: 'م',
      q: `تتحرك صفيحة أرضية بمعدل ${rate} سم في السنة. كم مترًا تقطع في ${years} سنة؟`,
      law: 'المسافة = المعدل × الزمن، وكل ١٠٠ سم = ١ م',
      sub: `${rate} × ${years} سم ÷ 100`,
      explain: `${rate} × ${years} = ${rate * years} سم، ونقسمها على ١٠٠ فتصير ${f(m)} م`,
      mistakes: [{ value: rate * years, why: 'هاد الجواب بالسنتيمتر! حوّليه إلى متر بالقسمة على ١٠٠.' }],
    }
  }
  const million = pick(rng, [1, 2, 5, 10])
  const km = rate * million * 10
  return {
    kind: 'num', id, answer: km, unit: 'كم',
    q: `تتحرك صفيحة أرضية بمعدل ${rate} سم في السنة. كم كيلومترًا تقطع في ${million} مليون سنة؟`,
    law: 'المسافة = المعدل × الزمن، وكل ١٠٠٠٠٠ سم = ١ كم',
    sub: `${rate} سم × ${million} مليون سنة`,
    explain: `${rate} × ${million} مليون = ${f(rate * million)} مليون سم، وكل مليون سم = ١٠ كم، فالناتج ${f(km)} كم`,
    mistakes: [
      { value: rate * million * 10000, why: 'قسمتِ على ١٠٠ فطلع بالمتر. الكيلومتر = ١٠٠٠٠٠ سم، يعني مليون سم = ١٠ كم.' },
      { value: rate * million, why: 'نسيتِ تحويل الوحدة! مليون سم = ١٠ كم.' },
    ],
  }
}

const erosionHeight: Gen = (rng, id) => {
  const rate = pick(rng, [2, 5, 10])
  const years = pick(rng, [1000, 2000, 5000])
  const m = (rate * years) / 1000
  return {
    kind: 'num', id, answer: m, unit: 'م',
    q: `تعرّي الرياح منطقة بمعدل ${rate} مم كل سنة. كم مترًا ينخفض سطحها بعد ${years} سنة؟`,
    law: 'الانخفاض = المعدل × الزمن، وكل ١٠٠٠ مم = ١ م',
    sub: `${rate} × ${years} مم ÷ 1000`,
    explain: `${rate} × ${years} = ${rate * years} مم، ونقسمها على ١٠٠٠ فتصير ${f(m)} م`,
    mistakes: [
      { value: rate * years, why: 'هاد الجواب بالمليمتر! المتر = ١٠٠٠ مم.' },
      { value: (rate * years) / 100, why: 'قسمتِ على ١٠٠ (هيك بتطلع بالسنتيمتر). المتر = ١٠٠٠ مم.' },
    ],
  }
}

/* ===== مولّدات الفصل الدراسي الثاني ===== */

const fToC: Gen = (rng, id) => {
  const k = pick(rng, [4, 5, 6, 8, 10, 12, 15, 18, 20])
  const F = 32 + 9 * k
  const C = 5 * k
  return {
    kind: 'num', id, answer: C, unit: '°س',
    q: `سجّل مقياس حرارة ${F}°ف في مدينة ما. كم تساوي درجة الحرارة بالسلسيوس؟`,
    law: '°س = ٥/٩ × (°ف − ٣٢)',
    sub: `°س = ٥/٩ × (${F} − 32)`,
    explain: `نطرح ٣٢ أولاً: ${F} − 32 = ${9 * k}، ثم نضرب في ٥/٩ فيصير الناتج ${C}°س`,
    mistakes: [
      { value: (F * 5) / 9, why: 'نسيتِ تطرحي ٣٢ قبل ما تضربي في ٥/٩! اطرحي أولاً ثم اضربي.' },
      { value: F - 32, why: 'هاد بس الطرح. بقي تضربي الناتج في ٥/٩.' },
    ],
  }
}

const cToF: Gen = (rng, id) => {
  const C = pick(rng, [10, 15, 20, 25, 30, 35, 40, 45])
  const F = (9 * C) / 5 + 32
  return {
    kind: 'num', id, answer: F, unit: '°ف',
    q: `كانت درجة الحرارة في يوم لطيف ${C}°س. كم تساوي بالفهرنهايت؟`,
    law: '°ف = ٩/٥ × °س + ٣٢',
    sub: `°ف = ٩/٥ × ${C} + 32`,
    explain: `نضرب أولاً: ٩/٥ × ${C} = ${(9 * C) / 5}، ثم نجمع ٣٢ فيصير ${F}°ف`,
    mistakes: [
      { value: (9 * C) / 5, why: 'نسيتِ تجمعي ٣٢ بالآخر!' },
      { value: C + 32, why: 'لازم تضربي في ٩/٥ قبل ما تجمعي ٣٢.' },
    ],
  }
}

const windSpeed: Gen = (rng, id) => {
  const t = pick(rng, [2, 3, 4, 5])
  const v = pick(rng, [5, 7, 10, 12, 15, 23])
  const d = v * t
  return {
    kind: 'num', id, answer: v, unit: 'كم/س',
    q: `تحرّكت رياح من منطقة ضغط مرتفع إلى منطقة ضغط منخفض مسافة ${d} كم خلال ${t} ساعات. ما سرعتها؟`,
    law: 'سرعة الرياح = المسافة ÷ الزمن',
    sub: `ع = ${d} ÷ ${t}`,
    explain: `ع = ف ÷ ز = ${d} ÷ ${t} = ${v} كم/س`,
    mistakes: [
      { value: d * t, why: 'ضربتِ بدل ما تقسمي! السرعة = المسافة ÷ الزمن.' },
      { value: t / d, why: 'قلبتِ القسمة! المسافة هي المقسوم.' },
    ],
  }
}

const relHumidity: Gen = (rng, id) => {
  const max = pick(rng, [20, 32, 40, 50, 80])
  const frac = pick(rng, [0.25, 0.5, 0.75])
  const have = max * frac
  const answer = frac * 100
  return {
    kind: 'num', id, answer, unit: '٪',
    q: `يستطيع المتر المكعب من الهواء عند درجة حرارة معينة حمل ${max} جم من بخار الماء، وفيه الآن ${have} جم. ما الرطوبة النسبية؟`,
    law: 'الرطوبة النسبية = (كمية البخار الموجودة ÷ أقصى كمية ممكنة) × ١٠٠',
    sub: `(${have} ÷ ${max}) × 100`,
    explain: `${have} ÷ ${max} = ${frac}، ثم × ١٠٠ فتصير الرطوبة النسبية ${answer}٪`,
    mistakes: [
      { value: have / max, why: 'نسيتِ تضربي في ١٠٠ لتتحول النسبة إلى مئوية.' },
      { value: (max / have) * 100, why: 'قلبتِ القسمة! الموجود هو المقسوم والأقصى هو المقسوم عليه.' },
    ],
  }
}

const auKm: Gen = (rng, id) => {
  const n = pick(rng, [2, 3, 5, 10, 20, 30])
  const a = n * 150
  return {
    kind: 'num', id, answer: a, unit: 'مليون كم',
    q: `الوحدة الفلكية الواحدة تساوي ١٥٠ مليون كم. كوكب يبعد عن الشمس ${n} وحدات فلكية، كم مليون كيلومتر يبعد؟`,
    law: 'المسافة بالكيلومتر = عدد الوحدات الفلكية × ١٥٠ مليون',
    sub: `${n} × 150`,
    explain: `${n} × ١٥٠ = ${a} مليون كم`,
    mistakes: [
      { value: 150 / n, why: 'قسمتِ بدل ما تضربي! كل وحدة فلكية = ١٥٠ مليون كم، فنضرب العدد في ١٥٠.' },
      { value: n + 150, why: 'جمعتِ بدل الضرب! عندنا ' + n + ' وحدات، كل وحدة ١٥٠ مليون.' },
    ],
  }
}

const lightTime: Gen = (rng, id) => {
  const k = pick(rng, [1, 2, 3, 5, 10, 20])
  const d = 300000 * k
  return {
    kind: 'num', id, answer: k, unit: 'ثانية',
    q: `يسير الضوء بسرعة ٣٠٠٠٠٠ كم/ث. كم ثانية يحتاج ليقطع مسافة ${d} كم؟`,
    law: 'الزمن = المسافة ÷ السرعة',
    sub: `ز = ${d} ÷ 300000`,
    explain: `ز = ف ÷ ع = ${d} ÷ 300000 = ${k} ثانية`,
    mistakes: [
      { value: d * 300000, why: 'ضربتِ المسافة في السرعة! الزمن = المسافة ÷ السرعة.' },
      { value: 300000 / d, why: 'قلبتِ القسمة! المسافة هي المقسوم والسرعة هي المقسوم عليه.' },
    ],
  }
}

const lightYear: Gen = (rng, id) => {
  const n = pick(rng, [2, 4, 4.5, 10, 20])
  const a = n * 9.5
  return {
    kind: 'num', id, answer: a, unit: 'تريليون كم',
    q: `السنة الضوئية الواحدة تساوي ٩٫٥ تريليون كم تقريباً. نجم يبعد عنا ${n} سنة ضوئية، كم تريليون كيلومتر يبعد؟`,
    law: 'المسافة = عدد السنوات الضوئية × ٩٫٥ تريليون كم',
    sub: `${n} × 9.5`,
    explain: `${n} × ٩٫٥ = ${f(a)} تريليون كم`,
    mistakes: [
      { value: 9.5 / n, why: 'قسمتِ بدل ما تضربي! لازم تضربي عدد السنوات الضوئية في ٩٫٥.' },
      { value: n + 9.5, why: 'جمعتِ بدل الضرب!' },
    ],
  }
}

const microPower: Gen = (rng, id) => {
  const eye = pick(rng, [5, 10, 15])
  const obj = pick(rng, [4, 10, 40])
  const p = eye * obj
  return {
    kind: 'num', id, answer: p, unit: '×',
    q: `مجهر ضوئي مركّب قوة تكبير عدسته العينية ${eye}× وقوة تكبير عدسته الشيئية ${obj}×. ما قوة تكبير المجهر؟`,
    law: 'قوة تكبير المجهر = قوة العينية × قوة الشيئية',
    sub: `${eye} × ${obj}`,
    explain: `${eye} × ${obj} = ${p}×`,
    mistakes: [{ value: eye + obj, why: 'جمعتِ القوتين! لحساب قوة التكبير الكلية نضرب قوة العدستين.' }],
  }
}

const cellCount: Gen = (rng, id) => {
  if (rng() < 0.5) {
    const L = pick(rng, [3.5, 4, 5, 6])
    const a = 5 * L
    return {
      kind: 'num', id, answer: a, unit: 'مليار خلية',
      q: `يحتوي المليلتر الواحد من الدم على ٥ ملايين خلية دم حمراء تقريباً. كم مليار خلية دم حمراء في ${L} لتر من الدم؟ (١ لتر = ١٠٠٠ مل)`,
      law: 'العدد الكلي = عدد الخلايا في ١ مل × ١٠٠٠ × عدد اللترات',
      sub: `5 مليون × 1000 × ${L}`,
      explain: `٥ مليون × ١٠٠٠ = ٥ مليارات في اللتر الواحد، ثم × ${L} = ${f(a)} مليار`,
      mistakes: [
        { value: 5 * L * 1000, why: 'ضربتِ في ١٠٠٠ مرة زيادة، أو نسيتِ تحويل الملايين إلى مليارات.' },
        { value: L * 5 / 1000, why: 'قسمتِ على ١٠٠٠ بدل الضرب! اللتر الواحد فيه ١٠٠٠ مل، فنضرب.' },
      ],
    }
  }
  const L = pick(rng, [3.5, 4, 5])
  const a = 7.5 * L
  return {
    kind: 'num', id, answer: a, unit: 'مليون خلية',
    q: `يحتوي المليلتر الواحد من الدم على ٧٥٠٠ خلية دم بيضاء تقريباً. كم مليون خلية دم بيضاء في ${L} لتر من الدم؟ (١ لتر = ١٠٠٠ مل)`,
    law: 'العدد الكلي = عدد الخلايا في ١ مل × ١٠٠٠ × عدد اللترات',
    sub: `7500 × 1000 × ${L}`,
    explain: `٧٥٠٠ × ١٠٠٠ = ٧٫٥ مليون في اللتر الواحد، ثم × ${L} = ${f(a)} مليون`,
    mistakes: [
      { value: 7500 * L, why: 'نسيتِ تضربي في ١٠٠٠ لتحويل المليلتر إلى لتر.' },
      { value: 7.5 * L * 1000, why: 'هاد الجواب بالآلاف مو بالملايين، راجعي الوحدة.' },
    ],
  }
}


const popDensity: Gen = (rng, id) => {
  const a = pick(rng, [10, 20, 25, 50])
  const b = pick(rng, [10, 20, 40, 50])
  const d = pick(rng, [1, 2, 4, 5, 10])
  const n = d * a * b
  return {
    kind: 'num', id, answer: d, unit: 'نبتة لكل م²',
    q: `في مرج أبعاده ${a} م × ${b} م يوجد ${n} نبتة من النوع نفسه. ما كثافة هذه الجماعة؟`,
    law: 'كثافة الجماعة = عدد الأفراد ÷ المساحة',
    sub: `المساحة = ${a} × ${b} = ${a * b} م²، ثم ${n} ÷ ${a * b}`,
    explain: `المساحة ${a * b} م²، والكثافة = ${n} ÷ ${a * b} = ${d} نبتة لكل متر مربع.`,
    mistakes: [
      { value: n / (a + b), why: 'المساحة تُحسب بضرب الطول في العرض، مو بجمعهما.' },
      { value: a * b, why: 'هاي المساحة بس. الكثافة = العدد ÷ المساحة.' },
    ],
  }
}

const popCount: Gen = (rng, id) => {
  const s = pick(rng, [50, 100, 200])
  const a = pick(rng, [100, 200, 500, 900])
  const b = pick(rng, [20, 25, 40, 50])
  const area = a * b
  return {
    kind: 'num', id, answer: area / s, unit: 'أرنباً',
    q: `كثافة جماعة من الأرانب أرنب واحد لكل ${s} م². كم أرنباً تقريباً في منطقة أبعادها ${a} م × ${b} م؟`,
    law: 'عدد الأفراد = المساحة ÷ المساحة التي يشغلها الفرد الواحد',
    sub: `المساحة = ${a} × ${b} = ${area} م²، ثم ${area} ÷ ${s}`,
    explain: `المساحة ${area} م². وبما أن كل أرنب له ${s} م²، العدد = ${area} ÷ ${s} = ${area / s} أرنباً.`,
    mistakes: [
      { value: area * s, why: 'ضربتِ بدل ما تقسمي. كل ' + s + ' م² فيها أرنب واحد، فلازم نقسم.' },
      { value: area, why: 'هاي المساحة، لسه بدنا نقسمها على ' + s + '.' },
    ],
  }
}

const waterSaved: Gen = (rng, id) => {
  const f = pick(rng, [12, 15, 18])
  const sv = pick(rng, [6, 8, 9])
  const m = pick(rng, [3, 4, 5, 8, 10])
  const answer = (f - sv) * m * 7
  return {
    kind: 'num', id, answer, unit: 'لتراً',
    q: `يُخرج صنبور الاستحمام العادي ${f} لتراً في الدقيقة، وصنبور التوفير ${sv} لترات في الدقيقة. إذا استحمّت أسرة ${m} دقائق كل يوم، فكم لتراً توفّر في أسبوع باستعمال صنبور التوفير؟`,
    law: 'الماء الموفّر = (التدفق العادي − تدفق التوفير) × الدقائق × الأيام',
    sub: `(${f} − ${sv}) × ${m} × 7`,
    explain: `التوفير في الدقيقة ${f - sv} لتراً، في اليوم ${(f - sv) * m} لتراً، وفي ٧ أيام ${answer} لتراً.`,
    mistakes: [
      { value: (f - sv) * m, why: 'هاد توفير يوم واحد. السؤال عن أسبوع (٧ أيام).' },
      { value: f * m * 7, why: 'هاي كمية الماء كلها بالصنبور العادي، مو الموفّر. لازم نطرح تدفق التوفير.' },
    ],
  }
}

const surfaceTime: Gen = (rng, id) => {
  const hours = pick(rng, [3, 4, 5, 6])
  const under = pick(rng, [80, 90])
  const total = hours * 60
  const answer = (total * (100 - under)) / 100
  return {
    kind: 'num', id, answer, unit: 'دقيقة',
    q: `يقضي الحوت ${under}٪ من وقته تحت سطح الماء. كم دقيقة يبقى على السطح خلال ${hours} ساعات؟`,
    law: 'وقت السطح = (الوقت الكلي بالدقائق) × (نسبة البقاء على السطح)',
    sub: `${hours} × ٦٠ = ${total} دقيقة، ونسبة السطح ${100 - under}٪`,
    explain: `الوقت الكلي ${total} دقيقة، ونسبة السطح ${100 - under}٪، فالجواب ${total} × ${(100 - under) / 100} = ${answer} دقيقة.`,
    mistakes: [
      { value: (total * under) / 100, why: 'هاد الوقت تحت الماء. السؤال عن الوقت على السطح.' },
      { value: (hours * (100 - under)) / 100, why: 'نسيتِ تحوّلي الساعات إلى دقائق (× ٦٠).' },
    ],
  }
}

export const GENERATORS: Record<GenId, Gen> = {
  avgSpeed, distance, acceleration, accFromForce, netForce, weight, work,
  mechAdv, density, densityMass, neutrons, massNumber, massLaw, mapScale,
  plateDrift, erosionHeight,
  fToC, cToF, windSpeed, relHumidity, auKm, lightTime, lightYear, microPower, cellCount,
  popDensity, popCount, waterSaved, surfaceTime,
}

export function generate(gen: GenId, rng: Rng, id: string): NumQ {
  const q = GENERATORS[gen](rng, id)
  // نحذف «الخطأ الشائع» إن تطابق مع الجواب الصحيح (مثلاً عندما تكون السرعة الابتدائية صفراً)
  return { ...q, mistakes: q.mistakes?.filter((m) => Math.abs(m.value - q.answer) > 0.011) }
}

/** يفحص إجابة رقمية؛ يرجع سبب الخطأ الشائع إن وُجد. */
export function checkNumeric(q: NumQ, value: number): { ok: boolean; why?: string } {
  const close = (a: number, b: number) => Math.abs(a - b) <= 0.011
  if (close(value, q.answer)) return { ok: true }
  const m = q.mistakes?.find((x) => close(value, x.value))
  return { ok: false, why: m?.why }
}
