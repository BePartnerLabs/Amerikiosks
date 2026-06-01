import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'

export const uploadMedia = async (
  payload: Payload,
  req: PayloadRequest,
  filePath: string,
  alt: string,
): Promise<Media> => {
  const data = fs.readFileSync(filePath)
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

  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name, size: data.length },
    req,
  }) as Promise<Media>
}
