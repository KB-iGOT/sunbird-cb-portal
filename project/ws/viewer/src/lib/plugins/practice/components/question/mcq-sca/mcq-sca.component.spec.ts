import { SingleChoiseQuesComponent } from './mcq-sca.component'

jest.mock('../../../practice.service', () => ({ PracticeService: jest.fn() }))

describe('SingleChoiseQuesComponent', () => {
  const create = () => new SingleChoiseQuesComponent({} as any)

  describe('optionsInGrid (questionnaire layout)', () => {
    it.each(['Baseline Assessment', 'Endline Assessment'])('lays the options out in a grid for "%s"', category => {
      const component = create()
      component.contextCategory = category
      expect(component.optionsInGrid).toBe(true)
    })

    it.each(['', 'Final Milestone Assessment'])('keeps the single column for "%s"', category => {
      const component = create()
      component.contextCategory = category
      expect(component.optionsInGrid).toBe(false)
    })
  })
})
