import { useLocation, Link } from 'wouter'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/workshop/cad', label: 'CAD' },
  { href: '/workshop/physics', label: 'Physics' },
  { href: '/workshop/chemistry', label: 'Chemistry' },
  { href: '/workshop/climate', label: 'Earth & Climate' },
]

export function Navigation() {
  const [location] = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link href="/">
          <div className="brand-link">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4L4 14v20l20 10 20-10V14L24 4z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path d="M24 14L14 20v12l10 6 10-6V20L24 14z" fill="currentColor" opacity="0.15" />
            </svg>
            <span className="brand-name">WORKSHOP</span>
          </div>
        </Link>
      </div>

      <div className="nav-links">
        {navItems.map((item) => {
          const isActive = location === item.href
          const isWorkshop = item.href.startsWith('/workshop')
          const workshopSlug = isWorkshop ? item.href.split('/').pop() : null
          const isWorkshopActive = workshopSlug && location.startsWith(`/workshop/${workshopSlug}`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive || isWorkshopActive ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="nav-spacer" />

      <style>{`
        .navigation {
          height: 56px;
          flex-shrink: 0;          /* don't let flex shrink it; always 56px in the column */
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          padding: 0 var(--space-6);
          z-index: 100;
          gap: var(--space-6);
        }

        .nav-brand a {
          display: flex;
          align-items: center;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--text-primary);
        }

        .brand-link svg {
          color: var(--accent);
        }

        .brand-name {
          font-size: var(--text-sm);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .nav-link {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-link.active {
          color: var(--accent);
          background: var(--accent-dim);
        }

        .nav-spacer {
          flex: 1;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}
