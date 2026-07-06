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
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [100],
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
  // Confirmed via Vercel runtime logs: the file (e.g. libvips-cpp.so.8.18.3)
  // IS present in node_modules after install, but output-file-tracing doesn't
  // copy it into the deployed function bundle — marking it external alone
  // doesn't fix a missing-file problem. Force-include it explicitly.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/sharp/**', './node_modules/@img/**'],
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
