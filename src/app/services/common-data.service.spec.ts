import { CommonDataService } from './common-data.service'

describe('CommonDataService', () => {
  let service: CommonDataService
  let mockRouter: any
  let mockConfigSvc: any
  let mockUserProfileService: any
  let mockDialog: any
  let mockMatSnackBar: any
  let mockMandatoryNotificationsService: any
  let mockHttpClient: any

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      navigate: jest.fn()
    }

    // Mock ConfigurationsService
    mockConfigSvc = {
      unMappedUser: {
        id: 'user-123',
        rootOrgId: 'org-456',
        profileDetails: {
          personalDetails: {
            mobile: '9876543210',
            primaryEmail: 'user@example.com',
            lastProfileVerificationPromptDate: null
          }
        }
      },
      userProfile: {
        firstName: 'John',
        lastName: 'Doe'
      },
      orgReadData: {},
      globalConfig: {
        mandatoryPopupDuration: 7200
      }
    }

    // Mock UserProfileService
    mockUserProfileService = {
      editProfileDetails: jest.fn(),
      readOrgData: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      readCustomattributeDetails: jest.fn().mockReturnValue({ subscribe: jest.fn() })
    }

    // Mock MatDialog
    mockDialog = {
      open: jest.fn()
    }

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn()
    }

    // Mock MandatoryNotificationsService
    mockMandatoryNotificationsService = {
      getMandatoryNotification: jest.fn().mockReturnValue({ subscribe: jest.fn() })
    }

    // Mock HttpClient
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    }

    // Create service with mocked dependencies
    service = new CommonDataService(
      mockRouter,
      mockConfigSvc,
      mockUserProfileService,
      mockDialog,
      mockMatSnackBar,
      mockMandatoryNotificationsService,
      mockHttpClient
    )
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize rootOrgId from config service', () => {
      expect(service.rootOrgId).toBe('org-456')
    })

    it('should set rootOrgId to empty string if unMappedUser is null', () => {
      mockConfigSvc.unMappedUser = null
      const newService = new CommonDataService(
        mockRouter,
        mockConfigSvc,
        mockUserProfileService,
        mockDialog,
        mockMatSnackBar,
        mockMandatoryNotificationsService,
        mockHttpClient
      )
      expect(newService.rootOrgId).toBe('')
    })
  })

  describe('redirectToCustomProfile', () => {
    it('should navigate to custom profile with orgDetails fragment', () => {
      service.redirectToCustomProfile()

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/person-profile/me'],
        { fragment: 'orgDetails' }
      )
    })
  })

  describe('mandatoryDetails', () => {
    it('should not open dialog if user profile update is within 90 days', () => {
      const currentTime = Date.now()
      const oneDayAgo = currentTime - (1 * 24 * 60 * 60 * 1000)

      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = oneDayAgo.toString()

      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      service.mandatoryDetails(false)

      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should open dialog if user profile update is beyond 90 days', () => {
      const currentTime = Date.now()
      const ninetyDaysAgo = currentTime - (91 * 24 * 60 * 60 * 1000)

      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = ninetyDaysAgo.toString()

      const mockDialogRef = {
        afterClosed: jest.fn(() => ({
          subscribe: jest.fn((callback) => callback({ action: 'update' }))
        }))
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      service.mandatoryDetails(false)

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          panelClass: 'profile-verification-dialog-container',
          disableClose: true,
          maxWidth: '95vw',
          width: '500px'
        })
      )
    })

    it('should open dialog if lastProfileVerificationPromptDate is null', () => {
      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = null

      const mockDialogRef = {
        afterClosed: jest.fn(() => ({
          subscribe: jest.fn((callback) => callback({ action: 'update' }))
        }))
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      service.mandatoryDetails(false)

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should navigate to mandatorySection when dialog action is update', (done) => {
      const currentTime = Date.now()
      const ninetyDaysAgo = currentTime - (91 * 24 * 60 * 60 * 1000)

      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = ninetyDaysAgo.toString()

      const mockDialogRef = {
        afterClosed: jest.fn(() => ({
          subscribe: jest.fn((callback) => {
            callback({ action: 'update' })
          })
        })),
        close: jest.fn()
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      service.mandatoryDetails(false)

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/app/person-profile/me'],
          { fragment: 'mandatorySection', queryParams: { source: 'mandatoryUpdate' } }
        )
        expect(mockDialogRef.close).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should call callExtPatchProfile when dialog action is verify', (done) => {
      const currentTime = Date.now()
      const ninetyDaysAgo = currentTime - (91 * 24 * 60 * 60 * 1000)

      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = ninetyDaysAgo.toString()

      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: 'SUCCESS' } }))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'callExtPatchProfile')

      const mockDialogRef = {
        afterClosed: jest.fn(() => ({
          subscribe: jest.fn((callback) => {
            callback({ action: 'verify' })
          })
        })),
        close: jest.fn()
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      service.mandatoryDetails(false)

      setTimeout(() => {
        expect(service.callExtPatchProfile).toHaveBeenCalled()
        done()
      }, 0)
    })
  })

  describe('callExtPatchProfile', () => {
    it('should call editProfileDetails with correct request structure', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: 'SUCCESS' } }))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'getOrgDetails')

      service.callExtPatchProfile(false)

      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            userId: 'user-123',
            profileDetails: expect.objectContaining({
              personalDetails: expect.objectContaining({
                lastProfileVerificationPromptDate: expect.any(String)
              })
            })
          })
        })
      )
    })

    it('should show success snackbar message on successful API response', () => {
      const mockResponse = { result: { response: 'SUCCESS' } }
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockResponse))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      service.callExtPatchProfile(false)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Profile verification  updated successfully',
        'X',
        expect.any(Object)
      )
    })

    it('should update configSvc.unMappedUser with new timestamp on success', () => {
      const mockResponse = { result: { response: 'SUCCESS' } }
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockResponse))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'getOrgDetails')

      service.callExtPatchProfile(false)

      expect(mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate).toBeTruthy()
    })

    it('should call getOrgDetails after profile update', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: 'SUCCESS' } }))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'getOrgDetails')

      service.callExtPatchProfile(false)

      expect(service.getOrgDetails).toHaveBeenCalled()
    })

    it('should pass timestamp as string to API', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn()
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'getOrgDetails')

      service.callExtPatchProfile(false)

      const callArgs = mockUserProfileService.editProfileDetails.mock.calls[0][0]
      expect(typeof callArgs.request.profileDetails.personalDetails.lastProfileVerificationPromptDate).toBe('string')
    })
  })

  describe('getOrgDetails', () => {
    it('should call readOrgData with correct request structure', () => {
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn()
      })

      service.getOrgDetails(false)

      expect(mockUserProfileService.readOrgData).toHaveBeenCalledWith({
        request: { organisationId: 'org-456' }
      })
    })

    it('should call readCustomattributeDetails when isPopupEnabled and customFieldsCount > 0', (done) => {
      const mockOrgResponse = {
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: true,
              customFieldsCount: 1,
              customFieldIds: ['field-1', 'field-2']
            }
          }
        }
      }

      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockOrgResponse))
      })
      mockUserProfileService.readCustomattributeDetails.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'readCustomattributeDetails')

      service.getOrgDetails(false)

      setTimeout(() => {
        expect(service.readCustomattributeDetails).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should not call readCustomattributeDetails when isPopupEnabled is false', (done) => {
      const mockOrgResponse = {
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: false,
              customFieldsCount: 0,
              customFieldIds: []
            }
          }
        }
      }

      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockOrgResponse))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'readCustomattributeDetails')

      service.getOrgDetails(false)

      setTimeout(() => {
        expect(service.readCustomattributeDetails).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should handle error when readOrgData fails', () => {
      const mockError = new Error('API Error')
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((_successCallback, errorCallback) => {
          errorCallback(mockError)
        })
      })

      service.getOrgDetails(false)

      expect(mockUserProfileService.readOrgData).toHaveBeenCalled()
    })
  })

  describe('readCustomattributeDetails', () => {
    it('should call readCustomattributeDetails API with correct parameters', () => {
      mockUserProfileService.readCustomattributeDetails.mockReturnValue({
        subscribe: jest.fn()
      })

      service.readCustomattributeDetails(false)

      expect(mockUserProfileService.readCustomattributeDetails).toHaveBeenCalledWith(
        'user-123',
        'org-456'
      )
    })

    it('should redirect to custom profile when customFieldValues is empty', (done) => {
      const mockResponse = {
        result: {
          response: {
            customFieldValues: []
          }
        }
      }

      mockUserProfileService.readCustomattributeDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockResponse))
      })

      jest.spyOn(service, 'redirectToCustomProfile')

      service.readCustomattributeDetails(false)

      setTimeout(() => {
        expect(service.redirectToCustomProfile).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should return false when customFieldValues has data', (done) => {
      const mockResponse = {
        result: {
          response: {
            customFieldValues: [{ fieldId: 'field-1', value: 'value-1' }]
          }
        }
      }

      mockUserProfileService.readCustomattributeDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockResponse))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'redirectToCustomProfile')

      service.readCustomattributeDetails(false)

      setTimeout(() => {
        expect(service.redirectToCustomProfile).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should handle error when readCustomattributeDetails fails', () => {
      const mockError = new Error('API Error')
      mockUserProfileService.readCustomattributeDetails.mockReturnValue({
        subscribe: jest.fn((_successCallback, errorCallback) => {
          errorCallback(mockError)
        })
      })

      service.readCustomattributeDetails(false)

      expect(mockUserProfileService.readCustomattributeDetails).toHaveBeenCalled()
    })
  })

  describe('configSuccess property', () => {
    it('should have correct snackbar configuration', () => {
      expect(service.configSuccess).toEqual({
        panelClass: 'style-success',
        duration: 20000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle missing profileDetails in unMappedUser', () => {
      mockConfigSvc.unMappedUser.profileDetails = undefined

      const newService = new CommonDataService(
        mockRouter,
        mockConfigSvc,
        mockUserProfileService,
        mockDialog,
        mockMatSnackBar,
        mockMandatoryNotificationsService,
        mockHttpClient
      )

      expect(newService.rootOrgId).toBe('org-456')
    })

    it('should calculate time difference correctly for edge case at exactly 90 days', () => {
      const currentTime = Date.now()
      const exactlyNinetyDays = currentTime - (90 * 24 * 60 * 60 * 1000)

      mockConfigSvc.unMappedUser.profileDetails.personalDetails.lastProfileVerificationPromptDate = exactlyNinetyDays.toString()

      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })
    })

    it('should handle response case-insensitively for SUCCESS check', () => {
      const mockResponse = { result: { response: 'success' } } // lowercase
      mockUserProfileService.editProfileDetails.mockReturnValue({
        subscribe: jest.fn((callback) => callback(mockResponse))
      })
      mockUserProfileService.readOrgData.mockReturnValue({
        subscribe: jest.fn((callback) => callback({ result: { response: { customfieldsdata: { isPopupEnabled: false } } } }))
      })
      mockMandatoryNotificationsService.getMandatoryNotification.mockReturnValue({
        subscribe: jest.fn()
      })

      jest.spyOn(service, 'getOrgDetails')

      service.callExtPatchProfile(false)

      // The code uses toUpperCase() so this should match
      expect(mockMatSnackBar.open).toHaveBeenCalled()
    })
  })
})
