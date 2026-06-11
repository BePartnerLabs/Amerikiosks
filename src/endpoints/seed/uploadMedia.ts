import fs from 'node:fs/promises'
import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

// Prefer the local file so seeding works without a running server (Docker,
// one-off scripts); fall back to HTTP for serverless, where public/ is CDN-only.
export const readSeedAsset = async (name: string): Promise<Buffer> => {
  const localPath = path.join(process.cwd(), 'public', 'seed-assets', name)
  try {
    return await fs.readFile(localPath)
  } catch {
    const url = `${getServerSideURL()}/seed-assets/${name}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch seed asset: ${url}`)
    return Buffer.from(await response.arrayBuffer())
  }
}

export const uploadMedia = async (
  payload: Payload,
  req: PayloadRequest,
  filePath: string,
  alt: string,
): Promise<Media> => {
  const name = path.basename(filePath)
  const ext = path.extname(name).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  }
  const mimetype = mimeMap[ext] ?? 'application/octet-stream'

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
    req,
  })
  if (existing.docs.length > 0) return existing.docs[0] as Media

  const data = await readSeedAsset(name)

  try {
    return (await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype, name, size: data.length },
      req,
    })) as Media
  } catch (err: unknown) {
    // Vercel Blob rejects re-uploads when the blob store already has the file
    // (e.g. shared store across envs, or DB was wiped without clearing Blob).
    // Delete all variants then retry.
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.includes('already exists')) throw err

    const { del, list } = await import('@vercel/blob')
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const basename = name.replace(/\.[^.]+$/, '')
    const { blobs } = await list({ prefix: basename, token })
    if (blobs.length > 0) {
      await Promise.all(blobs.map((b) => del(b.url, { token })))
    }

    return (await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype, name, size: data.length },
      req,
    })) as Media
  }
}
