import { SendMailDialogComponent } from './send-mail-dialog.component'
import { IWsLeaderMailMeta } from '../../model/leadership.model'
import { IWsEmailResponse } from '../../model/leadership-email.model'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { LeadershipService } from '../../services/leadership.service'
import { of, throwError } from 'rxjs'

describe('SendMailDialogComponent', () => {
  let component: SendMailDialogComponent
  let matSnackBar: MatSnackBar
  let configSvc: ConfigurationsService
  let leadershipSvc: LeadershipService



  beforeEach(() => {
    // Mock the services and their methods
    matSnackBar = {
      open: jest.fn(),
    } as unknown as MatSnackBar

    configSvc = {
      userProfile: {
        email: 'user@example.com',
        userName: 'John Doe',
      },
    } as unknown as ConfigurationsService

    leadershipSvc = {
      shareTextMail: jest.fn(),
    } as unknown as LeadershipService

    // Mock the ViewChild elements
    const mockSuccessToast = { nativeElement: { value: 'Success' } }
    const mockErrorToast = { nativeElement: { value: 'Error' } }
    const mockNoValidIdsToast = { nativeElement: { value: 'No Valid IDs' } }

    // Create an instance of the component
    component = new SendMailDialogComponent(
      { emailTo: 'recipient@example.com', subject: 'Test Subject' } as IWsLeaderMailMeta,
      matSnackBar,
      configSvc,
      leadershipSvc
    )
    component.successToast = mockSuccessToast as any
    component.errorToast = mockErrorToast as any
    component.noValidIdsToast = mockNoValidIdsToast as any

    // Initialize component
    component.ngOnInit()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('sendMail', () => {
    it('should send the email and show success toast when the email is sent successfully', () => {
      // Arrange
      const mockForm = {
        resetForm: jest.fn(),
      }
      const mockResponse: IWsEmailResponse = {
        invalidIds: [],
        response: ''
      }
      leadershipSvc.shareTextMail = jest.fn().mockReturnValue(of(mockResponse))

      component.mailBodyText = 'Test email body'

      // Act
      component.sendMail(mockForm as any)

      // Assert
      // expect(leadershipSvc.shareTextMail).toHaveBeenCalledWith(expect.objectContaining({
      //   emailTo: [{ email: 'recipient@example.com' }],
      //   sharedBy: [{ email: 'user@example.com', name: 'John Doe' }],
      //   ccTo: [{ email: 'user@example.com', name: 'John Doe' }],
      //   body: { text: 'Test email body' },
      //   subject: 'Test Subject',
      // }));
      expect(mockForm.resetForm).toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith('Success')
      expect(component.mailSendInProgress).toBe(false)
    })

    it('should show no valid IDs toast when invalid IDs are returned from the server', () => {
      // Arrange
      const mockForm = {
        resetForm: jest.fn(),
      }
      const mockResponse: IWsEmailResponse = {
        invalidIds: ['invalid@example.com'],
        response: ''
      }
      leadershipSvc.shareTextMail = jest.fn().mockReturnValue(of(mockResponse))

      component.mailBodyText = 'Test email body'

      // Act
      component.sendMail(mockForm as any)

      // Assert
      expect(matSnackBar.open).toHaveBeenCalledWith('No Valid IDs')
      expect(component.mailSendInProgress).toBe(false)
    })

    it('should show error toast when the email sending fails', () => {
      // Arrange
      const mockForm = {
        resetForm: jest.fn(),
      }
      leadershipSvc.shareTextMail = jest.fn().mockReturnValue(throwError('Error'))

      component.mailBodyText = 'Test email body'

      // Act
      component.sendMail(mockForm as any)

      // Assert
      expect(matSnackBar.open).toHaveBeenCalledWith('Error')
      expect(component.mailSendInProgress).toBe(false)
    })
  })

  describe('constructor with null userProfile', () => {
    it('should handle null userProfile and sendMail with empty email/name', () => {
      const configSvcNoProfile = {
        userProfile: null,
      } as unknown as ConfigurationsService

      const comp = new SendMailDialogComponent(
        { emailTo: 'recipient@example.com', subject: 'Test Subject' } as IWsLeaderMailMeta,
        matSnackBar,
        configSvcNoProfile,
        leadershipSvc
      )
      comp.successToast = component.successToast
      comp.errorToast = component.errorToast
      comp.noValidIdsToast = component.noValidIdsToast

      expect(comp.userEmail).toBeUndefined()
      expect(comp.userName).toBeUndefined()

      // sendMail uses '' for email and name when undefined (covers ternary false branches)
      const mockForm = { resetForm: jest.fn() }
      const mockResponse: IWsEmailResponse = { invalidIds: [], response: '' };
      (leadershipSvc.shareTextMail as jest.Mock).mockReturnValue(of(mockResponse))
      comp.mailBodyText = 'Test body'
      comp.sendMail(mockForm as any)

      expect(mockForm.resetForm).toHaveBeenCalled()
      expect(comp.mailSendInProgress).toBe(false)
    })
  })
})
