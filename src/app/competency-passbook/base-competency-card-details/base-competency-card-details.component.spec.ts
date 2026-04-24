import { BaseCompetencyCardDetailsComponent } from './base-competency-card-details.component'

describe('BaseCompetencyCardDetailsComponent', () => {
  let component: BaseCompetencyCardDetailsComponent
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = {
      globalConfig: null,
    }
    component = new BaseCompetencyCardDetailsComponent(mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default showOldVersion to false', () => {
    expect(component.showOldVersion).toBe(false)
  })

  it('should set showOldVersion from globalConfig on ngOnInit', () => {
    mockConfigSvc.globalConfig = { showOldVersionOfLearnersPassbook: true }
    component.ngOnInit()
    expect(component.showOldVersion).toBe(true)
  })

  it('should set showOldVersion to false when globalConfig.showOldVersionOfLearnersPassbook is false', () => {
    mockConfigSvc.globalConfig = { showOldVersionOfLearnersPassbook: false }
    component.ngOnInit()
    expect(component.showOldVersion).toBe(false)
  })

  it('should set showOldVersion to false when globalConfig is null', () => {
    mockConfigSvc.globalConfig = null
    component.ngOnInit()
    expect(component.showOldVersion).toBe(false)
  })
})

