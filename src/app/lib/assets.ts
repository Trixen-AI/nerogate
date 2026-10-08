// Assets you can receive. Mints are the verified Solana mints (resolved through Jupiter's token list).
// xStocks are Token-2022 tokens with 8 decimals, issued by Backed.

export type AssetCategory = 'Index ETFs' | 'Commodities' | 'Stocks' | 'Stablecoin' | 'Native'

export type Asset = {
  symbol: string
  name: string
  mint: string
  decimals: number
  category: AssetCategory
  issuer?: string
}

export const SOL_MINT = 'So11111111111111111111111111111111111111112'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
export const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

const x = (symbol: string, name: string, mint: string, category: AssetCategory): Asset => ({
  symbol,
  name,
  mint,
  decimals: 8,
  category,
  issuer: 'Backed',
})

export const ASSETS: Asset[] = [
  x('SPYx', 'S&P 500', 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', 'Index ETFs'),
  x('QQQx', 'Nasdaq 100', 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', 'Index ETFs'),
  x('GLDx', 'Gold', 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', 'Commodities'),
  x('NVDAx', 'NVIDIA', 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh', 'Stocks'),
  x('TSLAx', 'Tesla', 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', 'Stocks'),
  x('AAPLx', 'Apple', 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', 'Stocks'),
  x('MSFTx', 'Microsoft', 'XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX', 'Stocks'),
  x('GOOGLx', 'Alphabet', 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN', 'Stocks'),
  x('AMZNx', 'Amazon', 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg', 'Stocks'),
  x('METAx', 'Meta', 'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu', 'Stocks'),
  x('MSTRx', 'Strategy', 'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ', 'Stocks'),
  x('COINx', 'Coinbase', 'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu', 'Stocks'),
  x('CRCLx', 'Circle', 'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1', 'Stocks'),
  x('PLTRx', 'Palantir', 'XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4', 'Stocks'),
  x('HOODx', 'Robinhood', 'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg', 'Stocks'),
  x('BRK.Bx', 'Berkshire Hathaway', 'Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x', 'Stocks'),
  { symbol: 'USDC', name: 'USD Coin', mint: USDC_MINT, decimals: 6, category: 'Stablecoin', issuer: 'Circle' },
  { symbol: 'SOL', name: 'Solana', mint: SOL_MINT, decimals: 9, category: 'Native' },
]

export const CATEGORIES: AssetCategory[] = ['Index ETFs', 'Commodities', 'Stocks', 'Stablecoin', 'Native']

const bySymbol = new Map(ASSETS.map((a) => [a.symbol.toLowerCase(), a]))
const byMint = new Map(ASSETS.map((a) => [a.mint, a]))

export const assetBySymbol = (s: string | null | undefined) => (s ? bySymbol.get(s.toLowerCase()) : undefined)
export const assetByMint = (m: string) => byMint.get(m)
export const ALL_MINTS = ASSETS.map((a) => a.mint)
