/** Elements worth reading aloud when clicked. */
export const READABLE_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, a, button, figcaption'

export type ReadAloudController = {
  speak(text: string): void
  stop(): void
  isSpeaking(): boolean
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

export function pickVoiceLang(htmlLang: string): string {
  return htmlLang.toLowerCase().startsWith('es') ? 'es-ES' : 'en-US'
}

export function createReadAloud(getLang: () => string): ReadAloudController {
  let speaking = false

  function stop() {
    speaking = false
    if (!isSpeechSupported()) return
    window.speechSynthesis.cancel()
  }

  function speak(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!isSpeechSupported()) return

    // Chrome queues utterances rather than replacing them; without an explicit
    // cancel, clicking three paragraphs means waiting through all three
    // instead of hearing the last one.
    window.speechSynthesis.cancel()

    const lang = pickVoiceLang(getLang())
    const utterance = new SpeechSynthesisUtterance(trimmed)
    utterance.lang = lang

    // getVoices() is empty until the voices load; falling through with no
    // voice lets the browser pick its own default for the requested lang.
    const match = window.speechSynthesis.getVoices().find((voice) => voice.lang === lang)
    if (match) utterance.voice = match

    utterance.onend = () => {
      speaking = false
    }

    speaking = true
    window.speechSynthesis.speak(utterance)
  }

  return {
    speak,
    stop,
    isSpeaking: () => speaking,
  }
}
