import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { SolanaAdapter, type Provider } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

// Reown AppKit is the only wallet connection in the app. The project id comes from the environment (.env).
export const REOWN_PROJECT_ID: string = import.meta.env.VITE_REOWN_PROJECT_ID ?? ''

if (REOWN_PROJECT_ID) {
  createAppKit({
    adapters: [new SolanaAdapter()],
    networks: [solana],
    defaultNetwork: solana,
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: 'Nerogate',
      description: 'Monero in. Real-world assets out.',
      url: window.location.origin,
      icons: [`${window.location.origin}/brand/logo-500.png`],
    },
    features: { analytics: false, email: false, socials: false, swaps: false, onramp: false },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#c8400c',
      '--w3m-font-family': "'Inter Variable', system-ui, sans-serif",
      '--w3m-border-radius-master': '2px',
    },
  })
}

export type Wallet = {
  /** Base58 address of the connected Solana account. */
  address?: string
  connected: boolean
  provider?: Provider
  /** Open the connect modal (or the account view when connected). */
  open: () => void
  configured: boolean
}

function useReownWallet(): Wallet {
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { open } = useAppKit()
  return {
    address: isConnected ? address : undefined,
    connected: isConnected,
    provider: walletProvider,
    open: () => void open(isConnected ? { view: 'Account' } : undefined),
    configured: true,
  }
}

function useMissingWallet(): Wallet {
  return {
    connected: false,
    configured: false,
    open: () => window.alert('Wallet connection is not configured. Set VITE_REOWN_PROJECT_ID in .env and restart the app.'),
  }
}

/** The connected wallet. Picked once at module load, so hook order never changes. */
export const useWallet: () => Wallet = REOWN_PROJECT_ID ? useReownWallet : useMissingWallet
