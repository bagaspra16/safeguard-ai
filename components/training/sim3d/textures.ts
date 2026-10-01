import * as THREE from 'three'

// Small procedural canvas textures. Generated once per page and cached, so
// the scenes ship no image assets and stay cheap on the GPU.

const cache = new Map<string, THREE.Texture>()

function canvasTexture(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  opts: { repeat?: [number, number]; color?: boolean } = {}
) {
  const id = opts.repeat ? `${key}:${opts.repeat.join('x')}` : key
  const hit = cache.get(id)
  if (hit) return hit

  let tex: THREE.Texture
  const base = cache.get(key)
  if (base) {
    tex = base.clone()
  } else {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    draw(canvas.getContext('2d')!, w, h)
    tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 4
    if (opts.color !== false) tex.colorSpace = THREE.SRGBColorSpace
    cache.set(key, tex)
  }
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...opts.repeat)
    tex.needsUpdate = true
    cache.set(id, tex)
  }
  return tex
}

/** Deterministic PRNG so textures look the same on every load. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, count: number, alpha: number, light: boolean) {
  const r = rng(seed)
  for (let i = 0; i < count; i++) {
    const v = light ? 255 : 0
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * alpha})`
    const s = r() * 2.2 + 0.4
    ctx.fillRect(r() * w, r() * h, s, s)
  }
}

function stains(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, count: number, rgb: string, alpha: number) {
  const r = rng(seed)
  for (let i = 0; i < count; i++) {
    const x = r() * w
    const y = r() * h
    const rad = 20 + r() * 90
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, `rgba(${rgb},${alpha * r()})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
}

/** Sealed warehouse concrete with saw-cut joints, tyre marks and wear. */
export function concreteTexture(repeat: [number, number], tint = '#7b7f84') {
  return canvasTexture(
    `concrete-${tint}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = tint
      ctx.fillRect(0, 0, w, h)
      stains(ctx, w, h, 7, 26, '40,42,46', 0.22)
      stains(ctx, w, h, 11, 14, '255,255,255', 0.06)
      speckle(ctx, w, h, 3, 9000, 0.18, false)
      speckle(ctx, w, h, 5, 5000, 0.12, true)
      // Saw-cut control joints
      ctx.strokeStyle = 'rgba(20,20,22,0.45)'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, w - 2, h - 2)
      // Tyre scuffs
      const r = rng(19)
      ctx.strokeStyle = 'rgba(15,15,15,0.07)'
      for (let i = 0; i < 6; i++) {
        ctx.lineWidth = 6 + r() * 8
        ctx.beginPath()
        const y = r() * h
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 120, w * 0.6, y + (r() - 0.5) * 120, w, y + (r() - 0.5) * 60)
        ctx.stroke()
      }
    },
    { repeat }
  )
}

/** Packed dirt / gravel for the construction site ground. */
export function dirtTexture(repeat: [number, number]) {
  return canvasTexture(
    'dirt',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#8a7558'
      ctx.fillRect(0, 0, w, h)
      stains(ctx, w, h, 23, 40, '70,55,38', 0.4)
      stains(ctx, w, h, 29, 20, '170,150,120', 0.25)
      speckle(ctx, w, h, 31, 14000, 0.3, false)
      speckle(ctx, w, h, 37, 6000, 0.25, true)
    },
    { repeat }
  )
}

/** Corrugated metal wall cladding. */
export function claddingTexture(repeat: [number, number], tint = '#c9cdd2') {
  return canvasTexture(
    `cladding-${tint}`,
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = tint
      ctx.fillRect(0, 0, w, h)
      for (let x = 0; x < w; x += 16) {
        const g = ctx.createLinearGradient(x, 0, x + 16, 0)
        g.addColorStop(0, 'rgba(0,0,0,0.16)')
        g.addColorStop(0.5, 'rgba(255,255,255,0.12)')
        g.addColorStop(1, 'rgba(0,0,0,0.16)')
        ctx.fillStyle = g
        ctx.fillRect(x, 0, 16, h)
      }
      stains(ctx, w, h, 41, 10, '60,60,60', 0.12)
    },
    { repeat }
  )
}

/** Cardboard carton with tape strip and label. */
export function cartonTexture() {
  return canvasTexture('carton', 128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b98a55'
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 43, 1500, 0.15, false)
    ctx.fillStyle = 'rgba(220,190,140,0.75)'
    ctx.fillRect(0, h * 0.44, w, h * 0.12)
    ctx.fillStyle = '#f4f4f0'
    ctx.fillRect(w * 0.12, h * 0.66, w * 0.36, h * 0.2)
    ctx.fillStyle = '#333'
    for (let i = 0; i < 5; i++) ctx.fillRect(w * 0.15, h * (0.69 + i * 0.03), w * (0.1 + (i % 3) * 0.08), 1.5)
  })
}

/** Black/yellow chevrons for hazard edges. */
export function hazardStripeTexture(repeat: [number, number]) {
  return canvasTexture(
    'hazard',
    128,
    32,
    (ctx, w, h) => {
      ctx.fillStyle = '#facc15'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#111'
      for (let x = -h; x < w + h; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, h)
        ctx.lineTo(x + 16, h)
        ctx.lineTo(x + 16 + h, 0)
        ctx.lineTo(x + h, 0)
        ctx.fill()
      }
    },
    { repeat }
  )
}

/** Soft round sprite used for fire, glow and smoke particles. */
export function softSpriteTexture() {
  return canvasTexture(
    'soft-sprite',
    128,
    128,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.35, 'rgba(255,255,255,0.6)')
      g.addColorStop(0.7, 'rgba(255,255,255,0.15)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
    { color: false }
  )
}

/** Lumpy, billowing puff for smoke. */
export function smokeSpriteTexture() {
  return canvasTexture(
    'smoke-sprite',
    128,
    128,
    (ctx, w, h) => {
      const r = rng(53)
      for (let i = 0; i < 26; i++) {
        const a = r() * Math.PI * 2
        const d = r() * w * 0.22
        const x = w / 2 + Math.cos(a) * d
        const y = h / 2 + Math.sin(a) * d
        const rad = w * (0.12 + r() * 0.16)
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
        g.addColorStop(0, 'rgba(255,255,255,0.32)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
      }
    },
    { color: false }
  )
}

/** Printed sign: background colour, optional pictogram glyph, text lines. */
export function signTexture(
  key: string,
  lines: string[],
  opts: { bg: string; fg: string; w?: number; h?: number; border?: string; glyph?: string; font?: number }
) {
  const w = opts.w ?? 512
  const h = opts.h ?? 256
  return canvasTexture(`sign-${key}`, w, h, (ctx) => {
    ctx.fillStyle = opts.bg
    ctx.fillRect(0, 0, w, h)
    if (opts.border) {
      ctx.strokeStyle = opts.border
      ctx.lineWidth = Math.max(8, w * 0.025)
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
    }
    ctx.fillStyle = opts.fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const size = opts.font ?? Math.floor(h / (lines.length + (opts.glyph ? 1.6 : 0.9)))
    let y = h / 2 - ((lines.length - 1) * size * 1.1) / 2
    if (opts.glyph) {
      ctx.font = `900 ${Math.floor(size * 1.3)}px Inter, Arial, sans-serif`
      ctx.fillText(opts.glyph, w / 2, y - size * 0.55)
      y += size * 0.75
    }
    ctx.font = `900 ${size}px Inter, Arial, sans-serif`
    lines.forEach((line, i) => ctx.fillText(line, w / 2, y + i * size * 1.1))
  })
}

/** Painted floor stencil (transparent background). */
export function stencilTexture(key: string, text: string, color: string) {
  return canvasTexture(`stencil-${key}`, 1024, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '900 84px Inter, Arial, sans-serif'
    ctx.fillText(text, w / 2, h / 2 + 4)
  })
}

/** Low-cost window grid for distant buildings. */
export function windowsTexture(repeat: [number, number]) {
  return canvasTexture(
    'windows',
    128,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = '#5b6573'
      ctx.fillRect(0, 0, w, h)
      const r = rng(61)
      for (let y = 6; y < h; y += 16) {
        for (let x = 6; x < w; x += 16) {
          const lit = r()
          ctx.fillStyle = lit > 0.8 ? '#cfd8e3' : lit > 0.4 ? '#3c4655' : '#4a5566'
          ctx.fillRect(x, y, 10, 9)
        }
      }
    },
    { repeat }
  )
}

/** Tileable soft cloud blobs on transparent — for smoke layers. */
export function cloudTexture(repeat: [number, number]) {
  return canvasTexture(
    'cloud-layer',
    256,
    256,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      const r = rng(71)
      for (let i = 0; i < 70; i++) {
        const x = r() * w
        const y = r() * h
        const rad = 18 + r() * 46
        // Draw wrapped copies so the texture tiles seamlessly
        for (const ox of [-w, 0, w]) {
          for (const oy of [-h, 0, h]) {
            const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad)
            g.addColorStop(0, `rgba(255,255,255,${0.25 + r() * 0.2})`)
            g.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.fillStyle = g
            ctx.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2)
          }
        }
      }
    },
    { repeat, color: false }
  )
}
