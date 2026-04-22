import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { of, throwError, Subscription, BehaviorSubject } from 'rxjs'
import * as _ from 'lodash'

import { ProfileVisibilitySettingsComponent } from './profile-visibility-settings.component'
import { SettingsService } from '../../settings.service'
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

// Mock services
const mockSettingsService = {
  fetchProfile: jest.fn(),
  updateProfileVisibility: jest.fn()
} as any

const mockConfigurationsService = {
  userProfileV2: {
    userId: 'test-user-id'
  }
} as any

const mockSnackBar = {
  open: jest.fn()
} as any

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
  instant: jest.fn((key: string) => key)
} as any

const mockMultilingualTranslationsService = {
  languageSelectedObservable: new BehaviorSubject<any>(null)
} as any

describe('ProfileVisibilitySettingsComponent', () => {
  let component: ProfileVisibilitySettingsComponent
  let fixture: ComponentFixture<ProfileVisibilitySettingsComponent>
  let settingsService: any
  let snackBar: any

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileVisibilitySettingsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
        { provide: MatLegacySnackBar, useValue: mockSnackBar },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MultilingualTranslationsService, useValue: mockMultilingualTranslationsService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ProfileVisibilitySettingsComponent)
    component = fixture.componentInstance
    settingsService = TestBed.inject(SettingsService)
    snackBar = TestBed.inject(MatLegacySnackBar)

    // Reset mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up subscriptions if any
    if (component.updateApiSubscription) {
      component.updateApiSubscription.unsubscribe()
    }
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set loadingDetails to true and call getUserDetails', () => {
      const getUserDetailsSpy = jest.spyOn(component, 'getUserDetails').mockImplementation(() => { })

      component.ngOnInit()

      expect(component.loadingDetails).toBe(true)
      expect(getUserDetailsSpy).toHaveBeenCalled()
    })
  })

  describe('getUserDetails', () => {
    it('should fetch user profile and set selectedVisibility on success', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 'private'
            }
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(component, 'getMapedValues').mockReturnValue('private')
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 'private'
        return defaultValue
      })

      component.getUserDetails()

      expect(settingsService.fetchProfile).toHaveBeenCalledWith('test-user-id')
      expect(component.selectedVisibility).toBe('private')
      expect(component.loadingDetails).toBe(false)
    })

    it('should set selectedVisibility to public and loadingDetails to false on error', () => {
      settingsService.fetchProfile.mockReturnValue(throwError('Error'))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('public')
      expect(component.loadingDetails).toBe(false)
    })

    it('should use default value when profilePreference is not found', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {}
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(component, 'getMapedValues').mockReturnValue('public')
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return defaultValue
        return defaultValue
      })

      component.getUserDetails()

      expect(component.getMapedValues).toHaveBeenCalledWith(0)
    })
  })

  describe('getMapedValues', () => {
    it('should return correct mapped value for string inputs', () => {
      expect(component.getMapedValues('public')).toBe(0)
      expect(component.getMapedValues('private')).toBe(1)
      expect(component.getMapedValues('connections')).toBe(10)
    })

    it('should return correct mapped value for number inputs', () => {
      expect(component.getMapedValues(0)).toBe('public')
      expect(component.getMapedValues(1)).toBe('private')
      expect(component.getMapedValues(10)).toBe('connections')
    })

    it('should return undefined for unmapped values', () => {
      expect(component.getMapedValues('invalid')).toBeUndefined()
      expect(component.getMapedValues(999)).toBeUndefined()
    })
  })

  describe('onVisibilityChange', () => {
    beforeEach(() => {
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')
    })

    it('should update profile visibility successfully', () => {
      const mockResponse = { success: true }
      settingsService.updateProfileVisibility.mockReturnValue(of(mockResponse))
      const getUserDetailsSpy = jest.spyOn(component, 'getUserDetails').mockImplementation(() => { })
      jest.spyOn(component, 'getMapedValues').mockReturnValue(1)

      component.onVisibilityChange('private')

      const expectedForm = {
        request: {
          userId: 'test-user-id',
          profileDetails: {
            profilePreference: 1
          }
        }
      }

      expect(settingsService.updateProfileVisibility).toHaveBeenCalledWith(expectedForm)
      expect(getUserDetailsSpy).toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith('Updated Successfully')
    })

    it('should handle update profile visibility error', () => {
      settingsService.updateProfileVisibility.mockReturnValue(throwError('Error'))
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      component.onVisibilityChange('public')

      expect(snackBar.open).toHaveBeenCalledWith('Something went wrong please try again later')
    })

    it('should unsubscribe existing subscription before making new request', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      } as any
      component.updateApiSubscription = mockSubscription

      settingsService.updateProfileVisibility.mockReturnValue(of({}))
      jest.spyOn(component, 'getMapedValues').mockReturnValue(10)

      component.onVisibilityChange('connections')

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should not call getUserDetails when response is falsy', () => {
      settingsService.updateProfileVisibility.mockReturnValue(of(null))
      const getUserDetailsSpy = jest.spyOn(component, 'getUserDetails').mockImplementation(() => { })
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      component.onVisibilityChange('public')

      expect(getUserDetailsSpy).not.toHaveBeenCalled()
      expect(snackBar.open).not.toHaveBeenCalledWith('Updated Successfully')
    })

    it('should handle all visibility options correctly', () => {
      settingsService.updateProfileVisibility.mockReturnValue(of({ success: true }))
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => { })

      // Test public
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)
      component.onVisibilityChange('public')
      let expectedForm = {
        request: {
          userId: 'test-user-id',
          profileDetails: { profilePreference: 0 }
        }
      }
      expect(settingsService.updateProfileVisibility).toHaveBeenCalledWith(expectedForm)

      // Test private
      jest.spyOn(component, 'getMapedValues').mockReturnValue(1)
      component.onVisibilityChange('private')
      expectedForm = {
        request: {
          userId: 'test-user-id',
          profileDetails: { profilePreference: 1 }
        }
      }
      expect(settingsService.updateProfileVisibility).toHaveBeenCalledWith(expectedForm)

      // Test connections
      jest.spyOn(component, 'getMapedValues').mockReturnValue(10)
      component.onVisibilityChange('connections')
      expectedForm = {
        request: {
          userId: 'test-user-id',
          profileDetails: { profilePreference: 10 }
        }
      }
      expect(settingsService.updateProfileVisibility).toHaveBeenCalledWith(expectedForm)
    })
  })

  describe('component properties', () => {
    it('should have correct initial values', () => {
      expect(component.selectedVisibility).toBe('public')
      expect(component.loadingDetails).toBe(false)
      expect(component.updateApiSubscription).toBeUndefined()
    })
  })

  describe('subscription management', () => {
    it('should handle subscription lifecycle correctly', () => {
      const mockSubscription = new Subscription()
      const unsubscribeSpy = jest.spyOn(mockSubscription, 'unsubscribe')

      settingsService.updateProfileVisibility.mockReturnValue(of({}))
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      // First call creates subscription
      component.onVisibilityChange('public')
      expect(component.updateApiSubscription).toBeDefined()

      // Mock the subscription
      component.updateApiSubscription = mockSubscription

      // Second call should unsubscribe first
      component.onVisibilityChange('private')
      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('ngOnInit - language handling', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => { })
      localStorage.clear()
    })

    it('should subscribe to languageSelectedObservable', () => {
      component.ngOnInit()

      expect(mockMultilingualTranslationsService.languageSelectedObservable.subscribe).toBeDefined()
    })

    it('should set default language to hi and switch to en when websiteLanguage exists in observable', () => {
      localStorage.setItem('websiteLanguage', 'en')

      component.ngOnInit()

      // Trigger language change
      mockMultilingualTranslationsService.languageSelectedObservable.next({})

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('hi')
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('en')
    })

    it('should only set hi language when no websiteLanguage in localStorage in observable', () => {
      component.ngOnInit()

      mockMultilingualTranslationsService.languageSelectedObservable.next({})

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('hi')
    })

    it('should set language from localStorage on init', () => {
      localStorage.setItem('websiteLanguage', 'hi')

      component.ngOnInit()

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('hi')
    })

    it('should not call translate.use when no websiteLanguage in localStorage', () => {
      const useSpy = mockTranslateService.use

      component.ngOnInit()

      // Should only be called from observable subscription, not from init
      expect(useSpy).not.toHaveBeenCalled()
    })
  })

  describe('getUserDetails - additional coverage', () => {
    it('should handle numeric profilePreference value 0', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 0
            }
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 0
        return defaultValue
      })

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('public')
      expect(component.loadingDetails).toBe(false)
    })

    it('should handle numeric profilePreference value 1', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 1
            }
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 1
        return defaultValue
      })

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('private')
    })

    it('should handle numeric profilePreference value 10', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 10
            }
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 10
        return defaultValue
      })

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('connections')
    })

    it('should use default value 0 when profilePreference is undefined', () => {
      const mockResponse = {
        result: {
          response: {
            profileDetails: {}
          }
        }
      }

      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return defaultValue
        return defaultValue
      })

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('public')
    })
  })

  describe('onVisibilityChange - additional coverage', () => {
    it('should not show success message when response is undefined', () => {
      settingsService.updateProfileVisibility.mockReturnValue(of(undefined))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      component.onVisibilityChange('public')

      expect(snackBar.open).not.toHaveBeenCalledWith('Updated Successfully')
    })

    it('should not show success message when response is false', () => {
      settingsService.updateProfileVisibility.mockReturnValue(of(false))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      component.onVisibilityChange('public')

      expect(snackBar.open).not.toHaveBeenCalledWith('Updated Successfully')
    })

    it('should handle error with error object', () => {
      const error = new Error('Network error')
      settingsService.updateProfileVisibility.mockReturnValue(throwError(error))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')
      jest.spyOn(component, 'getMapedValues').mockReturnValue(1)

      component.onVisibilityChange('private')

      expect(snackBar.open).toHaveBeenCalledWith('Something went wrong please try again later')
    })

    it('should create new subscription when updateApiSubscription is undefined', () => {
      component.updateApiSubscription = undefined
      settingsService.updateProfileVisibility.mockReturnValue(of({ success: true }))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')
      jest.spyOn(component, 'getMapedValues').mockReturnValue(10)

      component.onVisibilityChange('connections')

      expect(component.updateApiSubscription).toBeDefined()
    })
  })

  describe('getMapedValues - edge cases', () => {
    it('should handle null value', () => {
      expect(component.getMapedValues(null as any)).toBeUndefined()
    })

    it('should handle empty string', () => {
      expect(component.getMapedValues('')).toBeUndefined()
    })

    it('should handle negative numbers', () => {
      expect(component.getMapedValues(-1)).toBeUndefined()
    })

    it('should handle large numbers', () => {
      expect(component.getMapedValues(9999)).toBeUndefined()
    })

    it('should handle boolean values', () => {
      expect(component.getMapedValues(true as any)).toBeUndefined()
      expect(component.getMapedValues(false as any)).toBeUndefined()
    })
  })

  describe('component integration tests', () => {
    it('should handle complete visibility change flow from public to private', () => {
      // Start with public
      component.selectedVisibility = 'public'

      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 1
            }
          }
        }
      }

      settingsService.updateProfileVisibility.mockReturnValue(of({ success: true }))
      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 1
        return defaultValue
      })

      component.onVisibilityChange('private')

      expect(component.selectedVisibility).toBe('private')
    })

    it('should handle complete visibility change flow from private to connections', () => {
      component.selectedVisibility = 'private'

      const mockResponse = {
        result: {
          response: {
            profileDetails: {
              profilePreference: 10
            }
          }
        }
      }

      settingsService.updateProfileVisibility.mockReturnValue(of({ success: true }))
      settingsService.fetchProfile.mockReturnValue(of(mockResponse))
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return 10
        return defaultValue
      })

      component.onVisibilityChange('connections')

      expect(component.selectedVisibility).toBe('connections')
    })

    it('should maintain loading state during API call', () => {
      settingsService.fetchProfile.mockReturnValue(of({
        result: { response: { profileDetails: { profilePreference: 0 } } }
      }))
      jest.spyOn(_, 'get').mockReturnValue('test-user-id')

      component.loadingDetails = true
      component.getUserDetails()

      expect(component.loadingDetails).toBe(false)
    })
  })

  describe('constructor', () => {
    it('should inject all dependencies', () => {
      expect(component['settingsService']).toBeDefined()
      expect(component['configSvc']).toBeDefined()
      expect(component['snackBar']).toBeDefined()
      expect(component['translateService']).toBeDefined()
      expect(component['langtranslations']).toBeDefined()
    })
  })

  describe('error scenarios', () => {
    it('should handle getUserDetails when userId is null', () => {
      jest.spyOn(_, 'get').mockReturnValue(null)
      settingsService.fetchProfile.mockReturnValue(of({
        result: { response: { profileDetails: { profilePreference: 0 } } }
      }))

      component.getUserDetails()

      expect(settingsService.fetchProfile).toHaveBeenCalledWith(null)
    })

    it('should handle getUserDetails when response structure is malformed', () => {
      jest.spyOn(_, 'get').mockImplementation((_: any, path: _.PropertyPath, defaultValue?: any) => {
        if (path === 'userProfileV2.userId') return 'test-user-id'
        if (path === 'result.response.profileDetails.profilePreference') return defaultValue
        return defaultValue
      })
      settingsService.fetchProfile.mockReturnValue(of({ malformed: 'response' }))

      component.getUserDetails()

      expect(component.selectedVisibility).toBe('public')
    })

    it('should handle onVisibilityChange when userId is null', () => {
      jest.spyOn(_, 'get').mockReturnValue(null)
      settingsService.updateProfileVisibility.mockReturnValue(of({ success: true }))
      jest.spyOn(component, 'getMapedValues').mockReturnValue(0)

      component.onVisibilityChange('public')

      const expectedForm = {
        request: {
          userId: null,
          profileDetails: {
            profilePreference: 0
          }
        }
      }

      expect(settingsService.updateProfileVisibility).toHaveBeenCalledWith(expectedForm)
    })
  })
})