'use client'

/**
 * CanvasStyleRegistry — Emotion SSR registry for the Next.js App Router.
 *
 * Canvas Kit Styling injects styles at module-import time into its OWN Emotion
 * instance (the cache returned by `getCache()`). To flush those rules into the
 * streamed document during SSR — and avoid FOUC — we register that SAME cache
 * with `useServerInsertedHTML`. Do not create a second, unrelated cache.
 *
 * This wrapper is mounted once in app/layout.tsx around the entire tree. It is a
 * no-op visually; it only collects + serializes Canvas Kit's styles. The marketing
 * site itself is styled with CSS Modules + `--cm-*` tokens, so in practice the only
 * styles flowing through here come from the live Canvas Kit demo
 * (components/canvas/canvas-live.tsx).
 */

import * as React from 'react'
import { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { getCache } from '@workday/canvas-kit-styling'

export default function CanvasStyleRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  // Lazy init so it only runs once. getCache() returns Canvas Kit's shared
  // Emotion instance/cache — the same one CanvasProvider + createStyles use.
  const [{ cache }] = useState(() => {
    const cache = getCache()
    cache.compat = true // required: collect rules into cache.inserted for flushing
    const prevInsert = cache.insert.bind(cache)
    const inserted: string[] = []
    // Track names inserted during this render so we know what to flush.
    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const { extractCriticalToChunks } = createEmotionServer(cache)
    ;(cache as unknown as { __inserted: string[] }).__inserted = inserted
    return { cache, extractCriticalToChunks }
  })

  useServerInsertedHTML(() => {
    const ref = cache as unknown as { __inserted: string[] }
    const names = ref.__inserted
    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }
    ref.__inserted = []
    if (styles === '') return null
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
