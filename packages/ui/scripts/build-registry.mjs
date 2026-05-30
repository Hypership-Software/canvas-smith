#!/usr/bin/env node
// Canvasmith registry builder.
//
// Self-contained Node ESM script (no dependencies). It:
//   1. Reads ../registry.json (the registry root, relative to this file).
//   2. For each item, reads every files[].path from disk and inlines it as
//      files[].content.
//   3. Attaches the registry-item $schema and writes the item to
//      <repo>/apps/web/public/r/<name>.json.
//   4. Writes a discovery index at <repo>/apps/web/public/r/registry.json
//      listing { name, type, title, description } for every item.
//
// All paths resolve relative to this script's own location so it can be run
// from any working directory.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

// packages/ui (registry source root) and the web app's public/r output dir.
const PACKAGE_ROOT = resolve(__dirname, '..')
const REGISTRY_PATH = join(PACKAGE_ROOT, 'registry.json')
const OUTPUT_DIR = resolve(PACKAGE_ROOT, '..', '..', 'apps', 'web', 'public', 'r')

async function readJson(path) {
  const raw = await readFile(path, 'utf8')
  return JSON.parse(raw)
}

async function buildItem(item) {
  if (!Array.isArray(item.files)) {
    return { ...item, $schema: ITEM_SCHEMA }
  }

  const files = []
  for (const file of item.files) {
    const sourcePath = resolve(PACKAGE_ROOT, file.path)
    let content
    try {
      content = await readFile(sourcePath, 'utf8')
    } catch (err) {
      throw new Error(
        `Item "${item.name}": failed to read file "${file.path}" ` +
          `(resolved ${sourcePath}): ${err.message}`,
      )
    }
    // Preserve declared order of fields, inline content.
    files.push({ ...file, content })
  }

  // $schema first for readability in the emitted JSON.
  return { $schema: ITEM_SCHEMA, ...item, files }
}

async function main() {
  const registry = await readJson(REGISTRY_PATH)
  const items = Array.isArray(registry.items) ? registry.items : []

  if (items.length === 0) {
    console.warn('[canvasmith] registry.json has no items[] — nothing to build.')
  }

  await mkdir(OUTPUT_DIR, { recursive: true })

  const index = []
  let written = 0

  for (const item of items) {
    const built = await buildItem(item)
    const outPath = join(OUTPUT_DIR, `${item.name}.json`)
    await writeFile(outPath, JSON.stringify(built, null, 2) + '\n', 'utf8')
    written += 1
    index.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
    })
    const fileCount = Array.isArray(item.files) ? item.files.length : 0
    console.log(
      `[canvasmith] wrote r/${item.name}.json ` +
        `(${item.type}, ${fileCount} file${fileCount === 1 ? '' : 's'})`,
    )
  }

  // Discovery index — lists every item for tooling / browse UIs.
  const indexDoc = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: registry.name,
    homepage: registry.homepage,
    items: index,
  }
  const indexPath = join(OUTPUT_DIR, 'registry.json')
  await writeFile(indexPath, JSON.stringify(indexDoc, null, 2) + '\n', 'utf8')
  console.log(`[canvasmith] wrote r/registry.json (index of ${index.length} items)`)

  console.log(
    `[canvasmith] done — ${written} item file(s) + index emitted to ${OUTPUT_DIR}`,
  )
}

main().catch((err) => {
  console.error(`[canvasmith] build failed: ${err.message}`)
  process.exitCode = 1
})
