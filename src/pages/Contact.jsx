import { useState } from 'react'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import useReveal from '../hooks/useReveal.js'
import Button from '../components/Button.jsx'
import { supabase } from '../lib/supabase.js'

const infoItems = [
  { icon: Phone, title: 'Phone', value: '+201013287002 - +201090311995' },
  { icon: Mail, title: 'Email', value: 'easygroupads@gmail.com' },
  {
    icon: MapPin,
    title: 'Location',
    value:
      '7964, Street 9 beside Ezz El Din Pharmacy, El Mokattam, Cairo, Egypt',
  },
]


export default function Contact() {
  const scopeRef = useReveal([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    details: '',
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('orders')
      .insert([formData])

    setLoading(false)

    if (error) {
      console.error('Failed to submit order:', error)
    }

    setSubmitted(true)
  }

  return (
    <div ref={scopeRef}>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Let's Work Together</span>
          <h1 className="page-hero-heading">
            LET'S BRING
            <br />
            YOUR NEXT IDEA
            <br />
            TO LIFE.
          </h1>
          <p className="page-hero-sub">
            Tell us about your project and our team will get back to you.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+20 1XX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="service">Service</label>
              <select
                id="service"
                value={formData.service}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select a service
                </option>
                <option>Printing Solutions</option>
                <option>Branding & Identity</option>
                <option>Advertising & Outdoor</option>
                <option>Exhibition & Events</option>
                <option>Something else</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="details">Project Details</label>
              <textarea
                id="details"
                placeholder="Tell us a bit about your project…"
                value={formData.details}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-submit">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : submitted ? 'Message Sent' : 'Send Message'}
              </Button>
            </div>
            {submitted && (
              <p className="form-note">Thanks — a member of our team will be in touch shortly.</p>
            )}
          </form>

          <div className="contact-info reveal reveal-delay-2">
            {infoItems.map((item) => {
              const Icon = item.icon

              return (
                <div className="info-card" key={item.title}>
                  <span className="info-card-icon">
                    <Icon size={18} />
                  </span>

                  <div>
                    <div className="info-card-title">
                      {item.title}
                    </div>

                    <div className="info-card-value">
                      {item.value}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Working Hours */}
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--ink-card)] p-7 md:p-8">

              {/* Header */}
              <div className="mb-7 flex items-center gap-4">
                <span className="info-card-icon">
                  <Clock size={18} />
                </span>

                <div>
                  <div className="info-card-title">
                    Working Hours
                  </div>

                  <div className="text-[16px] font-medium text-[var(--paper)]">
                    Open Hours
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="border-t border-[var(--line)]">

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Monday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Tuesday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Wednesday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Thursday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Friday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    3:00 AM – 12:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] py-3">
                  <span className="text-sm text-[var(--mist)]">
                    Saturday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 pt-3">
                  <span className="text-sm text-[var(--mist)]">
                    Sunday
                  </span>

                  <span className="text-right text-sm text-[var(--paper)]">
                    10:00 AM – 11:00 PM
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="map-section reveal">
          <a
            href="https://maps.app.goo.gl/gHt1U4C4gG3v9G6h7"
            target="_blank"
            rel="noopener noreferrer"
            className="map-section reveal"
            aria-label="Open Easy Group location in Google Maps"
          >
            <iframe
              title="Easy Group Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.9840036944256!2d31.309035200000004!3d30.008615699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583929f9e99f53%3A0x15916ccb2a9baced!2zKHByaW50aW5nICYgQWR2ZXJ0aXNpbmcpINin2YrYstmJINis2LHZiNioIC8gRWFzeSBHcm91cA!5e0!3m2!1sen!2seg!4v1786725884760!5m2!1sen!2seg"
              loading="lazy"
              tabIndex="-1"
            />


            <div className="map-overlay">
              <span className="map-pin-dot" />

              <span className="map-pin-label">Easy Group Studio — 7964,street 9 el mokattam Cairo Egypt</span>

            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
