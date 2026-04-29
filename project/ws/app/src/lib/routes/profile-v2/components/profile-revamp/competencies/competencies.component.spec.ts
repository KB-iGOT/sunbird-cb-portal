import { CompetenciesComponent } from './competencies.component'

describe('CompetenciesComponent', () => {
  let component: CompetenciesComponent

  function makeCompetency(name: string): any {
    return { name, active: false, subCompetencies: [] }
  }

  beforeEach(() => {
    component = new CompetenciesComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('viewAll should be false by default', () => {
    expect(component.viewAll).toBe(false)
  })

  it('selectedCompetencyIndex should be 0 by default', () => {
    expect(component.selectedCompetencyIndex).toBe(0)
  })

  it('ngOnInit does nothing when competencies is empty', () => {
    component.competencies = []
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('ngOnInit calls selectCompetency(0) when competencies is not empty', () => {
    component.competencies = [makeCompetency('C1'), makeCompetency('C2')]
    component.ngOnInit()
    expect(component.selectedCompetencyIndex).toBe(0)
    expect(component.competencies[0].active).toBe(true)
    expect(component.competencies[1].active).toBe(false)
  })

  it('selectCompetency sets selectedCompetencyIndex', () => {
    component.competencies = [makeCompetency('C1'), makeCompetency('C2'), makeCompetency('C3')]
    component.selectCompetency(2)
    expect(component.selectedCompetencyIndex).toBe(2)
  })

  it('selectCompetency sets active on the selected competency', () => {
    component.competencies = [makeCompetency('A'), makeCompetency('B')]
    component.selectCompetency(1)
    expect(component.competencies[0].active).toBe(false)
    expect(component.competencies[1].active).toBe(true)
  })

  it('selectCompetency resets viewAll to false', () => {
    component.competencies = [makeCompetency('A'), makeCompetency('B')]
    component.viewAll = true
    component.selectCompetency(0)
    expect(component.viewAll).toBe(false)
  })

  it('toggleView flips viewAll from false to true', () => {
    component.viewAll = false
    component.toggleView()
    expect(component.viewAll).toBe(true)
  })

  it('toggleView flips viewAll from true to false', () => {
    component.viewAll = true
    component.toggleView()
    expect(component.viewAll).toBe(false)
  })
})

