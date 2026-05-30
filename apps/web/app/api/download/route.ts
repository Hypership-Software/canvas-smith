import { NextRequest } from 'next/server'
import archiver from 'archiver'
import path from 'node:path'
import { PassThrough } from 'node:stream'

// MUST run on Node (archiver + fs are not Edge-compatible).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ZIP-download fallback for users who can't (or won't) add the marketplace.
 * Streams `packages/canvasmith/.claude` as a ZIP so it extracts as `./.claude/...`
 * into a project root (or `~/`) — mirroring the impeccable `cp -r .claude` UX.
 *
 * Security (impeccable pattern): validate the provider against a strict allowlist
 * BEFORE touching the filesystem, and sanitize the Content-Disposition filename.
 */

// Allowlist of bundles we are willing to serve.
const BUNDLES = {
  'claude-code': {
    // resolve from monorepo root → packages/canvasmith/.claude
    dir: path.join(process.cwd(), '..', '..', 'packages', 'canvasmith', '.claude'),
    // path INSIDE the zip so it extracts as ./.claude/...
    zipRoot: '.claude',
  },
} as const

type BundleKey = keyof typeof BUNDLES

export async function GET(req: NextRequest) {
  const provider = (req.nextUrl.searchParams.get('provider') ?? 'claude-code') as BundleKey

  // 1. Strict allowlist (impeccable: ALLOWED_PROVIDERS.includes(provider)).
  if (!(provider in BUNDLES)) {
    return Response.json({ error: 'Invalid provider' }, { status: 400 })
  }
  const { dir, zipRoot } = BUNDLES[provider]

  // 2. Sanitize the filename exactly like impeccable.
  const safe = provider.replace(/[^a-zA-Z0-9._-]/g, '')

  // 3. Stream the zip.
  const archive = archiver('zip', { zlib: { level: 9 } })
  const pass = new PassThrough()
  archive.on('error', (err) => pass.destroy(err))
  archive.pipe(pass)
  archive.directory(dir, zipRoot) // packages/canvasmith/.claude → .claude/ in the zip
  archive.finalize()

  // Node stream → Web ReadableStream for the Next Response.
  const body = new ReadableStream({
    start(controller) {
      pass.on('data', (c) => controller.enqueue(c))
      pass.on('end', () => controller.close())
      pass.on('error', (e) => controller.error(e))
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="canvasmith-${safe}.zip"`,
      // impeccable's exact cache policy
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
