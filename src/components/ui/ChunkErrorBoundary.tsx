import { Component, type ReactNode } from 'react'

/**
 * Catches a failed lazy load (for example an old tab asking for files a new deploy replaced)
 * and offers a reload instead of a blank page.
 */
export class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-98 px-6">
        <div className="max-w-[420px] rounded-3xl border border-veil-black-16 bg-white p-8 flex flex-col gap-4">
          <h1 className="text-headline-sm text-darkest">This page did not load</h1>
          <p className="text-body-md text-ink-30">A newer version may have been published while this tab was open. Reloading fixes it.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn state-layer btn-bg-primary justify-center px-5 py-3 text-label-md">
            Reload
          </button>
        </div>
      </div>
    )
  }
}
