import { RequestSuccessDialogComponent } from './request-success-dialog.component'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { Router } from '@angular/router'
describe('RequestSuccessDialogComponent', () => {
  let component: RequestSuccessDialogComponent
  let dialogRefMock: jest.Mocked<MatDialogRef<RequestSuccessDialogComponent>>
  let routerMock: jest.Mocked<Router>
  let data: any

  beforeEach(() => {
    // Mock dependencies
    dialogRefMock = {
      disableClose: true,
      close: jest.fn(),
    } as any

    routerMock = {
      navigate: jest.fn(),
    } as any

    // Mock input data
    data = {
      requestType: 'domain',
      apiResponse: {
        result: {
          msgCode: 'DOMAIN_REQUEST_CREATED',
        },
      },
    }

    // Initialize component with mocked dependencies
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit() // Manually trigger ngOnInit lifecycle method
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with correct headerMessage and body for DOMAIN_REQUEST_CREATED', () => {
    expect(component.headerMessage).toBe('Your domain request has been successfully submitted')
    expect(component.body).toBe(
      'We will reach out to you in the next 48 hours to help you. Resume self-registration process to see if you have all the other required details for the registration process.'
    )
  })

  it('should set the correct headerMessage and body for DOMAIN_APPROVED', () => {
    // Change msgCode to simulate different response
    data.apiResponse.result.msgCode = 'DOMAIN_APPROVED'
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit() // Trigger ngOnInit

    expect(component.headerMessage).toBe('This domain is already approved')
    expect(component.body).toBe(
      'The domain you are requesting approval for, is already approved. Resume self-registration process to see if you have all the other required details for the registration process.'
    )
  })

  it('should set the correct headerMessage and body for DOMAIN_REQUEST_ALREADY_PRESENT', () => {
    data.apiResponse.result.msgCode = 'DOMAIN_REQUEST_ALREADY_PRESENT'
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit()

    expect(component.headerMessage).toBe('This domain is pending for approval')
    expect(component.body).toBe(
      'Once the domain is approved, please resume self-registration process to see if you have all the other required details for the registration process.'
    )
  })

  it('should set the correct headerMessage and body for DOMAIN_REQUEST_REJECTED', () => {
    data.apiResponse.result.msgCode = 'DOMAIN_REQUEST_REJECTED'
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit()

    expect(component.headerMessage).toBe('This domain is rejected')
    expect(component.body).toBe('The domain you are requesting approval for, is rejected.')
  })

  it('should set the correct headerMessage and body for DOMAIN_REQUEST_ALREADY_RAISED', () => {
    data.apiResponse.result.msgCode = 'DOMAIN_REQUEST_ALREADY_RAISED'
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit()

    expect(component.headerMessage).toBe('This domain is already requested')
    expect(component.body).toContain('already pending for approval')
  })

  it('should leave headerMessage empty when domain reqType has no apiResponse result msgCode', () => {
    data.requestType = 'domain'
    data.apiResponse = null
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit()

    // no msgCode → inner if is false → headerMessage stays ''
    expect(component.headerMessage).toBe('')
  })

  it('should set the correct headerMessage and body for other request types', () => {
    data.requestType = 'user'
    component = new RequestSuccessDialogComponent(dialogRefMock, data, routerMock)
    component.ngOnInit()

    expect(component.headerMessage).toBe('Your user request has been successfully submitted')
    expect(component.body).toBe(
      'We will reach out to you in the next 48 hours to help you. Resume self-registration process to see if you have all the other required details for the registration process.'
    )
  })

  it('should close the dialog and navigate to /public/signup when closeDialog is called', () => {
    component.closeDialog()

    expect(dialogRefMock.close).toHaveBeenCalled()
    expect(routerMock.navigate).toHaveBeenCalledWith(['/public/signup'])
  })
})
