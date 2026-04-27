import { TncComponent } from './tnc.component'
import { of, throwError } from 'rxjs'
import { NsTnc } from '../../models/tnc.model'

describe('TncComponent', () => {
  let component: TncComponent
  let activatedRouteMock: any
  let routerMock: any
  let httpClientMock: any
  let loggerServiceMock: any
  let configServiceMock: any
  let tncAppResolverServiceMock: any
  let tncPublicResolverServiceMock: any
  let matDialogMock: any

  const mockTncData: NsTnc.ITnc = {
    isNewUser: false,
    isAccepted: false,
    termsAndConditions: [
      {
        name: 'Generic T&C',
        acceptedVersion: '1.0',
        version: '1.0',
        content: 'Generic TnC content',
        language: 'en',
        acceptedDate: new Date(),
        acceptedLanguage: '',
        availableLanguages: [],
        isAccepted: false
      },
      {
        name: 'Data Privacy',
        acceptedVersion: '1.0',
        version: '1.0',
        content: 'Data Privacy content',
        language: 'en',
        acceptedLanguage: '',
        availableLanguages: [],
        isAccepted: false,
        acceptedDate: new Date()
      },
    ],
  }

  beforeEach(() => {
    // Create mocks for all dependencies
    activatedRouteMock = {
      data: of({
        tnc: {
          data: mockTncData,
        },
        isPublic: false,
      }),
    }

    routerMock = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    }

    httpClientMock = {
      post: jest.fn(),
      patch: jest.fn(),
    }

    loggerServiceMock = {
      error: jest.fn(),
    }

    configServiceMock = {
      isNewUser: false,
      hasAcceptedTnc: false,
      userUrl: '',
      appSetup: false,
    }

    tncAppResolverServiceMock = {
      getTnc: jest.fn().mockReturnValue(of(mockTncData)),
    }

    tncPublicResolverServiceMock = {
      getPublicTnc: jest.fn().mockReturnValue(of(mockTncData)),
    }

    matDialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true)),
      }),
    }

    // Initialize component with mocked dependencies
    component = new TncComponent(
      activatedRouteMock,
      routerMock,
      httpClientMock,
      loggerServiceMock,
      configServiceMock,
      tncAppResolverServiceMock,
      tncPublicResolverServiceMock,
      matDialogMock
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should initialize tncData and isPublic from route data', () => {
      component.ngOnInit()

      expect(component.tncData).toEqual(mockTncData)
      expect(component.isPublic).toBe(false)
      expect(configServiceMock.isNewUser).toBe(false)
    })

    it('should navigate to error page if tncData is not available', () => {
      activatedRouteMock.data = of({
        tnc: {
          data: null,
        },
        isPublic: false,
      })

      component.ngOnInit()

      expect(routerMock.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
    })

    it('should set isNewUser in configService', () => {
      const newUserTncData = { ...mockTncData, isNewUser: true }
      activatedRouteMock.data = of({
        tnc: {
          data: newUserTncData,
        },
        isPublic: false,
      })

      component.ngOnInit()

      expect(configServiceMock.isNewUser).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route subscription if it exists', () => {
      component.ngOnInit()

      const unsubscribeSpy = jest.spyOn(component.routeSubscription as any, 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should handle null routeSubscription gracefully', () => {
      component.routeSubscription = null

      expect(() => {
        component.ngOnDestroy()
      }).not.toThrow()
    })
  })

  describe('getTnc', () => {
    beforeEach(() => {
      component.tncData = { ...mockTncData }
      component.isPublic = false
    })

    it('should not fetch TnC if locale matches current Generic T&C language', () => {
      component.getTnc('en')

      expect(tncAppResolverServiceMock.getTnc).not.toHaveBeenCalled()
      expect(tncPublicResolverServiceMock.getPublicTnc).not.toHaveBeenCalled()
    })

    it('should fetch protected TnC if locale does not match and isPublic is false', () => {
      component.getTnc('hi')

      expect(tncAppResolverServiceMock.getTnc).toHaveBeenCalledWith('hi')
    })

    it('should fetch public TnC if locale does not match and isPublic is true', () => {
      component.isPublic = true
      component.getTnc('hi')

      expect(tncPublicResolverServiceMock.getPublicTnc).toHaveBeenCalledWith('hi')
    })

    it('should update tncData when new TnC is fetched', () => {
      // Create a test data that will be returned from the service
      const newTncData = { ...mockTncData }
      tncAppResolverServiceMock.getTnc.mockReturnValue(of(newTncData))

      // Spy on private method
      const assignTncDataSpy = jest.spyOn(component as any, 'assignTncData')

      component.getTnc('hi')

      expect(assignTncDataSpy).toHaveBeenCalled()
    })
  })

  describe('getDp', () => {
    beforeEach(() => {
      component.tncData = { ...mockTncData }
      component.isPublic = false
    })

    it('should not fetch DP if locale matches current Data Privacy language', () => {
      component.getDp('en')

      expect(tncAppResolverServiceMock.getTnc).not.toHaveBeenCalled()
      expect(tncPublicResolverServiceMock.getPublicTnc).not.toHaveBeenCalled()
    })

    it('should fetch protected DP if locale does not match and isPublic is false', () => {
      component.getDp('hi')

      expect(tncAppResolverServiceMock.getTnc).toHaveBeenCalledWith('hi')
    })

    it('should fetch public DP if locale does not match and isPublic is true', () => {
      component.isPublic = true
      component.getDp('hi')

      expect(tncPublicResolverServiceMock.getPublicTnc).toHaveBeenCalledWith('hi')
    })

    it('should update tncData when new DP is fetched', () => {
      // Create a test data that will be returned from the service
      const newTncData = { ...mockTncData }
      tncAppResolverServiceMock.getTnc.mockReturnValue(of(newTncData))

      // Spy on private method
      const assignDpSpy = jest.spyOn(component as any, 'assignDp')

      component.getDp('hi')

      expect(assignDpSpy).toHaveBeenCalled()
    })
  })

  describe('acceptTnc', () => {
    const mockTemplate = { templateRef: true }

    beforeEach(() => {
      component.tncData = { ...mockTncData }
      httpClientMock.post.mockReturnValue(of({}))
      httpClientMock.patch.mockReturnValue(of({}))
    })

    it('should post accepted terms to the API', () => {
      component.acceptTnc(mockTemplate)

      expect(httpClientMock.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
        termsAccepted: [
          {
            acceptedLanguage: 'en',
            docName: 'Generic T&C',
            version: '1.0',
          },
          {
            acceptedLanguage: 'en',
            docName: 'Data Privacy',
            version: '1.0',
          },
        ],
      })
    })

    it('should set hasAcceptedTnc to true and call postProcess on successful acceptance', () => {
      const postProcessSpy = jest.spyOn(component, 'postProcess')

      component.acceptTnc(mockTemplate)

      expect(configServiceMock.hasAcceptedTnc).toBe(true)
      expect(postProcessSpy).toHaveBeenCalled()
    })

    it('should navigate to app setup for new users', () => {
      component.tncData = { ...mockTncData, isNewUser: true }
      configServiceMock.appSetup = true

      component.acceptTnc(mockTemplate)

      expect(routerMock.navigate).toHaveBeenCalledWith(['app', 'setup'])
    })

    it('should open dialog if userUrl is set', () => {
      configServiceMock.userUrl = '/some/url'

      component.acceptTnc(mockTemplate)

      expect(matDialogMock.open).toHaveBeenCalledWith(mockTemplate, {
        width: '400px',
        backdropClass: 'backdropBackground',
      })
    })

    it('should navigate to home when dialog is dismissed (afterClosed returns false)', () => {
      configServiceMock.userUrl = '/some/url'
      // Override dialog mock to return false (user dismisses)
      matDialogMock.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false)),
      })

      component.acceptTnc(mockTemplate)

      expect(routerMock.navigate).toHaveBeenCalledWith(['page', 'home'])
    })

    it('should navigate to userUrl when dialog is confirmed (afterClosed returns true)', () => {
      configServiceMock.userUrl = '/some/url'
      matDialogMock.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true)),
      })

      component.acceptTnc(mockTemplate)

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/some/url')
    })

    it('should navigate to home if userUrl is not set', () => {
      configServiceMock.userUrl = ''

      component.acceptTnc(mockTemplate)

      expect(routerMock.navigate).toHaveBeenCalledWith(['page', 'home'])
    })

    it('should handle error in accepting TnC', () => {
      httpClientMock.post.mockReturnValue(throwError({ error: 'Error accepting TnC' }))

      component.acceptTnc(mockTemplate)

      expect(loggerServiceMock.error).toHaveBeenCalled()
      expect(component.errorInAccepting).toBe(true)
      expect(component.isAcceptInProgress).toBe(false)
    })

    it('should handle missing tncData', () => {
      component.tncData = null

      component.acceptTnc(mockTemplate)

      expect(httpClientMock.post).not.toHaveBeenCalled()
      expect(component.errorInAccepting).toBe(false)
    })

    it('should accept tnc without generalTnc when no Generic T&C term exists', () => {
      component.tncData = {
        ...mockTncData,
        termsAndConditions: [
          // No 'Generic T&C', only 'Data Privacy'
          mockTncData.termsAndConditions[1]
        ]
      }

      component.acceptTnc(mockTemplate)

      expect(httpClientMock.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
        termsAccepted: [{ acceptedLanguage: 'en', docName: 'Data Privacy', version: '1.0' }]
      })
    })

    it('should accept tnc without dataPrivacy when no Data Privacy term exists', () => {
      component.tncData = {
        ...mockTncData,
        termsAndConditions: [
          // No 'Data Privacy', only 'Generic T&C'
          mockTncData.termsAndConditions[0]
        ]
      }

      component.acceptTnc(mockTemplate)

      expect(httpClientMock.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
        termsAccepted: [{ acceptedLanguage: 'en', docName: 'Generic T&C', version: '1.0' }]
      })
    })
  })

  describe('postProcess', () => {
    it('should call the post-processing API', () => {
      httpClientMock.patch.mockReturnValue(of({}))

      component.postProcess()

      expect(httpClientMock.patch).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/postprocessing', {})
    })
  })

  describe('assignTncData and assignDp methods', () => {
    it('should correctly assign TnC data', () => {
      component.tncData = { ...mockTncData }

      const dpData = mockTncData.termsAndConditions[1] // Data Privacy
      const newTncData = { ...mockTncData };

      (component as any).assignTncData(dpData, newTncData)

      expect(component.tncData).toEqual({
        ...newTncData,
        termsAndConditions: [
          newTncData.termsAndConditions[0],
          dpData,
        ],
      })
    })

    it('should not update tncData in assignTncData when tncData is null', () => {
      component.tncData = null
      const dpData = mockTncData.termsAndConditions[1]
      const newTncData = { ...mockTncData }

      // Should not throw even when tncData is null
      expect(() => (component as any).assignTncData(dpData, newTncData)).not.toThrow()
      expect(component.tncData).toBeNull()
    })

    it('should correctly assign DP data', () => {
      component.tncData = { ...mockTncData }

      const tncData = mockTncData.termsAndConditions[0] // Generic T&C
      const newDpData = { ...mockTncData };

      (component as any).assignDp(tncData, newDpData)

      expect(component.tncData?.termsAndConditions[0]).toEqual(tncData)
    })

    it('should not update tncData in assignDp when tncData is null', () => {
      component.tncData = null
      const tncData = mockTncData.termsAndConditions[0]
      const newDpData = { ...mockTncData }

      expect(() => (component as any).assignDp(tncData, newDpData)).not.toThrow()
      expect(component.tncData).toBeNull()
    })
  })
})