import { FormBuilder } from '@angular/forms'
import {
  DEFAULT_MILESTONE_LABELS, answerLimitFor, buildSurveyForm, formatLabel, formatOrdinalDate, resolveMilestoneLabels,
} from './campaign-microsite.model'

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

describe('survey answer limits', () => {
  const limits = [{ questions: [1, 3, 4], minLength: 70, maxLength: 300 }]
  const fields = [
    { id: 'h', fieldType: 'heading' },
    { id: 'q1', fieldType: 'textarea', isRequired: true },
    { id: 'q2', fieldType: 'textarea', isRequired: true },
    { id: 'q3', fieldType: 'textarea', isRequired: true },
  ]

  it('matches by answerable-question position (headings not counted) or by field id', () => {
    expect(answerLimitFor(limits, { id: 'x', fieldType: 'textarea' }, 3)).toEqual({ minLength: 70, maxLength: 300 })
    expect(answerLimitFor(limits, { id: 'x', fieldType: 'textarea' }, 2)).toBeUndefined()
    expect(answerLimitFor([{ ids: ['x'], maxLength: 10 }], { id: 'x', fieldType: 'text' }, 9)).toEqual({ maxLength: 10 })
    // matching entries merge, so a hint can sit in its own entry
    expect(answerLimitFor([...limits, { questions: [3], hint: ' Example ' }], { id: 'x', fieldType: 'textarea' }, 3))
      .toEqual({ minLength: 70, maxLength: 300, hint: 'Example' })
    expect(answerLimitFor(undefined, { id: 'x', fieldType: 'text' }, 1)).toBeUndefined()
  })

  it('enforces the minimum on trimmed text and caps typing at the maximum', () => {
    const model = buildSurveyForm(new FormBuilder(), fields, limits)
    const q1 = model.controls[0].controls.answer
    const q2 = model.controls[1].controls.answer

    q1.setValue(`  ${'a'.repeat(69)}  `)
    expect(q1.hasError('minlength')).toBe(true)
    q1.setValue('a'.repeat(70))
    expect(q1.valid).toBe(true)
    q1.setValue('a'.repeat(350))
    expect(q1.value.length).toBe(300)
    expect(q1.valid).toBe(true)

    q2.setValue('short')
    expect(q2.valid).toBe(true)
    expect(model.parentFields[2].answerLimit).toBeUndefined()
    expect(model.parentFields[3].answerLimit).toEqual({ minLength: 70, maxLength: 300 })
  })
})
