import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import './home.css'

const workshops = [
  {
    slug: 'cad',
    name: 'CAD',
    category: 'Design & Engineering',
    tagline: 'Build 3D structures and test their limits',
    description: 'Create, manipulate, and stress-test 3D models. Learn engineering principles through hands-on building.',
    stats: '12 experiments',
    color: '#6366F1',
  },
  {
    slug: 'physics',
    name: 'PHYSICS',
    category: 'Science & Experiments',
    tagline: 'Build circuits and explore motion',
    description: 'Design electrical circuits, experiment with forces, and understand the laws governing our universe.',
    stats: '8 experiments',
    color: '#16A34A',
  },
  {
    slug: 'chemistry',
    name: 'CHEMISTRY',
    category: 'Lab & Reactions',
    tagline: 'Real elements, real molecules, real reactions',
    description: 'A virtual chemistry lab with 118 elements, isotopes, electron configurations, pH, titration, and molecular 3D models.',
    stats: '11 experiments',
    color: '#9333EA',
  },
  {
    slug: 'climate',
    name: 'EARTH & CLIMATE',
    category: 'Planetary Science',
    tagline: 'Live data from weather, air quality and seismic networks',
    description: 'Real-time weather, air quality, earthquakes, ocean waves, climate trends, solar irradiance and NASA Earth observation — all from live public APIs.',
    stats: '8 experiments',
    color: '#0EA5E9',
  },
]

const heroTags = [
  { label: '3D Modeling', meta: 'CAD', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.10)' },
  { label: 'Circuits', meta: 'PHYSICS', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.10)' },
  { label: 'Chemistry', meta: 'LAB', color: '#9333EA', bg: 'rgba(147, 51, 234, 0.10)' },
  { label: 'Earth', meta: 'CLIMATE', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.10)' },
]

export function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden />
              4 workshops · 39 experiments · free forever
            </span>
            <h1 className="hero-title">
              Learn by<br />
              <span className="hero-highlight">building</span>
            </h1>
            <p className="hero-description">
              Don't memorize how the world works. Build things with your hands,
              break them, and figure out why.
            </p>
            <div className="hero-actions">
              <Link href="/workshop/physics" className="btn btn-primary btn-lg">
                Start Building
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/workshop/cad" className="btn btn-secondary btn-lg">Explore CAD</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-tag-grid">
              {heroTags.map((tag) => (
                <div className="hero-tag" key={tag.label}>
                  <span
                    className="hero-tag-icon"
                    style={{ background: tag.bg, color: tag.color }}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span>
                    {tag.label}
                    <span className="hero-tag-meta">{tag.meta}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-value">4</span>
            <span className="stat-label">Workshops</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">39</span>
            <span className="stat-label">Experiments</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">Free</span>
            <span className="stat-label">Forever</span>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section className="workshops-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Choose Your Workshop</h2>
            <p className="section-subtitle">Four disciplines. Endless possibilities.</p>
          </div>

          <div className="workshops-grid">
            {workshops.map((workshop) => (
              <Link
                key={workshop.slug}
                href={`/workshop/${workshop.slug}`}
                className="workshop-card"
                style={{ '--ws-color': workshop.color } as React.CSSProperties}
              >
                <div className="card-accent" />
                <div className="card-content">
                  <div className="card-category">{workshop.category}</div>
                  <h3 className="card-title">{workshop.name}</h3>
                  <p className="card-tagline">{workshop.tagline}</p>
                  <p className="card-description">{workshop.description}</p>
                </div>
                <div className="card-footer">
                  <span className="card-stats">{workshop.stats}</span>
                  <span className="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-inner">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4>Hands-On Learning</h4>
              <p>Build real things. Not multiple choice questions.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h4>Learn at Your Pace</h4>
              <p>No grades. No pressure. Just exploration.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Safe to Fail</h4>
              <p>Break things without consequences. That's how you learn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-inner">
          <div className="cta-card">
            <h2>Ready to start building?</h2>
            <p>Pick a workshop and start experimenting.</p>
            <Link href="/workshop/physics" className="btn btn-primary btn-lg">
              Enter Workshop
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <p>Built for curious minds.</p>
        </div>
      </footer>
    </div>
  )
}
