import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createReadAloud,
  isSpeechSupported,
  pickVoiceLang,
} from '@/components/AccessibilityWidget/readAloud'

class FakeUtterance {
  text: string
  lang = ''
  voice: unknown = null
  onend: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

function installFakeSpeech() {
  const spoken: FakeUtterance[] = []
  const synth = {
    speaking: false,
    cancel: vi.fn(() => {
      synth.speaking = false
    }),
    speak: vi.fn((u: FakeUtterance) => {
      spoken.push(u)
      synth.speaking = true
    }),
    getVoices: vi.fn(() => [
      { lang: 'es-ES', name: 'Mónica' },
      { lang: 'en-US', name: 'Alex' },
    ]),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return { synth, spoken }
}

describe('pickVoiceLang', () => {
  it('maps the html lang to a BCP-47 voice locale', () => {
    expect(pickVoiceLang('es')).toBe('es-ES')
    expect(pickVoiceLang('en')).toBe('en-US')
    expect(pickVoiceLang('')).toBe('en-US')
  })
})

describe('isSpeechSupported', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is true when the API exists', () => {
    installFakeSpeech()
    expect(isSpeechSupported()).toBe(true)
  })

  it('is false when the API is missing', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(isSpeechSupported()).toBe(false)
  })
})

describe('createReadAloud', () => {
  let fake: ReturnType<typeof installFakeSpeech>

  beforeEach(() => {
    fake = installFakeSpeech()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('speaks the given text with the locale voice', () => {
    const controller = createReadAloud(() => 'es')
    controller.speak('Hola mundo')
    expect(fake.spoken).toHaveLength(1)
    expect(fake.spoken[0].text).toBe('Hola mundo')
    expect(fake.spoken[0].lang).toBe('es-ES')
  })

  it('cancels any in-flight speech before starting a new utterance', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('first')
    controller.speak('second')
    expect(fake.synth.cancel).toHaveBeenCalled()
    expect(fake.spoken).toHaveLength(2)
  })

  it('ignores empty or whitespace-only text', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('   ')
    controller.speak('')
    expect(fake.synth.speak).not.toHaveBeenCalled()
  })

  it('stop cancels speech', () => {
    const controller = createReadAloud(() => 'en')
    controller.speak('hello')
    controller.stop()
    expect(fake.synth.cancel).toHaveBeenCalled()
    expect(controller.isSpeaking()).toBe(false)
  })

  it('falls back to the default voice when no voice matches the locale', () => {
    fake.synth.getVoices = vi.fn(() => [])
    const controller = createReadAloud(() => 'es')
    expect(() => controller.speak('Hola')).not.toThrow()
    expect(fake.spoken[0].voice).toBeNull()
  })

  it('does nothing when the API is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const controller = createReadAloud(() => 'en')
    expect(() => controller.speak('hello')).not.toThrow()
  })
})
