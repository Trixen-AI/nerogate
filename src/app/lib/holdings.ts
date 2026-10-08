import { type Connection, PublicKey } from '@solana/web3.js'
import { ASSETS, SOL_MINT, TOKEN_2022_PROGRAM, TOKEN_PROGRAM } from './assets'

const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

export type Holdings = { sol: number; tokens: Record<string, number> }

const TOKENS = ASSETS.filter((a) => a.mint !== SOL_MINT)
const BATCH = 6

/** The associated token account: where wallets (and every Jupiter swap) keep a given token. */
function ataFor(owner: PublicKey, mint: string, program: string) {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), new PublicKey(program).toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM,
  )[0]
}

/**
 * SOL balance plus the balance of every supported asset at an address.
 * Reads the derived token accounts in one getMultipleAccounts call, which public RPCs serve without an API key
 * (unlike owner-indexed queries).
 */
export async function fetchHoldings(connection: Connection, owner: string): Promise<Holdings> {
  const key = new PublicKey(owner)
  const atas = TOKENS.map((a) => ataFor(key, a.mint, a.issuer === 'Backed' ? TOKEN_2022_PROGRAM : TOKEN_PROGRAM))
  // Public RPCs reject large multi-account reads, so ask in small batches.
  const chunks: PublicKey[][] = []
  for (let i = 0; i < atas.length; i += BATCH) chunks.push(atas.slice(i, i + BATCH))
  const [lamports, ...parts] = await Promise.all([
    connection.getBalance(key),
    ...chunks.map((c) => connection.getMultipleParsedAccounts(c)),
  ])
  const accounts = parts.flatMap((p) => p.value)
  const tokens: Record<string, number> = {}
  accounts.forEach((acc, i) => {
    const data = acc?.data
    if (data && 'parsed' in data) {
      const amount = Number(data.parsed?.info?.tokenAmount?.uiAmount ?? 0)
      if (amount > 0) tokens[TOKENS[i].mint] = amount
    }
  })
  return { sol: lamports / 1e9, tokens }
}

/** A wallet address: valid base58 public key that sits on the ed25519 curve (not a program-derived address). */
export function isWalletAddress(s: string) {
  try {
    const k = new PublicKey(s.trim())
    return PublicKey.isOnCurve(k.toBytes())
  } catch {
    return false
  }
}
