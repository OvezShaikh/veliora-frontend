import { useId } from 'react'

// Placeholder product illustrations, one per material. Replace with real photos from the admin Products tab.
const SPEC = {
  'pp-white':    { type: 'bale', c: ['#f3f0e6'] },
  'pp-yellow':   { type: 'bale', c: ['#e9bf2f'] },
  'bopp-colour': { type: 'bale', c: ['#d1495b', '#2e86ab', '#f2c14e', '#5aa469'] },
  'bopp-mix':    { type: 'bale', c: ['#d8d2c2', '#8fa3ad', '#d9a066', '#b5c99a', '#ece7da'] },
  'bag-white':   { type: 'bag', c: ['#f3f0e6'] },
  'bag-mixed':   { type: 'bag', c: ['#f3f0e6', '#d1495b', '#2e86ab', '#e9bf2f'] },
  jumbo:         { type: 'jumbo', c: ['#ece6d6'] },
  raffia:        { type: 'bag', c: ['#c9b27a', '#5b8c6a'], raffia: true },
}
const BAG = 'M118 96 Q200 80 282 96 L298 246 Q200 266 102 246 Z'

export function ProductArt({ kind }) {
  const u = useId().replace(/:/g, '')
  const s = SPEC[kind] || SPEC['pp-white']
  const n = s.c.length
  const stripes = (x, y, w, h) => s.c.map((col, i) => <rect key={i} x={x + (w / n) * i} y={y} width={w / n + 0.6} height={h} fill={col} />)
  const weave = `url(#w${u})`, shade = `url(#s${u})`
  return (
    <svg className="art" viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <radialGradient id={`g${u}`} cx="50%" cy="38%" r="80%"><stop offset="0" stopColor="#2b2518" /><stop offset="1" stopColor="#0e0c08" /></radialGradient>
        <linearGradient id={`s${u}`} x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity=".32" /><stop offset=".35" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#000" stopOpacity=".38" /></linearGradient>
        <pattern id={`w${u}`} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6M3 0V6" stroke="#000" strokeOpacity=".16" strokeWidth=".8" /></pattern>
        <clipPath id={`bag${u}`}><path d={BAG} /></clipPath>
        <clipPath id={`box${u}`}><rect x="105" y="108" width="190" height="148" rx="5" /></clipPath>
        <clipPath id={`side${u}`}><polygon points="260,110 312,80 312,210 260,240" /></clipPath>
        <clipPath id={`top${u}`}><polygon points="90,110 142,80 312,80 260,110" /></clipPath>
      </defs>
      <rect width="400" height="300" fill={`url(#g${u})`} />
      <ellipse cx="200" cy="264" rx="125" ry="13" fill="#000" opacity=".55" />

      {s.type === 'bale' && <>
        {stripes(90, 110, 170, 130)}
        <rect x="90" y="110" width="170" height="130" fill={weave} />
        <g clipPath={`url(#side${u})`}>{stripes(260, 80, 52, 160)}<rect x="260" y="80" width="52" height="160" fill="#000" opacity=".32" /><rect x="260" y="80" width="52" height="160" fill={weave} /></g>
        <g clipPath={`url(#top${u})`}>{stripes(90, 80, 222, 30)}<rect x="90" y="80" width="222" height="30" fill="#fff" opacity=".2" /><rect x="90" y="80" width="222" height="30" fill={weave} /></g>
        <rect x="130" y="110" width="7" height="130" fill="#15130e" opacity=".75" />
        <rect x="214" y="110" width="7" height="130" fill="#15130e" opacity=".75" />
        <polygon points="130,110 137,110 189,80 182,80" fill="#15130e" opacity=".6" />
        <polygon points="214,110 221,110 273,80 266,80" fill="#15130e" opacity=".6" />
      </>}

      {s.type === 'bag' && <>
        <g clipPath={`url(#bag${u})`}>
          {stripes(100, 70, 200, 210)}
          <rect x="100" y="70" width="200" height="210" fill={weave} />
          {s.raffia && <rect x="100" y="70" width="200" height="210" fill={weave} />}
          <rect x="100" y="70" width="200" height="210" fill={shade} />
          <rect x="100" y="70" width="200" height="50" fill="#000" opacity=".12" />
        </g>
        <path d="M114 122 Q200 110 286 122" fill="none" stroke="#15130e" strokeOpacity=".5" strokeDasharray="4 4" />
      </>}

      {s.type === 'jumbo' && <>
        <g fill="none" stroke="#d8d0bb" strokeWidth="7" strokeLinecap="round">
          <path d="M122 110 C106 40 158 40 146 110" /><path d="M254 110 C242 40 294 40 278 110" />
        </g>
        <g clipPath={`url(#box${u})`}>
          {stripes(105, 108, 190, 148)}
          <rect x="105" y="108" width="190" height="148" fill={weave} />
          <rect x="105" y="108" width="190" height="148" fill={shade} />
          <rect x="105" y="108" width="190" height="26" fill="#000" opacity=".12" />
        </g>
        <path d="M105 134H295M200 134V256" fill="none" stroke="#15130e" strokeOpacity=".35" strokeDasharray="4 4" />
      </>}
    </svg>
  )
}

export function Media({ p }) {
  return <span className="media">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <ProductArt kind={p.art} />}</span>
}
export default ProductArt
