import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { UsersRepository } from '@/repositories'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: Awaited<ReturnType<typeof UsersRepository.getMe>>['user']
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  try {
    const { user } = await UsersRepository.getMe(token ?? '')

    if (validUserRedirect && user) redirect(validUserRedirect)
    if (nullUserRedirect && !user) redirect(nullUserRedirect)

    if (!token) throw new Error('Missing auth token')

    return { token, user }
  } catch (err) {
    // redirect() throws internally — re-throw it
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err

    if (nullUserRedirect) redirect(nullUserRedirect)
    throw err
  }
}
