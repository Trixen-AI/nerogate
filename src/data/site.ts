// All page copy for Nerogate lives here, in page order.

export const X_URL = 'https://x.com/Nerogate_'

export const BRAND = {
  name: 'Nerogate',
  ticker: '$NERO',
  // Shortened contract as given in the concept. Replace with the full mint address when it is final.
  contractShort: 'FwKV…pump',
  contractUrl: 'https://pump.fun',
}

export const NAV = [
  { label: 'Assets', href: '/#assets' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Route', href: '/#route' },
  { label: '$NERO', href: '/#token' },
]

export const HERO = {
  title: ['Monero in.', 'Real-world assets out.'],
  subtitle:
    'The private on-ramp to tokenized stocks, ETFs and gold on Ethereum. Pay with XMR from any wallet, hold it yourself.',
  primary: { label: 'Get a quote', href: '/app' },
  secondary: { label: 'How it works', href: '#how-it-works' },
  anchors: [
    { label: 'Pick an asset', href: '#assets' },
    { label: 'Follow the route', href: '#route' },
    { label: 'The $NERO token', href: '#token' },
  ],
}

export const STATS = [
  { label: 'Assets you can buy', value: '18' },
  { label: 'Typical settlement', value: '10–30 min' },
  { label: 'Network', value: 'Ethereum' },
  { label: 'Accounts to open', value: '0' },
]

export const PROMISE = {
  eyebrow: 'The short version',
  title: 'Nothing to sign up for',
  subtitle: 'No account and no wallet to connect. Just XMR in.',
  cta: { label: 'See how a swap runs', href: '#how-it-works' },
  cards: [
    {
      title: 'Get a quote first',
      body: 'Choose an asset and an XMR amount. Both legs are priced before you send anything.',
      href: '/app',
      art: 'quote',
    },
    {
      title: 'Bring any address',
      body: 'Paste an Ethereum address or connect a wallet. It is the only detail the swap provider sees.',
      href: '#how-it-works',
      art: 'address',
    },
  ],
} as const

export const ROUTE = {
  id: 'route',
  title: 'Two legs, one route',
  subtitle: 'Each swap runs through a venue built for its half of the trip.',
  legs: [
    {
      title: 'XMR → ETH',
      body: 'An instant-exchange leg turns your Monero into ETH at your address.',
      href: '#how-it-works',
    },
    {
      title: 'ETH → the asset you picked',
      body: 'KyberSwap finds the best route on Ethereum, and one transaction completes the buy.',
      href: '#how-it-works',
    },
  ],
}

export const CATEGORIES = {
  id: 'assets',
  title: 'What you can hold',
  link: { label: 'See every asset', href: '/app/assets' },
  items: [
    { title: 'Index ETFs', body: 'Follow the S&P 500 and the Nasdaq 100 with SPYx and QQQx.', art: 'index' },
    { title: 'Gold', body: 'Keep gold exposure as an ERC-20 token with GLDx.', art: 'gold' },
    { title: 'Stocks', body: 'Thirteen large caps, from NVDAx and TSLAx to BRK.Bx.', art: 'stocks' },
    { title: 'USD Coin', body: 'Take USDC when all you want is dollars on Ethereum.', art: 'usdc' },
    { title: 'Native ETH', body: 'Stop after the first leg and keep plain ETH.', art: 'eth' },
    { title: 'Your own keys', body: 'Every asset settles to an address only you can sign for.', art: 'keys' },
  ],
} as const

export const SELF_CUSTODY = {
  title: 'Hold it yourself',
  subtitle: 'Nothing stays with us once a swap settles',
  body: 'When ETH arrives, one transaction turns it into the asset you chose. After that it is an ordinary ERC-20 token in your wallet, ready to move, sell or keep.',
  primary: { label: 'Get a quote', href: '/app' },
  secondary: { label: 'Read the route', href: '#route' },
}

export const ROUTED_THROUGH = 'Routed through'

// key = file in src/assets/logos (official SVGs, sources in src/assets/logos/SOURCES.md)
// file = official SVG in src/assets/logos (sources in src/assets/logos/SOURCES.md). The band is dark because
// several brands only publish a white logo; light-background files are not used here.
export const PARTNER_LOGOS = [
  { file: 'monero-mark', label: 'Monero' },
  { file: 'ethereum-mark', label: 'Ethereum' },
  { file: 'kyberswap-white', label: 'KyberSwap' },
  { file: 'exolix', label: 'Exolix' },
  { file: 'xstocks', label: 'xStocks' },
  { file: 'backed', label: 'Backed' },
  { file: 'thorchain-white', label: 'THORChain' },
  { file: 'cloudflare', label: 'Cloudflare' },
  { file: 'usdc-inverse', label: 'USDC' },
]

export const POPULAR = {
  id: 'popular',
  title: 'Picked most often',
  link: { label: 'Full asset list', href: '/app/assets' },
  items: [
    { ticker: 'SPYx', name: 'S&P 500', body: 'Five hundred US companies in a single token.' },
    { ticker: 'QQQx', name: 'Nasdaq 100', body: 'The hundred largest non-financial Nasdaq names.' },
    { ticker: 'GLDx', name: 'Gold', body: 'Tracks the price of gold, settled on Ethereum.' },
    { ticker: 'NVDAx', name: 'NVIDIA', body: 'Tokenized NVIDIA shares, bought with XMR.' },
    { ticker: 'TSLAx', name: 'Tesla', body: 'Tokenized Tesla shares in your own wallet.' },
    { ticker: 'AAPLx', name: 'Apple', body: 'Tokenized Apple shares, one signature away.' },
  ],
}

export const PRIVACY = {
  title: 'What stays private',
  link: { label: 'Read the full flow', href: '#how-it-works' },
  items: [
    { title: 'No account', body: 'There is nothing to sign up for. A quote and a deposit address are all you need.', art: 'noaccount' },
    { title: 'One-time deposit address', body: 'Every swap gets a fresh Monero address that is used once.', art: 'onetime' },
    { title: 'Only your destination', body: 'The swap provider sees your Ethereum address and nothing else from us.', art: 'destination' },
    { title: 'A way back', body: 'Add a Monero refund address and your XMR returns there if a swap fails.', art: 'refund' },
  ],
} as const

export const HOW = {
  id: 'how-it-works',
  title: 'How it works',
  subtitle: 'Quote, pay, settle',
  body: 'Price both legs, send the exact XMR amount to a one-time address, then sign once when ETH arrives.',
  primary: { label: 'Get a quote', href: '/app' },
  secondary: { label: 'Route details', href: '#route' },
  steps: [
    {
      eyebrow: 'Step 01 · Quote',
      title: 'Pick an asset and an XMR amount',
      body: 'We price the XMR to ETH leg and the ETH to asset leg on KyberSwap, so you see what you receive before you pay.',
    },
    {
      eyebrow: 'Step 02 · Pay and settle',
      title: 'Send XMR, then sign once',
      body: 'Pay the exact amount to a one-time deposit address. ETH lands in your wallet in 10 to 30 minutes and one transaction buys the asset.',
    },
  ],
  extras: [
    { title: 'Join the $NERO holders', body: 'Follow Nerogate on X for $NERO news and updates.', href: X_URL, art: 'community', external: true },
    { title: 'Read the risk notes', body: 'Custody, jurisdiction and route details in plain words.', href: '#risk', art: 'notes', external: false },
  ],
} as const

export const QUOTE = {
  id: 'quote',
  title: 'Your deposit address is a minute away',
  subtitle: 'Pick an asset, enter an amount, paste where it should land',
  body: 'Quotes refresh live. Nothing is reserved until you ask for a deposit address, and you can add a refund address in case the swap fails.',
  link: { label: 'Open the app', href: '/app' },
  // Worked example from the product concept (0.5 XMR into SPYx). Shown as an illustration, not a live price.
  // Worked example at live Ethereum rates (0.5 XMR into NVDAx). Shown as an illustration, not a live price.
  example: {
    pay: '0.5',
    payUnit: 'XMR',
    want: 'NVDAx',
    wantName: 'NVIDIA',
    route: 'XMR → ETH (exolix) → NVDAx (KyberSwap)',
    rows: [
      { label: 'ETH after bridge', value: '0.10596 ETH' },
      { label: 'Kept for gas', value: '0.0005 ETH' },
      { label: 'You receive ≈', value: '1.12 NVDAx' },
      { label: 'Value', value: '$258.30 · 2.0% below market' },
      { label: 'ETA', value: '10–30 min' },
    ],
    cta: 'Get deposit address',
  },
}

export const MORE = {
  title: 'Also on the menu',
  link: { label: 'All 18 assets', href: '/app/assets' },
  items: [
    { tag: 'Stablecoin', title: 'USDC', body: 'USD Coin on Ethereum, for when you want dollars and nothing else.', art: 'usdc' },
    { tag: 'Native', title: 'ETH', body: 'Plain Ether. Skip the second leg and keep it as it lands.', art: 'eth' },
  ],
} as const

export const WHY = {
  id: 'token',
  title: 'Why route through Nerogate?',
  subtitle: ['Private on the way in.', 'Yours on the way out.'],
  body: 'Pay from any Monero wallet, settle to an address only you control, and see every leg of the route before you send a single piconero.',
  primary: { label: 'Get a quote', href: '/app' },
  secondary: { label: `Buy ${'$NERO'}`, href: 'https://pump.fun' },
  cards: [
    { title: 'Any Monero wallet', body: 'Desktop, mobile or hardware. If it can send XMR, it works.', art: 'wallet' },
    { title: 'Routed by KyberSwap', body: 'The Ethereum leg uses the best route KyberSwap finds, checked against the market price.', art: 'aggregator' },
    { title: 'Ready for THORChain', body: 'A non-custodial path switches on once the XMR pool is live.', art: 'thor' },
    { title: 'Runs on the edge', body: 'Built on Cloudflare Workers and D1, close to every user.', art: 'edge' },
  ],
  custody: {
    title: 'Custody, stated plainly',
    body: 'The XMR to ETH leg currently uses an instant-exchange provider that holds funds while the swap runs.',
    links: [
      { label: 'About the THORChain switch', href: '#risk' },
      { label: 'About xStocks', href: '#risk' },
    ],
  },
} as const

export const GUIDES = {
  id: 'risk',
  title: 'Guides and notes',
}

export const START = {
  title: 'Before your first swap',
  subtitle: 'Three things to have ready',
  items: [
    { title: 'An Ethereum address', art: 'eth-address' },
    { title: 'XMR in any wallet', art: 'xmr-wallet' },
    { title: 'A refund address (optional)', art: 'refund-address' },
  ],
} as const

export const FOOTER = {
  columns: [
    {
      title: 'Assets',
      links: [
        { label: 'Index ETFs', href: '/#assets' },
        { label: 'Gold', href: '/#assets' },
        { label: 'Stocks', href: '/#popular' },
        { label: 'USD Coin', href: '/#assets' },
        { label: 'Native ETH', href: '/#assets' },
      ],
    },
    {
      title: 'How it works',
      links: [
        { label: 'Quote', href: '/#how-it-works' },
        { label: 'Pay', href: '/#how-it-works' },
        { label: 'Settle', href: '/#how-it-works' },
        { label: 'Route', href: '/#route' },
      ],
    },
    {
      title: 'Token',
      links: [
        { label: '$NERO', href: '/#token' },
        { label: 'Contract', href: 'https://pump.fun' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Guides', href: '/#risk' },
        { label: 'Risk notes', href: '/#risk' },
        { label: 'Open the app', href: '/app' },
      ],
    },
  ],
  legal: [
    { label: 'Terms', href: '/#' },
    { label: 'Privacy', href: '/#' },
    { label: 'Risk disclosure', href: '/#risk' },
  ],
}

// Social links: X only.
export const SOCIALS = [{ icon: 'x-white', label: 'Nerogate on X', href: X_URL }] as const
