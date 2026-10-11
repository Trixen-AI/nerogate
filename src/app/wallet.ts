import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { http } from 'viem'
import { getChainId, sendTransaction, switchChain } from 'wagmi/actions'
import { RPC_URL } from './lib/api'

// Reown AppKit is the only wallet connection in the app: Ethereum mainnet through the wagmi adapter.
// The project id comes from the environment (.env).
export const REOWN_PROJECT_ID: string = import.meta.env.VITE_REOWN_PROJECT_ID ?? ''

export const wagmiAdapter = REOWN_PROJECT_ID
  ? new WagmiAdapter({
      networks: [mainnet],
      projectId: REOWN_PROJECT_ID,
      transports: { [mainnet.id]: http(RPC_URL) },
    })
  : undefined

if (wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [mainnet],
    defaultNetwork: mainnet,
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: 'Nerogate',
      description: 'Monero in. Real-world assets out.',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon-512.png`],
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

export type TxRequest = { to: `0x${string}`; data: `0x${string}`; value: bigint }

export type Wallet = {
  /** Checksummed address of the connected Ethereum account. */
  address?: `0x${string}`
  connected: boolean
  /** Send a transaction from the connected wallet on Ethereum mainnet; resolves to the tx hash. */
  send: (tx: TxRequest) => Promise<`0x${string}`>
  /** Open the connect modal (or the account view when connected). */
  open: () => void
  configured: boolean
}

async function sendOnMainnet(tx: TxRequest) {
  const config = wagmiAdapter!.wagmiConfig
  if (getChainId(config) !== mainnet.id) await switchChain(config, { chainId: mainnet.id })
  return sendTransaction(config, { ...tx, chainId: mainnet.id })
}

function useReownWallet(): Wallet {
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { open } = useAppKit()
  return {
    address: isConnected && address ? (address as `0x${string}`) : undefined,
    connected: isConnected,
    send: sendOnMainnet,
    open: () => void open(isConnected ? { view: 'Account' } : undefined),
    configured: true,
  }
}

const notConfigured = () => {
  throw new Error('Wallet connection is not configured. Set VITE_REOWN_PROJECT_ID.')
}

function useMissingWallet(): Wallet {
  return {
    connected: false,
    configured: false,
    send: notConfigured,
    open: () => window.alert('Wallet connection is not configured. Set VITE_REOWN_PROJECT_ID in .env and restart the app.'),
  }
}

/** The connected wallet. Picked once at module load, so hook order never changes. */
export const useWallet: () => Wallet = REOWN_PROJECT_ID ? useReownWallet : useMissingWallet
