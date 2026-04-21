/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SettingsService } from './settings.service'
import { of } from 'rxjs'

describe('SettingsService', () => {
  let service: SettingsService
  let mockHttpClient: any

  const mockNotificationGroups = [
    {
      groupId: 'group1',
      groupName: 'Email Notifications',
      notifications: [
        {
          notificationId: 'notif1',
          notificationName: 'New Messages',
          enabled: true,
        },
      ],
    },
    {
      groupId: 'group2',
      groupName: 'SMS Notifications',
      notifications: [
        {
          notificationId: 'notif2',
          notificationName: 'Updates',
          enabled: false,
        },
      ],
    },
  ]

  const mockNotificationPreference = {
    result: {
      response: {
        value: {
          preferenceData: {
            email: true,
            sms: false,
            push: true,
          },
        },
      },
    },
  }

  const mockProfile = {
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    userName: 'johndoe',
  }

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    }

    service = new SettingsService(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeDefined()
    })

    it('should inject HttpClient', () => {
      expect(mockHttpClient).toBeDefined()
    })
  })

  describe('fetchNotificationSettings', () => {
    it('should call http.get with correct endpoint', () => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationGroups))

      service.fetchNotificationSettings()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications/settings'
      )
    })

    it('should return notification groups', (done) => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationGroups))

      service.fetchNotificationSettings().subscribe((result) => {
        expect(result).toEqual(mockNotificationGroups)
        expect(result.length).toBe(2)
        done()
      })
    })

    it('should handle empty notification groups', (done) => {
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchNotificationSettings().subscribe((result) => {
        expect(result).toEqual([])
        expect(result.length).toBe(0)
        done()
      })
    })

    it('should propagate http errors', (done) => {
      const error = new Error('Network error')
      mockHttpClient.get.mockReturnValue(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.fetchNotificationSettings().subscribe(
        () => fail('Should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })
  })

  describe('updateNotificationSettings', () => {
    it('should call http.patch with correct endpoint and body', () => {
      mockHttpClient.patch.mockReturnValue(of({ success: true }))

      service.updateNotificationSettings(mockNotificationGroups)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications/settings',
        mockNotificationGroups
      )
    })

    it('should return update response', (done) => {
      const response = { success: true, message: 'Updated successfully' }
      mockHttpClient.patch.mockReturnValue(of(response))

      service.updateNotificationSettings(mockNotificationGroups).subscribe((result) => {
        expect(result).toEqual(response)
        expect(result.success).toBe(true)
        done()
      })
    })

    it('should handle empty body', () => {
      mockHttpClient.patch.mockReturnValue(of({ success: true }))

      service.updateNotificationSettings([])

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications/settings',
        []
      )
    })

    it('should propagate http errors', (done) => {
      const error = new Error('Update failed')
      mockHttpClient.patch.mockReturnValue(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.updateNotificationSettings(mockNotificationGroups).subscribe(
        () => fail('Should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })
  })

  describe('fetchNotificationPreference', () => {
    it('should call http.get with correct endpoint', () => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationPreference))

      service.fetchNotificationPreference()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/data/v1/system/settings/get/notificationPreference'
      )
    })

    it('should return notification preference', (done) => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationPreference))

      service.fetchNotificationPreference().subscribe((result) => {
        expect(result).toEqual(mockNotificationPreference)
        expect(result.result).toBeDefined()
        done()
      })
    })

    it('should handle null preference', (done) => {
      mockHttpClient.get.mockReturnValue(of(null))

      service.fetchNotificationPreference().subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })
  })

  describe('fetchUserNotificationPreference', () => {
    it('should call http.get with correct endpoint', () => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationGroups))

      service.fetchUserNotificationPreference()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/notificationPreference'
      )
    })

    it('should return user notification preference', (done) => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationGroups))

      service.fetchUserNotificationPreference().subscribe((result) => {
        expect(result).toEqual(mockNotificationGroups)
        done()
      })
    })

    it('should handle empty preferences', (done) => {
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchUserNotificationPreference().subscribe((result) => {
        expect(result).toEqual([])
        done()
      })
    })
  })

  describe('updateUserNotificationPreference', () => {
    it('should call http.post with correct endpoint and request', () => {
      const request = { preferences: mockNotificationGroups }
      mockHttpClient.post.mockReturnValue(of(mockNotificationGroups))

      service.updateUserNotificationPreference(request)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/notificationPreference',
        request
      )
    })

    it('should return updated preferences', (done) => {
      const request = { preferences: mockNotificationGroups }
      mockHttpClient.post.mockReturnValue(of(mockNotificationGroups))

      service.updateUserNotificationPreference(request).subscribe((result) => {
        expect(result).toEqual(mockNotificationGroups)
        done()
      })
    })

    it('should handle empty request', () => {
      const request = {}
      mockHttpClient.post.mockReturnValue(of([]))

      service.updateUserNotificationPreference(request)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/notificationPreference',
        request
      )
    })

    it('should handle null request', () => {
      mockHttpClient.post.mockReturnValue(of([]))

      service.updateUserNotificationPreference(null)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/notificationPreference',
        null
      )
    })
  })

  describe('getSettings', () => {
    it('should call http.get with correct endpoint', () => {
      const settings = { notifications: true, theme: 'dark' }
      mockHttpClient.get.mockReturnValue(of(settings))

      service.getSettings()

      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/notificationSetting/read')
    })

    it('should return settings', (done) => {
      const settings = { notifications: true, theme: 'dark' }
      mockHttpClient.get.mockReturnValue(of(settings))

      service.getSettings().subscribe((result) => {
        expect(result).toEqual(settings)
        expect(result.notifications).toBe(true)
        done()
      })
    })

    it('should handle empty settings', (done) => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.getSettings().subscribe((result) => {
        expect(result).toEqual({})
        done()
      })
    })

    it('should handle null settings', (done) => {
      mockHttpClient.get.mockReturnValue(of(null))

      service.getSettings().subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })
  })

  describe('enableNotification', () => {
    it('should call http.post with correct endpoint and request', () => {
      const request = { notificationId: 'notif1', enabled: true }
      mockHttpClient.post.mockReturnValue(of({ success: true }))

      service.enableNotification(request)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/notificationSetting/upsert',
        request
      )
    })

    it('should return success response', (done) => {
      const request = { notificationId: 'notif1', enabled: true }
      const response = { success: true, message: 'Notification enabled' }
      mockHttpClient.post.mockReturnValue(of(response))

      service.enableNotification(request).subscribe((result) => {
        expect(result).toEqual(response)
        expect(result.success).toBe(true)
        done()
      })
    })

    it('should handle disable request', () => {
      const request = { notificationId: 'notif1', enabled: false }
      mockHttpClient.post.mockReturnValue(of({ success: true }))

      service.enableNotification(request)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/notificationSetting/upsert',
        request
      )
    })

    it('should handle empty request', () => {
      mockHttpClient.post.mockReturnValue(of({ success: false }))

      service.enableNotification({})

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/notificationSetting/upsert',
        {}
      )
    })
  })

  describe('fetchProfile', () => {
    it('should call http.get with correct endpoint and userId', () => {
      mockHttpClient.get.mockReturnValue(of(mockProfile))

      service.fetchProfile('user-123')

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/profile/v1/basic/user-123'
      )
    })

    it('should return user profile', (done) => {
      mockHttpClient.get.mockReturnValue(of(mockProfile))

      service.fetchProfile('user-123').subscribe((result) => {
        expect(result).toEqual(mockProfile)
        expect(result.userId).toBe('user-123')
        expect(result.firstName).toBe('John')
        done()
      })
    })

    it('should handle different userId', () => {
      mockHttpClient.get.mockReturnValue(of(mockProfile))

      service.fetchProfile('user-456')

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/profile/v1/basic/user-456'
      )
    })

    it('should handle empty userId', () => {
      mockHttpClient.get.mockReturnValue(of(null))

      service.fetchProfile('')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/user/profile/v1/basic/')
    })

    it('should propagate http errors', (done) => {
      const error = new Error('User not found')
      mockHttpClient.get.mockReturnValue(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.fetchProfile('user-123').subscribe(
        () => fail('Should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })
  })

  describe('updateProfileVisibility', () => {
    it('should call http.post with correct endpoint and form', () => {
      const form = { visibility: 'public', profileFields: ['email', 'phone'] }
      mockHttpClient.post.mockReturnValue(of({ success: true }))

      service.updateProfileVisibility(form)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        form
      )
    })

    it('should return update response', (done) => {
      const form = { visibility: 'private' }
      const response = { success: true, message: 'Profile updated' }
      mockHttpClient.post.mockReturnValue(of(response))

      service.updateProfileVisibility(form).subscribe((result) => {
        expect(result).toEqual(response)
        expect(result.success).toBe(true)
        done()
      })
    })

    it('should handle complex form data', () => {
      const form = {
        visibility: 'friends',
        profileFields: ['email', 'phone', 'address'],
        preferences: {
          showEmail: true,
          showPhone: false,
        },
      }
      mockHttpClient.post.mockReturnValue(of({ success: true }))

      service.updateProfileVisibility(form)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        form
      )
    })

    it('should handle empty form', () => {
      mockHttpClient.post.mockReturnValue(of({ success: false }))

      service.updateProfileVisibility({})

      expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', {})
    })

    it('should propagate http errors', (done) => {
      const error = new Error('Update failed')
      mockHttpClient.post.mockReturnValue(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.updateProfileVisibility({}).subscribe(
        () => fail('Should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })
  })

  describe('resetPassword', () => {
    it('should call http.get with correct endpoint', () => {
      mockHttpClient.get.mockReturnValue(of({ success: true }))

      service.resetPassword()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v2/password/reset')
    })

    it('should return reset response', (done) => {
      const response = { success: true, message: 'Password reset email sent' }
      mockHttpClient.get.mockReturnValue(of(response))

      service.resetPassword().subscribe((result) => {
        expect(result).toEqual(response)
        expect(result.success).toBe(true)
        done()
      })
    })

    it('should handle reset failure', (done) => {
      const response = { success: false, error: 'Reset failed' }
      mockHttpClient.get.mockReturnValue(of(response))

      service.resetPassword().subscribe((result) => {
        expect(result.success).toBe(false)
        expect(result.error).toBe('Reset failed')
        done()
      })
    })

    it('should propagate http errors', (done) => {
      const error = new Error('Network error')
      mockHttpClient.get.mockReturnValue(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.resetPassword().subscribe(
        () => fail('Should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })

    it('should be callable multiple times', () => {
      mockHttpClient.get.mockReturnValue(of({ success: true }))

      service.resetPassword()
      service.resetPassword()
      service.resetPassword()

      expect(mockHttpClient.get).toHaveBeenCalledTimes(3)
    })
  })

  describe('API endpoint constants', () => {
    it('should use correct notification settings endpoint', () => {
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchNotificationSettings()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/apis/protected/v8/user/notifications/settings')
      )
    })

    it('should use correct notification preference endpoint', () => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.fetchNotificationPreference()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/apis/proxies/v8/data/v1/system/settings/get/notificationPreference')
      )
    })

    it('should use correct user notification preference endpoint', () => {
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchUserNotificationPreference()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/apis/proxies/v8/user/v1/notificationPreference')
      )
    })

    it('should use correct get settings endpoint', () => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.getSettings()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('apis/proxies/v8/notificationSetting/read')
      )
    })

    it('should use correct update notifications endpoint', () => {
      mockHttpClient.post.mockReturnValue(of({}))

      service.enableNotification({})

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('apis/proxies/v8/notificationSetting/upsert'),
        expect.anything()
      )
    })
  })

  describe('edge cases', () => {
    it('should handle consecutive API calls', (done) => {
      mockHttpClient.get.mockReturnValue(of(mockNotificationGroups))

      service.fetchNotificationSettings().subscribe(() => {
        service.fetchNotificationSettings().subscribe((result) => {
          expect(result).toEqual(mockNotificationGroups)
          expect(mockHttpClient.get).toHaveBeenCalledTimes(2)
          done()
        })
      })
    })

    it('should handle mixed success and failure responses', (done) => {
      mockHttpClient.get.mockReturnValueOnce(of(mockProfile))
      const error = new Error('Second call failed')
      mockHttpClient.get.mockReturnValueOnce(
        new (require('rxjs').Observable)((observer: any) => {
          observer.error(error)
        })
      )

      service.fetchProfile('user-123').subscribe((result) => {
        expect(result).toEqual(mockProfile)

        service.fetchProfile('user-456').subscribe(
          () => fail('Should have failed'),
          (err) => {
            expect(err).toBe(error)
            done()
          }
        )
      })
    })

    it('should handle undefined request bodies', () => {
      mockHttpClient.post.mockReturnValue(of({}))

      service.updateUserNotificationPreference(undefined as any)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/notificationPreference',
        undefined
      )
    })

    it('should handle special characters in userId', () => {
      mockHttpClient.get.mockReturnValue(of(mockProfile))

      service.fetchProfile('user@123#$%')

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/profile/v1/basic/user@123#$%'
      )
    })
  })
})
