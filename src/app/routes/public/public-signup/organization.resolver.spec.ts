
import { SignupService } from './signup.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { AppPublicOrganizationResolver } from './organization.resolver'

// Mocking the dependencies
jest.mock('./signup.service')
jest.mock('@angular/material/snack-bar')

describe('AppPublicOrganizationResolver', () => {
  let resolver: AppPublicOrganizationResolver
  let signupServiceMock: jest.Mocked<SignupService>
  let snackBarMock: jest.Mocked<MatSnackBar>

  beforeEach(() => {
    signupServiceMock = new SignupService(null as any) as jest.Mocked<SignupService>
    snackBarMock = new MatSnackBar(null as any, null as any, null as any, null as any, null as any, null as any) as jest.Mocked<MatSnackBar>
    resolver = new AppPublicOrganizationResolver(signupServiceMock, snackBarMock)
  })

  it('should return empty organization details and designations list if no orgId in route', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue(null), // No orgId
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      done()
    })
  })


  it('should handle invalid registration link (link not active)', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue('123'),
      },
      params: {
        qrCodeId: 'qr123',
        orgId: '123',
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    // Mocking the service call for registration link status
    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Failed', errmsg: 'Registration link is not active' } })
    )

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      // expect(result.invalidLinkMessage).toBe('Registration link is not active');
      done()
    })
  })

  it('should handle registration link failure with a different error message', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue('123'),
      },
      params: {
        qrCodeId: 'qr123',
        orgId: '123',
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    // Mocking the service call for registration link status
    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Failed', errmsg: 'Some other error' } })
    )

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      //  expect(result.invalidLinkMessage).toBe('Some other error');
      done()
    })
  })

  it('should fetch organization details and designations when registration link is valid', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue('123'),
      },
      params: {
        qrCodeId: 'qr123',
        orgId: '123',
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    // Mocking the service call for registration link status
    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Success' } })
    )

    // Mocking the service call for organization data
    const mockOrgData = { frameworkid: 'framework123' }
    signupServiceMock.getOrgReadData.mockReturnValue(of(mockOrgData))

    // Mocking the framework data
    const mockFrameworkData = {
      result: {
        framework: {
          categories: [
            {
              code: 'org',
              terms: [
                {
                  children: [{ name: 'Designation 1' }, { name: 'Designation 2' }],
                },
              ],
            },
          ],
        },
      },
    }
    signupServiceMock.getFrameworkInfo.mockReturnValue(of(mockFrameworkData))

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(result.organizationDetails).toEqual(mockOrgData)
      expect(result.designationsList).toEqual([{ name: 'Designation 1' }, { name: 'Designation 2' }])
      done()
    })
  })

  it('should show error snack bar when organization data is not available', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue('123'),
      },
      params: {
        qrCodeId: 'qr123',
        orgId: '123',
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    // Mocking the service call for registration link status
    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Success' } })
    )

    // Mocking the service call for organization data
    signupServiceMock.getOrgReadData.mockReturnValue(of(null))

    resolver.resolve(routeMock, stateMock).subscribe(() => {
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Oops! The registration link seems to be invalid. Please double-check the link or request a new one.',
        'X',
        { duration: 20000, panelClass: ['error'] }
      )
      done()
    })
  })

  it('should handle error in getFrameworkInfo call', (done) => {
    const routeMock = {
      paramMap: {
        get: jest.fn().mockReturnValue('123'),
      },
      params: {
        qrCodeId: 'qr123',
        orgId: '123',
      },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    // Mocking the service call for registration link status
    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Success' } })
    )

    // Mocking the service call for organization data
    signupServiceMock.getOrgReadData.mockReturnValue(of({ frameworkid: 'framework123' }))

    // Mocking error in framework data retrieval
    signupServiceMock.getFrameworkInfo.mockReturnValue(throwError('Error fetching framework'))

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      done()
    })
  })

  it('should show snackbar when organization has no frameworkid', (done) => {
    const routeMock = {
      paramMap: { get: jest.fn().mockReturnValue('123') },
      params: { qrCodeId: 'qr123', orgId: '123' },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Success' } })
    )
    signupServiceMock.getOrgReadData.mockReturnValue(of({ name: 'OrgWithoutFramework' }))

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Designations not available for this organization',
        'X',
        { duration: 20000, panelClass: ['error'] }
      )
      expect(result.designationsList).toEqual([])
      done()
    })
  })

  it('should handle error in getOrgReadData call', (done) => {
    const routeMock = {
      paramMap: { get: jest.fn().mockReturnValue('123') },
      params: { qrCodeId: 'qr123', orgId: '123' },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      of({ params: { status: 'Success' } })
    )
    signupServiceMock.getOrgReadData.mockReturnValue(
      throwError({ error: { params: { errmsg: 'Org fetch failed' } } })
    )

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(snackBarMock.open).toHaveBeenCalled()
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      done()
    })
  })

  it('should handle error in getRegistrationLinkStatus call', (done) => {
    const routeMock = {
      paramMap: { get: jest.fn().mockReturnValue('123') },
      params: { qrCodeId: 'qr123', orgId: '123' },
    } as unknown as ActivatedRouteSnapshot
    const stateMock = {} as RouterStateSnapshot

    signupServiceMock.getRegistrationLinkStatus.mockReturnValue(
      throwError({ error: { params: { errmsg: 'Link status error' } } })
    )

    resolver.resolve(routeMock, stateMock).subscribe((result) => {
      expect(snackBarMock.open).toHaveBeenCalled()
      expect(result.organizationDetails).toBeNull()
      expect(result.designationsList).toEqual([])
      done()
    })
  })
})
