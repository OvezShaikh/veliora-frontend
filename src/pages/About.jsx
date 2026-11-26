import { Link } from 'react-router-dom'
const steps = [
  ['Collect', 'Factory waste PP bags, jumbo bags and raffia bags are bought in bulk and graded by type and colour.'],
  ['Sort and shred', 'Contaminants are removed and the material is separated into PP white, PP yellow, PP mixed and BOPP.'],
  ['Wash and dry', 'Material is cleaned of dirt and residue and dried.'],
  ['Pack and dispatch', 'Material is baled or bagged and supplied to recyclers and processors in bulk.'],
]
export default function About() {
  return (
    <section className="wrap page">
      <h1>Building a greener tomorrow, one batch at a time</h1>
      <p className="lede">Veliora Polymars is a plastic recycling business based in Palda, run by proprietor Soham Sutar. We deal in PP and BOPP plastic for recycling and buy factory waste PP bags in bulk.</p>
      <h2>How a batch is made</h2>
      <ol className="steps">{steps.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol>
      <h2>Why recycled polymer</h2>
      <p>Recycling PP and BOPP keeps plastic in use longer and cuts the waste that ends up in landfill, while giving manufacturers a lower-cost raw material.</p>
      <p><Link className="btn" to="/contact">Talk to us about your requirement</Link></p>
    </section>
  )
}
