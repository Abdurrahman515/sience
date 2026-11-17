import type { Rng } from './rng'
import { pick } from './rng'

export const PRAISE = [
  'هيك بدها! 🎉',
  'أحسنتِ! 👏',
  'كفو عليكِ! 💪',
  'أسطورة! 🌟',
  'يسلمو إيديكِ! ✨',
  'برافو عليكِ! 🥳',
]

export const TRY_AGAIN = [
  'قربتِ! فكّري شوي وجرّبي مرة تانية 🤔',
  'ولا يهمك، جرّبي مرة تانية 🌈',
  'قاربتِ على الحل، ركّزي معي 🔍',
]

export const MISS = [
  'ولا يهمك، هيك منتعلّم 🌱',
  'قربتِ! خلينا نشوف الصح سوا 🔍',
  'غلطة بسيطة، المهم نفهمها 💡',
]

export function miss(rng: Rng): string {
  return pick(rng, MISS)
}

export function praise(rng: Rng): string {
  return pick(rng, PRAISE)
}

export function tryAgain(rng: Rng): string {
  return pick(rng, TRY_AGAIN)
}
