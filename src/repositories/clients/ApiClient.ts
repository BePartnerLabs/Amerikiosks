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

  /**
   * Never set Content-Type explicitly — the browser derives the multipart
   * boundary from the FormData instance itself.
   *
   * Uses XMLHttpRequest rather than fetch purely for `onProgress`: fetch has
   * no way to observe upload progress (request streams exist but Safari does
   * not support them), and a file upload with no progress is the case where a
   * visitor assumes the page is broken and leaves.
   */
  async postFormData<T>(
    path: string,
    formData: FormData,
    onProgress?: (percent: number) => void,
  ): Promise<T> {
    const url = new URL(path, window.location.origin)

    if (!onProgress) {
      const res = await fetch(url.toString(), { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`ApiClient: POST ${path} failed with ${res.status}`)
      return res.json() as Promise<T>
    }

    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url.toString())

      xhr.upload.addEventListener('progress', (event) => {
        // Not every transfer reports a total (chunked encoding, some proxies);
        // reporting a made-up percentage would be worse than reporting none.
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(`ApiClient: POST ${path} failed with ${xhr.status}`))
          return
        }
        try {
          resolve(JSON.parse(xhr.responseText) as T)
        } catch {
          reject(new Error(`ApiClient: POST ${path} returned a non-JSON body`))
        }
      })
      xhr.addEventListener('error', () =>
        reject(new Error(`ApiClient: POST ${path} failed to reach the server`)),
      )
      xhr.addEventListener('abort', () => reject(new Error(`ApiClient: POST ${path} was aborted`)))

      xhr.send(formData)
    })
  }
}

export const apiClient = new ApiClient()
