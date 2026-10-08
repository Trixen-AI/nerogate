import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router'
import { Nav } from '@/components/sections/Nav'
import { Footer } from '@/components/sections/Bottom'
import Home from '@/pages/Home'
import { ChunkErrorBoundary } from '@/components/ui/ChunkErrorBoundary'

// Guide articles and the dashboard are only fetched when someone opens them.
const GuidePage = lazy(() => import('@/pages/GuidePage'))
const Dashboard = lazy(() => import('@/app/Dashboard'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

function SiteLayout() {
  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="app/*"
          element={
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="min-h-screen bg-ink-98" />}>
                <Dashboard />
              </Suspense>
            </ChunkErrorBoundary>
          }
        />
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route
            path="guides/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <GuidePage />
              </Suspense>
            }
          />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
