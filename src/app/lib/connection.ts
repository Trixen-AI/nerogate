import { Connection } from '@solana/web3.js'
import { RPC_URL } from './api'

/** One shared read connection for balances, confirmations and status checks. */
export const connection = new Connection(RPC_URL, 'confirmed')
