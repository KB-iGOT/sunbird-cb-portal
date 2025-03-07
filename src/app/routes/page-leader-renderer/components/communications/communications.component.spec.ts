import { CommunicationsComponent } from './communications.component'

describe('CommunicationsComponent', () => {
  let component: CommunicationsComponent

  beforeEach(() => {
    // Create an instance of CommunicationsComponent
    component = new CommunicationsComponent()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have initial errorMessageCode as empty', () => {
    expect(component.errorMessageCode).toBe('')
  })

  it('should set errorMessageCode to NO_DATA when handleNoContent is called with "none"', () => {
    component.handleNoContent('none')
    expect(component.errorMessageCode).toBe('NO_DATA')
  })

  it('should set errorMessageCode to API_FAILURE when handleNoContent is called with "error"', () => {
    component.handleNoContent('error')
    expect(component.errorMessageCode).toBe('API_FAILURE')
  })

  it('should set errorMessageCode to empty string when handleNoContent is called with anything else', () => {
    component.handleNoContent('other')
    expect(component.errorMessageCode).toBe('')
  })

  it('should set errorMessageCode to empty string when handleNoContent is called with an undefined value', () => {
    component.handleNoContent(undefined)
    expect(component.errorMessageCode).toBe('')
  })
})
