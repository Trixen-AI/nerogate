// Assets you can receive on Ethereum mainnet. Every contract was checked on-chain (symbol() and decimals()).
// xStocks are ERC-20 tokens with 18 decimals, issued by Backed. Prices come from CoinGecko by `cgId`.

export type AssetCategory = 'Index ETFs' | 'Commodities' | 'Stocks' | 'Stablecoin' | 'Native'

export type Asset = {
  symbol: string
  name: string
  /** ERC-20 contract, or NATIVE for ETH. */
  address: `0x${string}`
  decimals: number
  category: AssetCategory
  issuer?: string
  cgId: string
}

/** The address aggregators use for native ETH. */
export const NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const

const x = (symbol: string, name: string, address: `0x${string}`, category: AssetCategory, cgId: string): Asset => ({
  symbol,
  name,
  address,
  decimals: 18,
  category,
  issuer: 'Backed',
  cgId,
})

export const ASSETS: Asset[] = [
  x('SPYx', 'S&P 500', '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', 'Index ETFs', 'sp500-xstock'),
  x('QQQx', 'Nasdaq 100', '0xa753a7395cae905cd615da0b82a53e0560f250af', 'Index ETFs', 'nasdaq-xstock'),
  x('GLDx', 'Gold', '0x2380f2673c640fb67e2d6b55b44c62f0e0e69da9', 'Commodities', 'gold-xstock'),
  x('NVDAx', 'NVIDIA', '0xc845b2894dbddd03858fd2d643b4ef725fe0849d', 'Stocks', 'nvidia-xstock'),
  x('TSLAx', 'Tesla', '0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0', 'Stocks', 'tesla-xstock'),
  x('AAPLx', 'Apple', '0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a', 'Stocks', 'apple-xstock'),
  x('MSFTx', 'Microsoft', '0x5621737f42dae558b81269fcb9e9e70c19aa6b35', 'Stocks', 'microsoft-xstock'),
  x('GOOGLx', 'Alphabet', '0xe92f673ca36c5e2efd2de7628f815f84807e803f', 'Stocks', 'alphabet-xstock'),
  x('AMZNx', 'Amazon', '0x3557ba345b01efa20a1bddc61f573bfd87195081', 'Stocks', 'amazon-xstock'),
  x('METAx', 'Meta', '0x96702be57cd9777f835117a809c7124fe4ec989a', 'Stocks', 'meta-xstock'),
  x('MSTRx', 'Strategy', '0xae2f842ef90c0d5213259ab82639d5bbf649b08e', 'Stocks', 'microstrategy-xstock'),
  x('COINx', 'Coinbase', '0x364f210f430ec2448fc68a49203040f6124096f0', 'Stocks', 'coinbase-xstock'),
  x('CRCLx', 'Circle', '0xfebded1b0986a8ee107f5ab1a1c5a813491deceb', 'Stocks', 'circle-xstock'),
  x('PLTRx', 'Palantir', '0x6d482cec5f9dd1f05ccee9fd3ff79b246170f8e2', 'Stocks', 'palantir-xstock'),
  x('HOODx', 'Robinhood', '0xe1385fdd5ffb10081cd52c56584f25efa9084015', 'Stocks', 'robinhood-xstock'),
  x('BRK.Bx', 'Berkshire Hathaway', '0x12992613fdd35abe95dec5a4964331b1ee23b50d', 'Stocks', 'berkshire-hathaway-xstock'),
  { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESS, decimals: 6, category: 'Stablecoin', issuer: 'Circle', cgId: 'usd-coin' },
  { symbol: 'ETH', name: 'Ether', address: NATIVE, decimals: 18, category: 'Native', cgId: 'ethereum' },
]

export const CATEGORIES: AssetCategory[] = ['Index ETFs', 'Commodities', 'Stocks', 'Stablecoin', 'Native']

const bySymbol = new Map(ASSETS.map((a) => [a.symbol.toLowerCase(), a]))

export const assetBySymbol = (s: string | null | undefined) => (s ? bySymbol.get(s.toLowerCase()) : undefined)
export const isNative = (a: Asset) => a.address === NATIVE
export const TOKENS = ASSETS.filter((a) => !isNative(a))
export const ETH_ASSET = ASSETS.find(isNative)!
