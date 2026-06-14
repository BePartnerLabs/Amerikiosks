import { apiClient } from './clients/ApiClient'

interface TranslateSlugResponse {
  slug: string
}

export const PagesRepository = {
  async translateSlug(slug: string, from: string, to: string): Promise<string> {
    try {
      const data = await apiClient.get<TranslateSlugResponse>('/next/translate-slug', {
        slug,
        from,
        to,
      })
      return data.slug ?? slug
    } catch {
      return slug
    }
  },
}
