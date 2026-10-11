import { useEffect } from 'react'

const SITE = 'https://nerogate.org'
const DEFAULT = {
  title: 'Nerogate | Monero in. Real-world assets out.',
  description:
    'Nerogate is the private on-ramp from Monero to tokenized stocks, ETFs and gold on Ethereum. Pay with XMR from any wallet and hold SPYx, QQQx, GLDx, NVDAx and more yourself. No account.',
  path: '/',
}

function setTag(selector: string, attr: 'content' | 'href', value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

function apply(title: string, description: string, path: string) {
  document.title = title
  const url = SITE + path
  setTag('meta[name="description"]', 'content', description)
  setTag('link[rel="canonical"]', 'href', url)
  setTag('meta[property="og:url"]', 'content', url)
  setTag('meta[property="og:title"]', 'content', title)
  setTag('meta[property="og:description"]', 'content', description)
  setTag('meta[name="twitter:title"]', 'content', title)
  setTag('meta[name="twitter:description"]', 'content', description)
}

/** Per-page title, description and canonical URL for this single-page app. Restores the site defaults on leave. */
export function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    apply(title, description, path)
    return () => apply(DEFAULT.title, DEFAULT.description, DEFAULT.path)
  }, [title, description, path])
}
