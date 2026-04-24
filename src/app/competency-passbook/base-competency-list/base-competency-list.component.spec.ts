import { BaseCompetencyListComponent } from './base-competency-list.component'

describe('BaseCompetencyListComponent', () => {
  let component: BaseCompetencyListComponent
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = {
      globalConfig: null,
    }
    component = new BaseCompetencyListComponent(mockConfigSvc)
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

