import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

import { redirects } from './redirects'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      // Still needed: without S3 credentials Payload falls back to the
      // staticDir in Media.ts and serves media from /api/media/file/... again.
      // With R2 configured, media is absolute and matched by remotePatterns.
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/claim-form/**',
      },
    ],
    qualities: [100],
    // Media now resolves to S3_PUBLIC_URL, which locally is MinIO on
    // http://localhost:9000. Next 16 refuses to optimize images from a local IP
    // unless this is set, so without it every image 500s in dev. Development
    // only — in production S3_PUBLIC_URL is the R2 custom domain.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
      // S3-compatible storage CDN (Cloudflare R2 in prod, MinIO locally)
      ...(process.env.S3_PUBLIC_URL
        ? (() => {
            const s3Url = process.env.S3_PUBLIC_URL as string
            const u = new URL(s3Url)
            return [
              {
                hostname: u.hostname,
                protocol: u.protocol.replace(':', '') as 'http' | 'https',
                port: u.port || undefined,
              },
            ]
          })()
        : []),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  // sharp loads native platform binaries via dlopen — Next's output-file-tracing
  // can miss those files when it bundles the module itself, causing
  // "Failed to load external module sharp-...: cannot open shared object file"
  // at runtime on Vercel even though the build succeeds. Marking it external
  // keeps it resolved normally from node_modules instead of traced/bundled.
  serverExternalPackages: ['sharp'],
  // Confirmed via Vercel runtime logs: libvips-cpp.so.8.18.3 IS present in
  // node_modules after install, but Next's automatic output-file-tracing
  // misses it because sharp's compiled addon loads it via a low-level
  // dlopen() call, not a static `require()` — tracing only follows the
  // latter. sharp/@img/sharp-linux-x64 itself don't need this override;
  // those ARE `require()`-reachable and already traced correctly (that's
  // why the error only ever named this one specific .so file).
  // Must glob the real file inside node_modules/.pnpm/** directly, not
  // through node_modules/@img/*/lib/* — that path is a symlink into the
  // pnpm store, and Vercel's function packager rejects symlinked
  // directories for manually-included paths ("invalid deployment package
  // ... framework produces files in symlinked directories") even though
  // its own automatic tracing dereferences symlinks fine.
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/lib/**',
    ],
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Next 15+ rejects dev-server HMR/RSC requests whose Origin isn't
  // localhost by default (CSRF hardening) — silently breaking hydration and
  // client-side navigation, not just HMR, when the dev server is reached
  // over a LAN IP (e.g. testing on a phone via `pnpm dev`'s printed Network
  // URL). Harmless in production (this key is dev-only). Update the IP here
  // if your machine's LAN address changes (DHCP).
  // The trycloudflare entry covers sharing a `pnpm dev` session over a
  // Cloudflare quick tunnel (`cloudflared tunnel --url http://localhost:3000`),
  // which hits the exact same wall: the page renders, no console error appears,
  // and every client component silently stays unhydrated.
  allowedDevOrigins: ['192.168.100.23', '*.trycloudflare.com'],
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
