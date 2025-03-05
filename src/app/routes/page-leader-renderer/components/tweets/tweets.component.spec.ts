import { TweetsComponent } from './tweets.component'
import { LeadershipService } from '../../services/leadership.service'


// Mock the LeadershipService
jest.mock('../../services/leadership.service', () => ({
  LeadershipService: jest.fn().mockImplementation(() => ({
    randomId: 'mockRandomId',
  })),
}))

describe('TweetsComponent', () => {
  let component: TweetsComponent
  let leaderSvc: LeadershipService

  beforeEach(() => {
    // Create a mock instance of LeadershipService
    leaderSvc = new LeadershipService(null as any)

    // Create the component instance
    component = new TweetsComponent(leaderSvc)

    // Mock global functions used in the component (e.g., document.createElement)
    // global.document.createElement = jest.fn(() => ({
    //   setAttribute: jest.fn(),
    //   appendChild: jest.fn(),
    // }))

    global.document.getElementById = jest.fn(() => null) // Simulating no existing script in the DOM
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  it('should load script when loadScript is called with forced = true', async () => {
    // Spy on the appendChild method of the document body to check if script is being added
    const appendChildMock = jest.spyOn(document.body, 'appendChild')

    // Call the loadScript method with forced = true
    await component.loadScript(true)

    // Check if tweetScriptId has been updated with randomId from LeadershipService
    //expect(global.tweetScriptId).toBe('tweetScript_mockRandomId')

    // Check if script element was created and appended
    expect(appendChildMock).toHaveBeenCalled()
  })

  it('should not load script if it is already loaded', async () => {
    // Simulate the script being already loaded by setting hasTweetScriptLoaded to true
    component.hasTweetScriptLoaded = true

    // Call the loadScript method
    await component.loadScript()

    // Check that script creation or appending is not triggered
    expect(global.document.createElement).not.toHaveBeenCalled()
  })

  it('should call loadScript only once even if called multiple times', async () => {
    // Spy on loadScript to check if it's called once
    const loadScriptSpy = jest.spyOn(component, 'loadScript')

    // Call loadScript multiple times
    await component.loadScript()
    await component.loadScript()

    // Expect loadScript to be called only once
    expect(loadScriptSpy).toHaveBeenCalledTimes(1)
  })

  it('should update hasTweetScriptLoaded to true after script is loaded', async () => {
    // Mock the event listener to simulate the script loading
    const mockEventListener = jest.fn()

    // Simulate adding a script element
    const newScriptElement = document.createElement('script')
    newScriptElement.addEventListener('load', mockEventListener)

    // Call loadScript method to load the script
    await component.loadScript()

    // Simulate the 'load' event to trigger the load event listener
    mockEventListener()

    // Expect that the hasTweetScriptLoaded flag was updated
    expect(component.hasTweetScriptLoaded).toBe(true)
  })
})
