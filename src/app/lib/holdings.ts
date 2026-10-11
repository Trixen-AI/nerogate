import { erc20Abi, formatUnits, isAddress } from 'viem'
import { TOKENS } from './assets'
import { publicClient } from './chain'

export type Holdings = { eth: number; tokens: Record<string, number> }

/** ETH balance plus the balance of every supported token at an address (one multicall). */
export async function fetchHoldings(owner: `0x${string}`): Promise<Holdings> {
  const [wei, results] = await Promise.all([
    publicClient.getBalance({ address: owner }),
    publicClient.multicall({
      allowFailure: true,
      contracts: TOKENS.map((t) => ({ address: t.address, abi: erc20Abi, functionName: 'balanceOf' as const, args: [owner] as const })),
    }),
  ])
  const tokens: Record<string, number> = {}
  results.forEach((r, i) => {
    if (r.status === 'success' && r.result > 0n) tokens[TOKENS[i].symbol] = Number(formatUnits(r.result, TOKENS[i].decimals))
  })
  return { eth: Number(formatUnits(wei, 18)), tokens }
}

/** A valid Ethereum address (checksum enforced when mixed case). */
export const isWalletAddress = (s: string) => isAddress(s.trim())
