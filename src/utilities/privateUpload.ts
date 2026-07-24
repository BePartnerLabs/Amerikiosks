import { randomUUID } from 'node:crypto'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Separate, non-public R2 bucket for files whose durable owner is our own
// database, not a public/CDN URL like the `media` collection's bucket —
// e.g. a customer-submitted claim photo. The object's key is stored on the
// owning record (e.g. Claims.photoKey); a presigned URL is minted on demand
// each time someone with access needs to view it, and expires shortly after.
// The bucket itself has no public access configured in Cloudflare, so a
// presigned URL is the only way to ever reach an object in it.
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'auto',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
})

const PRESIGNED_URL_TTL_SECONDS = 15 * 60

function requireBucket(): string {
  const bucket = process.env.S3_PRIVATE_NAME
  if (!bucket) {
    throw new Error('S3_PRIVATE_NAME is not configured')
  }
  return bucket
}

/**
 * Uploads a file to the private R2 bucket under a random (non-guessable) key
 * and returns that key — the durable reference to store on the owning
 * record. Does not return a URL: the object has no public access, so a URL
 * is only ever minted on demand via getPresignedUrlForKey.
 */
export async function uploadPrivateFile(
  buffer: Buffer,
  contentType: string,
  originalFilename: string,
): Promise<string> {
  const bucket = requireBucket()

  const extension = originalFilename.includes('.') ? originalFilename.split('.').pop() : undefined
  const key = extension ? `${randomUUID()}.${extension}` : randomUUID()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )

  return key
}

/**
 * Mints a short-lived (15-minute) presigned GET URL for a key previously
 * returned by uploadPrivateFile. Call this only from an already
 * access-controlled context (e.g. an authenticated admin-only endpoint) —
 * anyone holding the URL can fetch the object until it expires.
 */
export async function getPresignedUrlForKey(key: string): Promise<string> {
  const bucket = requireBucket()

  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  })
}
