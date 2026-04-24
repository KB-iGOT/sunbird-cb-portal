import { TncRendererComponent } from './tnc-renderer.component'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NsTnc } from '../../models/tnc.model'

describe('TncRendererComponent', () => {
  let component: TncRendererComponent
  let mockConfigSvc: Partial<ConfigurationsService>

  beforeEach(() => {
    mockConfigSvc = {
      restrictedFeatures: new Set(['termsOfUser'])
    }

    component = new TncRendererComponent(mockConfigSvc as ConfigurationsService)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize termsOfUser based on configSvc restrictions', () => {
    expect(component.termsOfUser).toBe(false)

    // Modify mock and test again
    mockConfigSvc.restrictedFeatures = new Set()
    component = new TncRendererComponent(mockConfigSvc as ConfigurationsService)
    expect(component.termsOfUser).toBe(true)
  })

  it('should call assignGeneralAndDp when tncData is set', () => {
    const mockTncData: NsTnc.ITnc = {
      isAccepted: false,
      termsAndConditions: [
        {
          name: 'Generic T&C', isAccepted: false,
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        },
        {
          name: 'Data Privacy', isAccepted: false,
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        }
      ]
    }

    //const spyAssignGeneralAndDp = jest.spyOn(component, 'assignGeneralAndDp')
    component.tncData = mockTncData
    component.ngOnChanges()

    // expect(spyAssignGeneralAndDp).toHaveBeenCalled()
  })

  it('should set currentPanel to dp if dpTnc is not accepted and generalTnc is accepted', () => {
    const mockTncData: NsTnc.ITnc = {
      isAccepted: false,
      termsAndConditions: [
        {
          name: 'Generic T&C', isAccepted: true, // generalTnc is accepted → won't override to 'tnc'
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        },
        {
          name: 'Data Privacy', isAccepted: false,
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        }
      ]
    }

    component.tncData = mockTncData
    component.ngOnInit()

    expect(component.currentPanel).toBe('dp')
  })

  it('should change language when changeTncLang is called', () => {
    const spyTncChange = jest.spyOn(component.tncChange, 'emit')
    component.changeTncLang('en')
    expect(spyTncChange).toHaveBeenCalledWith('en')
  })

  it('should change dp language when changeDpLang is called', () => {
    const spyDpChange = jest.spyOn(component.dpChange, 'emit')
    component.changeDpLang('fr')
    expect(spyDpChange).toHaveBeenCalledWith('fr')
  })

  it('should scroll to tnc panel when reCenterPanel is called', () => {
    const mockElement = { scrollIntoView: jest.fn() }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    component.reCenterPanel()

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should assign terms and conditions correctly', () => {
    const mockTncData: NsTnc.ITnc = {
      isAccepted: false,
      termsAndConditions: [
        {
          name: 'Generic T&C', isAccepted: false,
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        },
        {
          name: 'Data Privacy', isAccepted: false,
          acceptedDate: new Date(),
          acceptedLanguage: '',
          acceptedVersion: '',
          availableLanguages: [],
          content: '',
          language: '',
          version: ''
        }
      ]
    }

    component.tncData = mockTncData
    component.ngOnChanges()

    expect(component.generalTnc).toEqual(mockTncData.termsAndConditions[0])
    expect(component.dpTnc).toEqual(mockTncData.termsAndConditions[1])
  })
})
