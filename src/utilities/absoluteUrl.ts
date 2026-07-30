/** Prefix `serverUrl` only when `url` is relative — R2 media URLs are already absolute. */
export const absoluteUrl = (url: string, serverUrl: string): string =>
  url.startsWith('http://') || url.startsWith('https://') ? url : `${serverUrl}${url}`
