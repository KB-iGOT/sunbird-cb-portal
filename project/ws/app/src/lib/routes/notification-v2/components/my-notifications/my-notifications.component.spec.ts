import { of, Subject } from 'rxjs'
import { environment } from 'src/environments/environment'

import { SurveyPopupComponent } from '../../../peer-validation/components/survey-popup/survey-popup.component'
import { VerificationRequestDialogComponent } from '../../../peer-validation/components/verification-request-dialog/verification-request-dialog.component'
import { MyNotificationsComponent } from './my-notifications.component'

describe('MyNotificationsComponent', () => {
  let component: MyNotificationsComponent
  let translateMock: any
  let langtranslationsMock: any
  let notificationsServiceMock: any
  let snackBarMock: any
  let dialogMock: any
  let configServiceMock: any
  let eventsMock: any
  let libNotificationsServiceMock: any
  let routeMock: any
  let matDialogMock: any
  let peerValidationServiceMock: any
  let handleClick$: Subject<any>
  let afterClosed$: Subject<any>

  const createComponent = () => new MyNotificationsComponent(
    translateMock,
    langtranslationsMock,
    notificationsServiceMock,
    snackBarMock,
    dialogMock,
    configServiceMock,
    eventsMock,
    libNotificationsServiceMock,
    routeMock,
    matDialogMock,
    peerValidationServiceMock,
  )

  beforeEach(() => {
    translateMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    langtranslationsMock = {
      languageSelectedObservable: {
        subscribe: jest.fn((cb: any) => {
          cb()
        }),
      },
    }

    handleClick$ = new Subject<any>()
    afterClosed$ = new Subject<any>()
    notificationsServiceMock = {
      handleRedirection: jest.fn(),
      handleConetentRedirection: jest.fn(),
    }
    snackBarMock = { open: jest.fn() }
    dialogMock = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed$ }) }
    configServiceMock = {
      unMappedUser: { roles: ['PUBLIC'] },
      userProfile: { firstName: 'John', lastName: 'Doe' },
    }
    eventsMock = { raiseInteractTelemetry: jest.fn() }
    libNotificationsServiceMock = { _handleClick: handleClick$ }
    routeMock = { fragment: of('peer') }
    matDialogMock = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed$ }) }
    peerValidationServiceMock = { notificationSubmitted$: new Subject<void>() }

    localStorage.clear()
    localStorage.setItem('websiteLanguage', 'fr')

    component = createComponent()
  })

  it('should set language from localStorage on init', () => {
    expect(translateMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateMock.use).toHaveBeenCalledWith('fr')
    expect(component.selectedLanguage).toBe('fr')
  })

  it('should update language on languageSelectedObservable emit', () => {
    expect(translateMock.use).toHaveBeenCalledWith('fr')
    expect(component.selectedLanguage).toBe('fr')
  })

  it('should read roles and route fragment', () => {
    expect(component.roles).toEqual(['PUBLIC'])
    expect(component.fragment).toBe('peer')
  })

  it('should handle content redirection on library notification click', () => {
    handleClick$.next({ identifier: 'do_1' })
    expect(notificationsServiceMock.handleConetentRedirection).toHaveBeenCalledWith({ identifier: 'do_1' })
  })

  it('should delegate redirection to notifications service for regular notifications', () => {
    const notification: any = {
      notification_id: 'n1',
      category: 'LEARN',
      message: { id: '123' },
    }
    component.redirectTo(notification)
    expect(eventsMock.raiseInteractTelemetry).toHaveBeenCalledWith(
      { type: 'click', subType: 'notification-engine', id: 'n1' },
      {},
      { module: 'Home' },
    )
    expect(notificationsServiceMock.handleRedirection).toHaveBeenCalledWith(notification, environment, ['PUBLIC'], snackBarMock)
  })

  it('should open verification popup for PEER_REVIEW_ASSIGNED notifications', () => {
    const notification: any = {
      category: 'PEER_VALIDATION',
      sub_category: 'PEER_REVIEW_ASSIGNED',
      notification_id: 'n2',
      message: { data: [{ requestedName: 'Jane', courseName: 'Course A' }] },
    }
    component.redirectTo(notification)
    expect(matDialogMock.open).toHaveBeenCalledWith(VerificationRequestDialogComponent, expect.objectContaining({
      data: expect.objectContaining({ requestedName: 'Jane', courseName: 'Course A', notificationId: 'n2' }),
    }))
    afterClosed$.next('ignored')
    expect(notification.status).toBe('IGNORED')
  })

  it('should open survey popup for peer evaluation notifications', () => {
    const notification: any = {
      category: 'PEER_VALIDATION',
      sub_category: 'PEER_EVALUATION_ASSIGNED',
      message: { data: [{ courseName: 'Course B', completionDate: '2024-01-05T12:00:00' }] },
    }
    component.redirectTo(notification)
    expect(matDialogMock.open).toHaveBeenCalledWith(SurveyPopupComponent, expect.objectContaining({
      data: expect.objectContaining({ learnerName: 'John Doe', courseName: 'Course B', completionDate: '05-01-2024' }),
    }))
    peerValidationServiceMock.notificationSubmitted$.next()
    expect(notification.status).toBe('SUBMITTED')
  })

  it('should show snackbar when survey is already submitted', () => {
    component.openSurveypopup({ status: 'SUBMITTED', message: {} })
    expect(snackBarMock.open).toHaveBeenCalledWith('You have already completed the survey.', 'X', { duration: 3000 })
    expect(matDialogMock.open).not.toHaveBeenCalled()
  })

  it('should show snackbar when review is already submitted', () => {
    component.openVerificationPopup({ status: 'APPROVED', message: {} })
    expect(snackBarMock.open).toHaveBeenCalledWith('You have already submitted the review.', 'X', { duration: 3000 })
    expect(matDialogMock.open).not.toHaveBeenCalled()
  })

  it('should format dates', () => {
    expect(component.formatDate('')).toBe('')
    expect(component.formatDate('invalid')).toBe('invalid')
    expect(component.formatDate('2024-03-09T12:00:00')).toBe('09-03-2024')
  })
})
