export class ApiClient {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, window.location.origin)
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    }
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`ApiClient: GET ${path} failed with ${res.status}`)
    return res.json() as Promise<T>
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = new URL(path, window.location.origin)
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`ApiClient: POST ${path} failed with ${res.status}`)
    return res.json() as Promise<T>
  }

  /** Never set Content-Type explicitly — the browser derives the multipart boundary from the FormData instance itself. */
  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const url = new URL(path, window.location.origin)
    const res = await fetch(url.toString(), { method: 'POST', body: formData })
    if (!res.ok) throw new Error(`ApiClient: POST ${path} failed with ${res.status}`)
    return res.json() as Promise<T>
  }
}

export const apiClient = new ApiClient()
