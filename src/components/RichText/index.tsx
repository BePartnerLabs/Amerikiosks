import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  BannerBlock as BannerBlockProps,
  CardGridBlock as CardGridBlockProps,
  ContentBlock as ContentBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | ContentBlockProps
      | CardGridBlockProps
    >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) {
    throw new Error('Expected doc to be defined')
  }

  const { value, relationTo } = doc
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'insights' ? `/insights/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => (
      <BannerBlock
        className=""
        {...node.fields}
      />
    ),
    mediaBlock: ({ node }) => (
      <MediaBlock
        className=""
        imgClassName=""
        {...node.fields}
        captionClassName=""
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => (
      <CodeBlock
        className=""
        {...node.fields}
      />
    ),
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    content: ({ node }) => <ContentBlock {...node.fields} />,
    cardGrid: ({ node }) => <CardGridBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className=""
      {...rest}
    />
  )
}
