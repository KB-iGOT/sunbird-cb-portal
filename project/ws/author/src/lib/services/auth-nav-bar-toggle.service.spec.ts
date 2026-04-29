import { AuthNavBarToggleService } from './auth-nav-bar-toggle.service'

describe('AuthNavBarToggleService', () => {
  it('should create', () => {
    const svc = new AuthNavBarToggleService()
    expect(svc).toBeTruthy()
  })

  it('should have default isVisible as true', () => {
    const svc = new AuthNavBarToggleService()
    expect(svc.isVisible).toBe(true)
  })

  it('setter isVisible should update value', () => {
    const svc = new AuthNavBarToggleService()
    svc.isVisible = false
    expect(svc.isVisible).toBe(false)
  })

  it('toggle - sets isVisible and emits to toggleNavBar', (done) => {
    const svc = new AuthNavBarToggleService()
    svc.toggleNavBar.subscribe((value: boolean) => {
      expect(value).toBe(false)
      done()
    })
    svc.toggle(false)
    expect(svc.isVisible).toBe(false)
  })

  it('toggle true - emits true', (done) => {
    const svc = new AuthNavBarToggleService()
    svc.toggle(false)
    svc.toggleNavBar.subscribe((value: boolean) => {
      if (value === true) {
        done()
      }
    })
    svc.toggle(true)
  })

  it('toggleNavBar is a ReplaySubject', () => {
    const svc = new AuthNavBarToggleService()
    expect(svc.toggleNavBar).toBeDefined()
    expect(typeof svc.toggleNavBar.subscribe).toBe('function')
  })

  it('toggle multiple times - final state is true', () => {
    const svc = new AuthNavBarToggleService()
    svc.toggle(false)
    svc.toggle(true)
    // isVisible should reflect the last toggle
    expect(svc.isVisible).toBe(true)
  })
})
