import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import RichText from '@/components/RichText'
import { Width } from '../Width'

export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => {
  return (
    <Width
      className="ak-form__message-block"
      width="100"
    >
      {message && <RichText data={message} />}
    </Width>
  )
}
