import { getClientSideURL } from '@/utilities/getURL'
import type { User } from '../payload-types'

export interface MeUserResponse {
  token: string
  user: User
}

export const UsersRepository = {
  async getMe(token: string): Promise<MeUserResponse> {
    const res = await fetch(`${getClientSideURL()}/api/users/me`, {
      headers: { Authorization: `JWT ${token}` },
    })
    if (!res.ok) throw new Error(`UsersRepository: getMe failed with ${res.status}`)
    return res.json() as Promise<MeUserResponse>
  },
}
