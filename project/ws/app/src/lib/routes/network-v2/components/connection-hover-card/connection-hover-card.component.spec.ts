import { ConnectionHoverCardComponent } from './connection-hover-card.component'

describe('ConnectionHoverCardComponent', () => {
  let component: ConnectionHoverCardComponent
  let router: any
  let translate: any

  beforeEach(() => {
    localStorage.clear()
    router = { navigate: jest.fn() }
    translate = { setDefaultLang: jest.fn(), use: jest.fn() }
    component = new ConnectionHoverCardComponent(
      router,
      { parent: { snapshot: { data: { me: { id: 'me' } } } } } as any,
      translate,
    )
  })

  it('sets verified profile status on init', () => {
    component.hoverUser = { professionalDetails: [{ profileStatus: 'VERIFIED' }] }
    component.ngOnInit()
    expect(component.isProfileStatus).toBe(true)
  })

  it('resolves display names for flat user data', () => {
    component.hoverUser = { firstName: 'Ada', lastName: 'Lovelace' }
    expect(component.getUserName).toBe('Ada Lovelace')
    expect(component.getUseravatarName()).toBe('Ada Lovelace')

    component.hoverUser = { firstName: 'Ada' }
    expect(component.getUserName).toBe('Ada')
    component.hoverUser = { fullName: 'Grace Hopper' }
    expect(component.getUserName).toBe('Grace Hopper')
    component.hoverUser = { name: 'Guest Name' }
    expect(component.getUserName).toBe('Guest Name')
  })

  it('resolves display names for personal details variants', () => {
    component.hoverUser = { personalDetails: { firstname: 'A', middlename: 'B', surname: 'C' } }
    expect(component.getUserName).toBe('A B C')
    expect(component.getUseravatarName()).toBe('A B C')

    component.hoverUser = { personalDetails: { firstname: 'A', middlename: 'B' } }
    expect(component.getUserName).toBe('A B')
    component.hoverUser = { personalDetails: { firstname: 'A', surname: 'C' } }
    expect(component.getUserName).toBe('A C')
    component.hoverUser = { personalDetails: { firstname: 'A' } }
    expect(component.getUserName).toBe('A')
    component.hoverUser = { personalDetails: { firstName: 'A', surname: 'C' } }
    expect(component.getUserName).toBe('A C')
    component.hoverUser = { personalDetails: { firstName: 'A' } }
    expect(component.getUseravatarName()).toBe('A')
  })

  it('navigates to user profile and uses saved language', () => {
    component.hoverUser = { id: 'user-1' }
    component.goToUserProfile()
    expect(router.navigate).toHaveBeenCalledWith(['/app/person-profile', 'user-1'], { fragment: 'profileInfo' })

    localStorage.setItem('websiteLanguage', 'hi')
    const translated = new ConnectionHoverCardComponent(router, {} as any, translate)
    expect(translated).toBeTruthy()
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translate.use).toHaveBeenCalledWith('hi')
  })
})
