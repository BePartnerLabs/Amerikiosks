import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating settings')
    revalidateTag('global_settings', 'max')
    revalidatePath('/robots.txt', 'layout')
    revalidateTag('llms-txt', 'max')
  }

  return doc
}
