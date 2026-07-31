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
import { useLocale } from 'next-intl'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MetricsBlock } from '@/blocks/Metrics/Component'
import type {
  BannerBlock as BannerBlockProps,
  CardGridBlock as CardGridBlockProps,
  ContentBlock as ContentBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  MetricsBlock as MetricsBlockProps,
} from '@/payload-types'
import { type AppLocale, localizeHref } from '@/utilities/localeUrl'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | MetricsBlockProps
      | ContentBlockProps
      | CardGridBlockProps
    >

// Built per locale rather than once at module scope: the href needs the `/es`
// prefix, and without it `localePrefix: 'as-needed'` resolves the path as EN.
// Slugs are translated, so the EN route does not have the Spanish one and the
// link 404s — which is how the live consent text ended up pointing Spanish
// visitors at a dead privacy policy.
const makeInternalDocToHref =
  (locale: AppLocale) =>
  ({ linkNode }: { linkNode: SerializedLinkNode }) => {
    const doc = linkNode.fields.doc
    if (!doc) {
      throw new Error('Expected doc to be defined')
    }

    const { value, relationTo } = doc
    if (typeof value !== 'object') {
      throw new Error('Expected value to be an object')
    }
    const slug = value.slug
    return localizeHref(relationTo === 'insights' ? `/insights/${slug}` : `/${slug}`, locale)
  }

const makeJsxConverters =
  (locale: AppLocale): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref: makeInternalDocToHref(locale) }),
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
      metrics: ({ node }) => <MetricsBlock {...node.fields} />,
    },
  })

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  const locale = useLocale() as AppLocale
  return (
    <ConvertRichText
      converters={makeJsxConverters(locale)}
      className={`ak-rich-text ${className ?? ''}`}
      {...rest}
    />
  )
}
