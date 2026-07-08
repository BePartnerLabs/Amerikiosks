/**
 * Same get/post + error-message contract as ApiClient, but for absolute URLs
 * from server-side code (Payload hooks) where `window` isn't available.
 */
export class ServerHttpClient {
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const res = await fetch(url, { method: 'GET', headers })
    if (!res.ok) throw new Error(`ServerHttpClient: GET ${url} failed with ${res.status}`)
    return res.json() as Promise<T>
  }

  async post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`ServerHttpClient: POST ${url} failed with ${res.status}`)
    return res.json() as Promise<T>
  }
}

export const serverHttpClient = new ServerHttpClient()
