import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Canvas Kit ships modern ESM that benefits from being transpiled by Next.
  transpilePackages: [
    '@workday/canvas-kit-react',
    '@workday/canvas-kit-styling',
    '@workday/canvas-kit-preview-react',
  ],
  // Emotion's `css` prop support during compilation.
  compiler: {
    emotion: true,
  },
  // Permissive CORS for the hosted shadcn registry JSON (apps/web/public/r/*.json
  // served at /r/<name>.json). Lets `npx shadcn add https://canvasmith.dev/r/...`
  // and browser-based tools (v0, the docs preview) fetch items cross-origin.
  async headers() {
    return [
      {
        source: '/r/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

export default nextConfig
