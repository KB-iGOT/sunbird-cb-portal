import { DEFAULT_MILESTONE_LABELS, formatLabel, formatOrdinalDate, resolveMilestoneLabels } from './campaign-microsite.model'

describe('resolveMilestoneLabels', () => {
  it('returns the defaults when the page config has no labels', () => {
    expect(resolveMilestoneLabels(undefined)).toEqual(DEFAULT_MILESTONE_LABELS)
  })

  it('uses config text per key and keeps defaults for missing or blank keys', () => {
    const labels = resolveMilestoneLabels({
      journeyComplete: 'All done!',
      enrollError: '  ',
      popup: { okay: 'Got it' },
      survey: { submit: 'Send' },
    })
    expect(labels.journeyComplete).toBe('All done!')
    expect(labels.enrollError).toBe(DEFAULT_MILESTONE_LABELS.enrollError)
    expect(labels.popup).toEqual({ ...DEFAULT_MILESTONE_LABELS.popup, okay: 'Got it' })
    expect(labels.survey).toEqual({ ...DEFAULT_MILESTONE_LABELS.survey, submit: 'Send' })
  })

  it('ignores unknown keys and non-string values', () => {
    const labels = resolveMilestoneLabels({ close: 42 as any, extra: 'x' } as any)
    expect(labels.close).toBe(DEFAULT_MILESTONE_LABELS.close)
    expect((labels as any).extra).toBeUndefined()
  })
})

describe('formatOrdinalDate', () => {
  it.each([
    [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [11, '11th'], [12, '12th'], [13, '13th'],
    [17, '17th'], [21, '21st'], [22, '22nd'], [23, '23rd'], [31, '31st'],
  ])('day %s → %s', (day, ordinal) => {
    expect(formatOrdinalDate(new Date(2026, 9, day))).toBe(`${ordinal} Oct`)
  })
})

describe('formatLabel', () => {
  it('fills known placeholders and leaves unknown ones as written', () => {
    expect(formatLabel('Start Milestone {{number}}', { number: 2 })).toBe('Start Milestone 2')
    expect(formatLabel('{{ number }} of {{total}}', { number: 1 })).toBe('1 of {{total}}')
  })
})
