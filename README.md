# Nerogate

Monero in. Real-world assets out. The private on-ramp from XMR to tokenized stocks, ETFs and gold on Ethereum.

- Website: `/` (landing page) and `/guides/:slug`
- App: `/app` (swap, orders, portfolio, assets, route status)

Live at https://nerogate.org

## How a swap works

1. **XMR → ETH** through Exolix, paid out to the user's Ethereum address.
2. **ETH → asset** through KyberSwap, signed once from the user's wallet (Reown AppKit, Ethereum mainnet).

Every route is compared against the CoinGecko market price. The app warns when a route returns 3% or more below market and blocks it at 15% or more, because xStock liquidity on Ethereum is thin for some assets.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5173
```

## Environment variables

| Variable | Required | What it is |
|---|---|---|
| `VITE_REOWN_PROJECT_ID` | Yes | Reown (WalletConnect) project id for the wallet connect modal. Create a project at https://dashboard.reown.com and add `nerogate.org` (and `localhost` for development) to its allowed domains. Without it the app runs but wallets cannot connect. |
| `VITE_ETH_RPC` | Recommended | An Ethereum mainnet RPC URL from Alchemy, Infura, QuickNode or similar. Left empty, the app uses the free public RPC (`ethereum-rpc.publicnode.com`), which rate-limits busy traffic. |

Both are read at build time (`VITE_` prefix), so set them before building and redeploy after changing them.

## Deploy to Vercel

1. Import the GitHub repository in Vercel. The framework is detected as Vite; `vercel.json` sets the build command, the `dist` output and the single-page-app rewrite.
2. In **Settings → Environment Variables**, add `VITE_REOWN_PROJECT_ID` and `VITE_ETH_RPC` for Production (and Preview if you use preview URLs).
3. In **Settings → Domains**, add `nerogate.org` (and `www.nerogate.org` redirecting to it), then set the DNS records Vercel shows at your registrar.
4. Deploy. After the first deploy, check that `https://nerogate.org/app/assets` and `https://nerogate.org/guides/what-is-an-erc20-token` load directly.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
| `node scripts/build-logo.mjs` | Rebuild the logo files, favicon and 500px PNG exports |
| `node scripts/build-social.mjs` | Rebuild the share image (`og-image.png`) and app icons |

## Where things live

- `src/data/site.ts`: all landing page copy; `src/data/guides.ts`: guide articles
- `src/app/`: the dashboard (`lib/api.ts` has the Exolix, KyberSwap, CoinGecko and THORChain clients; `lib/assets.ts` has the verified Ethereum contracts; `wallet.ts` sets up Reown AppKit)
- `src/assets/logos`, `src/assets/tokens`: official brand and token SVGs, with their sources in `SOURCES.md`
