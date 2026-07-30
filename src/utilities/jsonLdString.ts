/** JSON.stringify for <script type="application/ld+json"> bodies: escapes `<`
 *  so CMS-entered `</script>` can never break out of the tag. */
export const jsonLdString = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')
