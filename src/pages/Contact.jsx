import { useSearchParams } from 'react-router-dom'
import InquiryForm from '../components/InquiryForm.jsx'

export default function Contact() {
  const [q] = useSearchParams()
  return (
    <section className="wrap page split-top">
      <div>
        <h1>Request a quote</h1>
        <p className="lede">Share what you need and we’ll reply with a rate.</p>
        <p>Veliora Polymars<br />Palda<br /><a href="tel:+919226045847">9226045847</a><br /><a href="mailto:veliora740@gmail.com">veliora740@gmail.com</a></p>
      </div>
      <InquiryForm product={q.get('product') || ''} />
    </section>
  )
}
