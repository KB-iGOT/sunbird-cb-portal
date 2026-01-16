import { ProfileVerificationDialogComponent, ProfileVerificationData } from './profile-verification-dialog.component'

describe('ProfileVerificationDialogComponent', () => {
  let component: ProfileVerificationDialogComponent

  const dialogRefMock = {
    close: jest.fn(),
  } as any

  const routerMock = {
    navigate: jest.fn(),
  } as any

  const buildConfigSvc = (userProfile: any) => ({
    userProfile,
  }) as any

  const baseData: ProfileVerificationData = {
    organization: 'Org',
    designation: 'Designation',
    email: 'user@example.com',
    mobile: '9999999999',
    userProfile: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create with ministry/state type and set organization', () => {
    const userProfile = {
      userRootOrg: {
        ministryOrStateType: 'Ministry',
      },
    }

    const configSvcMock = buildConfigSvc(userProfile)

    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    expect(component).toBeTruthy()
    expect(component.userOrganization).toEqual(userProfile.userRootOrg)
    expect(component.ministryOrStateType).toBe('ministry')
  })

  it('should default ministryOrStateType to spv when not present', () => {
    const userProfile = {
      userRootOrg: {},
    }
    const configSvcMock = buildConfigSvc(userProfile)

    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    expect(component.userOrganization).toEqual(userProfile.userRootOrg)
    expect(component.ministryOrStateType).toBe('spv')
  })

  it('should keep defaults when userProfile is not available', () => {
    const configSvcMock = buildConfigSvc(undefined)

    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    expect(component.userOrganization).toBeUndefined()
    expect(component.ministryOrStateType).toBe('spv')
  })

  it('should close dialog with verify action on onVerify', () => {
    const configSvcMock = buildConfigSvc(undefined)
    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    component.onVerify()

    expect(dialogRefMock.close).toHaveBeenCalledWith({ action: 'verify' })
  })

  it('should close dialog and navigate on onUpdateProfile', () => {
    const configSvcMock = buildConfigSvc(undefined)
    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    component.onUpdateProfile()

    expect(dialogRefMock.close).toHaveBeenCalledWith({ action: 'update' })
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/person-profile'])
  })

  it('should close dialog with close action on onClose', () => {
    const configSvcMock = buildConfigSvc(undefined)
    component = new ProfileVerificationDialogComponent(
      baseData,
      dialogRefMock,
      routerMock,
      configSvcMock
    )

    component.onClose()

    expect(dialogRefMock.close).toHaveBeenCalledWith({ action: 'close' })
  })
})
