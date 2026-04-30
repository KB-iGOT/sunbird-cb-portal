import { ComponentCanDeactivate } from './componentCanDeactivate'

class TestGuard extends ComponentCanDeactivate {
  canDeactivate(): boolean {
    return this._canDeactivate
  }
  _canDeactivate = true
}

describe('ComponentCanDeactivate', () => {
  it('unloadNotification - sets returnValue when canDeactivate returns false', () => {
    const guard = new TestGuard()
    guard._canDeactivate = false
    const event: any = {}
    guard.unloadNotification(event)
    expect(event.returnValue).toBe(true)
  })

  it('unloadNotification - does not set returnValue when canDeactivate returns true', () => {
    const guard = new TestGuard()
    guard._canDeactivate = true
    const event: any = {}
    guard.unloadNotification(event)
    expect(event.returnValue).toBeUndefined()
  })

  it('canDeactivate - returns true by default', () => {
    const guard = new TestGuard()
    expect(guard.canDeactivate()).toBe(true)
  })
})
