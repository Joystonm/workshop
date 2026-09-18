import { useEffect, useState } from 'react'
import { Router, Route, Switch } from 'wouter'
import { ConvexProvider } from 'convex/react'
import { ConvexReactClient } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Home } from './pages/Home'
import { WorkshopPage } from './pages/Workshop'
import { Navigation } from './components/Navigation'
import { WorkshopProvider } from './hooks/useWorkshop'
import { CompanionProvider } from './hooks/useCompanionContext'
import { CompanionFab } from './components/companion/CompanionFab'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

function AppContent() {
  return (
    <WorkshopProvider user={null}>
      <CompanionProvider>
        <div className="app" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navigation />
          <main className="main-content" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Router base={import.meta.env.BASE_URL}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/workshop/:slug" component={WorkshopPage} />
              </Switch>
            </Router>
          </main>
        </div>
        <CompanionFab />
      </CompanionProvider>
    </WorkshopProvider>
  )
}

export function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  )
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4L4 14v20l20 10 20-10V14L24 4z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path d="M24 14L14 20v12l10 6 10-6V20L24 14z" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
      <style>{`
        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
        }
        .loading-logo {
          color: var(--accent);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
