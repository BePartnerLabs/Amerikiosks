import { describe, expect, it } from 'vitest'
import { FAQItems } from '@/collections/FAQItems'
import { Insights } from '@/collections/Insights'
import { Machines } from '@/collections/Machines'
import { Pages } from '@/collections/Pages'
import { Projects } from '@/collections/Projects'
import { Users } from '@/collections/Users'

describe('collection configs', () => {
  it('Pages has the expected slug and a non-empty field list', () => {
    expect(Pages.slug).toBe('pages')
    expect(Pages.fields.length).toBeGreaterThan(0)
  })

  it('Insights has the expected slug and a non-empty field list', () => {
    expect(Insights.slug).toBe('insights')
    expect(Insights.fields.length).toBeGreaterThan(0)
  })

  it('Machines has the expected slug and a non-empty field list', () => {
    expect(Machines.slug).toBe('machines')
    expect(Machines.fields.length).toBeGreaterThan(0)
  })

  it('FAQItems has the expected slug and a non-empty field list', () => {
    expect(FAQItems.slug).toBe('faqItems')
    expect(FAQItems.fields.length).toBeGreaterThan(0)
  })

  it('Projects has the expected slug and a non-empty field list', () => {
    expect(Projects.slug).toBe('projects')
    expect(Projects.fields.length).toBeGreaterThan(0)
  })

  it('Users has the expected slug and auth enabled', () => {
    expect(Users.slug).toBe('users')
    expect(Users.auth).toBeTruthy()
  })
})
