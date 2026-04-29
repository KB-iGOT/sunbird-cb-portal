import { SupportAIComponent } from './support-ai.component'
import { of } from 'rxjs'
import { NavigationEnd } from '@angular/router'

jest.mock('lodash/cloneDeep', () => jest.fn((v: any) => v))
jest.mock('../../../environments/environment', () => ({ environment: { supportEmail: 'test@example.com' } }))

describe('SupportAIComponent', () => {
  let component: SupportAIComponent

  const createComponent = () => {
    const mockConfigSvc = { userProfile: { firstName: 'John', lastName: 'Doe', profileImageUrl: 'http://test.jpg', professionalDetails: [{ designation: 'Manager' }], departmentName: 'IT' } }
    const mockEventSvc = { dispatchChatbotEvent: jest.fn() }
    const mockRenderer = { addClass: jest.fn(), removeClass: jest.fn() }
    const mockChatbotService = {
      getChatData: jest.fn(() => of({ payload: { config: { quesMap: [], recommendationMap: [], categoryMap: [] } } })),
      getLangugages: jest.fn(() => of({ status: { code: 200 }, payload: { languages: [] } })),
      aiStartChathForSupport: jest.fn(() => of({ message: 'Started' })),
      aiSendChathForSupport: jest.fn(() => of({ text: 'Response', query_id: 'q1' })),
      saveAIChatPositiveContentRating: jest.fn(() => of({ status: 'success' })),
      shareAIFeedback: jest.fn(() => of({ status: 'success' })),
      aiGlobalSearchFromInternet: jest.fn(() => of({ answer: 'Result' }))
    }
    const mockDialog = { open: jest.fn(() => ({ afterClosed: jest.fn(() => of('feedback')) })) }
    const mockMatSnackBar = { open: jest.fn() }
    const mockRouter = { events: of(new NavigationEnd(1, '/test', '/test')) }
    return new SupportAIComponent(mockConfigSvc as any, mockEventSvc as any, mockRenderer as any, mockChatbotService as any, mockDialog as any, mockMatSnackBar as any, mockRouter as any)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  it('should have selectedLanguage as en', () => {
    component = createComponent()
    expect(component.selectedLaguage).toBe('en')
  })

  it('should return Namaste for english greeting', () => {
    component = createComponent()
    component.selectedLaguage = 'en'
    expect(component.greetings()).toBe('Namaste')
  })

  it('should return नमस्ते for hindi greeting', () => {
    component = createComponent()
    component.selectedLaguage = 'hi'
    expect(component.greetings()).toBe('नमस्ते')
  })

  it('should get information text', () => {
    component = createComponent()
    component.selectedLaguage = 'en'
    expect(component.getInfoText('information')).toBe('Information')
  })

  it('should return input for unknown key', () => {
    component = createComponent()
    component.selectedLaguage = 'en'
    expect(component.getInfoText('unknown')).toBe('unknown')
  })
})
