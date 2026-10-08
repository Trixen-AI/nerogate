// Guide articles, readable at /guides/<slug>.

export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string }

export type Guide = {
  slug: string
  tags: readonly string[]
  title: string
  meta: string
  art: 'refund' | 'spl' | 'clock'
  summary: string
  body: GuideBlock[]
}

export const GUIDE_LIST: Guide[] = [
  {
    slug: 'monero-refund-address',
    tags: ['Guide'],
    title: 'Where to find a Monero refund address',
    meta: '4 min read',
    art: 'refund',
    summary: 'If a swap cannot complete, your XMR has to go somewhere. A refund address tells us where.',
    body: [
      {
        type: 'p',
        text: 'The refund field on the quote form is optional. You only need it for one case: the XMR to SOL leg fails, for example because the rate moved too far or the amount you sent does not match the quote. When that happens, the XMR is sent back to the address you gave. Without one, there is no address the provider can return it to automatically.',
      },
      { type: 'h2', text: 'What a Monero address looks like' },
      {
        type: 'list',
        items: [
          'A main address starts with 4 and is 95 characters long.',
          'A subaddress starts with 8 and is also 95 characters long. Most wallets create a new one each time you press Receive.',
          'Both work as a refund address. The quote form shows "4… or 8…" as a hint for this reason.',
        ],
      },
      { type: 'h2', text: 'Finding it in your wallet' },
      {
        type: 'p',
        text: 'Every Monero wallet has a Receive screen. Open it, copy the address shown there and paste it into the refund field. Desktop wallets usually show it on a Receive tab; mobile wallets show it behind a Receive button on the home screen, often with a QR code next to it.',
      },
      {
        type: 'p',
        text: 'Copy and paste the address rather than typing it. Check the first and last few characters after pasting, because some clipboard malware swaps addresses silently.',
      },
      { type: 'h2', text: 'Use a wallet you control' },
      {
        type: 'p',
        text: 'Avoid an exchange deposit address as your refund address. Exchanges may not credit deposits they did not expect, and some require extra details that a refund cannot include. A wallet where you hold the seed is the safe choice.',
      },
      {
        type: 'note',
        text: 'The refund address is only used if the swap fails. A successful swap never sends anything to it.',
      },
    ],
  },
  {
    slug: 'what-is-an-spl-token',
    tags: ['Guide', 'Solana'],
    title: 'What an SPL token is, and why it matters here',
    meta: '5 min read',
    art: 'spl',
    summary: 'Everything you can receive through Nerogate lands as an SPL token. Here is what that means for you.',
    body: [
      {
        type: 'p',
        text: 'SPL is the token standard on Solana. USDC, the xStocks such as SPYx or NVDAx, and most other assets on the network follow it, some through Token Extensions, the newer version of the same standard. Following one standard is what lets any Solana wallet show, send and swap them the same way.',
      },
      { type: 'h2', text: 'Where your tokens actually live' },
      {
        type: 'p',
        text: 'Your Solana address does not hold tokens directly. Each token you own sits in a small token account linked to your address. Wallets create and hide these accounts for you, so you normally just see a balance next to the token name.',
      },
      {
        type: 'p',
        text: 'Creating a token account costs a small refundable deposit in SOL. This is one reason a quote keeps 0.01 SOL back for fees: it covers the account deposit and the network fee for the Jupiter swap, so you can sign without topping up first.',
      },
      { type: 'h2', text: 'What this means for you' },
      {
        type: 'list',
        items: [
          'The asset is in your own wallet. You can move it, sell it on any Solana exchange or simply hold it.',
          'You need a wallet that supports Solana tokens. All the widely used Solana wallets do.',
          'Sending a token to an address on another chain loses it. Keep it on Solana unless you use a bridge that supports it.',
        ],
      },
      { type: 'h2', text: 'A token is not the same as a share' },
      {
        type: 'p',
        text: 'xStocks are tokenized securities issued by Backed. They track the price of the underlying stock or fund, but the rights they carry are set by the issuer, not by the company whose name is on the ticker. Read the issuer terms, and check whether you are allowed to hold them where you live.',
      },
      {
        type: 'note',
        text: 'Nerogate is not affiliated with Backed, xStocks or any issuer. We route the purchase; the issuer defines the token.',
      },
    ],
  },
  {
    slug: 'why-settlement-takes-time',
    tags: ['Note'],
    title: 'Why settlement takes 10 to 30 minutes',
    meta: '3 min read',
    art: 'clock',
    summary: 'Most of the wait happens on the Monero side, before any SOL moves. Here is where the minutes go.',
    body: [
      {
        type: 'p',
        text: 'A Nerogate swap has two legs. The Solana leg is fast: once SOL is in your wallet, the Jupiter swap settles within seconds of your signature. Nearly all of the 10 to 30 minutes is spent on the first leg, getting from XMR to SOL.',
      },
      { type: 'h2', text: 'Monero confirmations' },
      {
        type: 'p',
        text: 'Monero produces a block roughly every two minutes, and newly received XMR cannot be spent again until about ten blocks have passed. The instant-exchange provider waits for your deposit to confirm before it releases SOL. Ten blocks at two minutes each is already around twenty minutes.',
      },
      { type: 'h2', text: 'What makes it faster or slower' },
      {
        type: 'list',
        items: [
          'Sending the exact amount from the quote. A different amount can need a manual check.',
          'Network load on Monero. Busy periods can stretch block times a little.',
          'Larger amounts, which providers sometimes check more carefully.',
        ],
      },
      { type: 'h2', text: 'What you see while you wait' },
      {
        type: 'p',
        text: 'After you send XMR to the one-time deposit address, there is nothing else to do until SOL lands at your Solana address. Then one signature buys the asset through Jupiter.',
      },
      {
        type: 'note',
        text: 'For now, the XMR to SOL leg runs through an instant-exchange provider that holds funds while the swap runs. A non-custodial THORChain route switches on automatically once the XMR pool is live on mainnet.',
      },
    ],
  },
]

export const guideBySlug = (slug: string | undefined) => GUIDE_LIST.find((g) => g.slug === slug)
