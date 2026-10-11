import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { RPC_URL } from './api'

/** One shared read client (Ethereum mainnet) for balances, receipts, gas and status checks. */
export const publicClient = createPublicClient({ chain: mainnet, transport: http(RPC_URL), batch: { multicall: true } })

/** Gas a swap needs (KyberSwap reports ~400k for these routes) with a margin for price moves. */
const SWAP_GAS = 500_000n
const MIN_RESERVE_WEI = 500_000_000_000_000n // 0.0005 ETH

/** ETH to keep back for the swap's gas, from the current gas price. */
export async function getGasReserveWei() {
  const gasPrice = await publicClient.getGasPrice()
  const need = (gasPrice * SWAP_GAS * 3n) / 2n
  return need > MIN_RESERVE_WEI ? need : MIN_RESERVE_WEI
}
