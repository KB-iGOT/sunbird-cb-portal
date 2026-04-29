import { NotificationComponent } from './notification.component'

jest.mock('@ws/author/src/lib/constants/notificationMessage', () => ({
  Notify: {
    SAVE_SUCCESS: 'SAVE_SUCCESS',
    SAVE_FAIL: 'SAVE_FAIL',
    UPLOAD_SUCCESS: 'UPLOAD_SUCCESS',
    UPLOAD_FAIL: 'UPLOAD_FAIL',
    SEND_FOR_REVIEW_SUCCESS: 'SEND_FOR_REVIEW_SUCCESS',
    SEND_FOR_REVIEW_FAIL: 'SEND_FOR_REVIEW_FAIL',
    REVIEW_SUCCESS: 'REVIEW_SUCCESS',
    REVIEW_FAIL: 'REVIEW_FAIL',
    PUBLISH_SUCCESS: 'PUBLISH_SUCCESS',
    PUBLISH_FAIL: 'PUBLISH_FAIL',
    EMAIL_SUCCESS: 'EMAIL_SUCCESS',
    EMAIL_FAIL: 'EMAIL_FAIL',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    CONTENT_FAIL: 'CONTENT_FAIL',
  },
}), { virtual: true })

jest.mock('@angular/material/legacy-snack-bar', () => ({
  MAT_LEGACY_SNACK_BAR_DATA: 'MAT_SNACK_BAR_DATA',
}), { virtual: true })

const makeComponent = (type: string, data: any = {}) =>
  new (NotificationComponent as any)({ type, data })

describe('NotificationComponent', () => {
  it('should create with type and data', () => {
    const c = makeComponent('SAVE_SUCCESS', { id: 1 })
    expect(c.type).toBe('SAVE_SUCCESS')
    expect(c.otherData).toEqual({ id: 1 })
  })

  describe('canShow – success cases', () => {
    const successTypes = [
      'SAVE_SUCCESS', 'UPLOAD_SUCCESS', 'REVIEW_SUCCESS',
      'PUBLISH_SUCCESS', 'EMAIL_SUCCESS', 'SUCCESS', 'SEND_FOR_REVIEW_SUCCESS',
    ]
    successTypes.forEach(type => {
      it(`returns true for ${type} when msg is 'success'`, () => {
        expect(makeComponent(type).canShow('success')).toBe(true)
      })
      it(`returns false for ${type} when msg is 'failure'`, () => {
        expect(makeComponent(type).canShow('failure')).toBe(false)
      })
    })
  })

  describe('canShow – failure cases', () => {
    const failTypes = [
      'SAVE_FAIL', 'UPLOAD_FAIL', 'SEND_FOR_REVIEW_FAIL', 'REVIEW_FAIL',
      'PUBLISH_FAIL', 'EMAIL_FAIL', 'FAIL', 'CONTENT_FAIL',
    ]
    failTypes.forEach(type => {
      it(`returns true for ${type} when msg is 'failure'`, () => {
        expect(makeComponent(type).canShow('failure')).toBe(true)
      })
      it(`returns false for ${type} when msg is 'success'`, () => {
        expect(makeComponent(type).canShow('success')).toBe(false)
      })
    })
  })

  it('canShow returns false for unknown type', () => {
    expect(makeComponent('UNKNOWN_TYPE').canShow('success')).toBe(false)
    expect(makeComponent('UNKNOWN_TYPE').canShow('failure')).toBe(false)
  })
})
