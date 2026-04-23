jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { __esModule: true, default: actual, ...actual }
})
jest.mock('@sunbird-cb/collection/src/public-api', () => ({
  CustomTourService: jest.fn(),
  ROOT_WIDGET_CONFIG: { actionButton: { _type: 'actionButton', feature: 'feature' } },
  LogoutComponent: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
  ROOT_WIDGET_CONFIG: { actionButton: { _type: 'actionButton', feature: 'feature' } },
}), { virtual: true })
jest.mock('../../../../project/ws/author/src/public-api', () => ({
  AccessControlService: jest.fn().mockImplementation(() => ({
    hasRole: jest.fn().mockReturnValue(false),
  })),
}))

import { FeaturesComponent } from './features.component'
import { UntypedFormControl } from '@angular/forms'
import { Subject } from 'rxjs'

describe('FeaturesComponent', () => {
  let component: FeaturesComponent

  const tourGuideNotifier$ = new Subject<boolean>()
  const isXSmall$ = new Subject<boolean>()
  const restrictedFeatures = new Set<string>()

  const sampleAppsConfig = {
    tourGuide: null,
    groups: [
      {
        id: 'group1',
        hasRole: [],
        featureIds: ['feat1', 'feat2'],
        name: 'Group 1',
        description: '',
        keywords: [],
      },
      {
        id: 'group2',
        hasRole: ['MDO_ADMIN'],
        featureIds: ['feat3'],
        name: 'Group 2',
        description: '',
        keywords: [],
      },
    ],
    features: {
      feat1: {
        name: 'Dashboard',
        permission: [],
        keywords: ['dash'],
        description: 'Main dashboard',
        url: '/app/dashboard',
      },
      feat2: {
        name: 'Analytics',
        permission: ['ANALYTICS'],
        keywords: ['stats'],
        description: 'Analytics page',
        url: '/app/analytics',
      },
      feat3: {
        name: 'Admin Panel',
        permission: [],
        keywords: ['admin'],
        description: 'Administration',
        url: '/app/admin',
      },
    },
  }

  const mockConfigSvc: any = {
    appsConfig: sampleAppsConfig,
    tourGuideNotifier: tourGuideNotifier$,
    restrictedFeatures,
    pageNavBar: { background: 'blue' },
  }

  const mockAccessService: any = {
    hasRole: jest.fn().mockReturnValue(false),
  }

  const mockTour: any = {
    data: null,
    startTour: jest.fn(),
  }

  const mockRespondSvc: any = {
    unsubscribeResponse: jest.fn(),
  }

  const mockValueSvc: any = {
    isXSmall$: isXSmall$.asObservable(),
  }

  const mockDialog: any = {
    open: jest.fn(),
  }

  const mockRouter: any = {
    navigate: jest.fn(),
  }

  const mockActivateRoute: any = {
    snapshot: {
      queryParamMap: { get: jest.fn().mockReturnValue(null) },
    },
  }

  function buildComponent(configSvc?: any, accessSvc?: any) {
    return new FeaturesComponent(
      mockDialog,
      mockRouter,
      mockActivateRoute,
      configSvc || mockConfigSvc,
      mockTour,
      mockRespondSvc,
      mockValueSvc,
      accessSvc || mockAccessService,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize queryControl', () => {
    expect(component.queryControl).toBeInstanceOf(UntypedFormControl)
  })

  it('should set isXSmall from valueSvc', () => {
    isXSmall$.next(true)
    expect(component.isXSmall).toBe(true)
    isXSmall$.next(false)
    expect(component.isXSmall).toBe(false)
  })

  it('should build featuresConfig from groups with no required roles', () => {
    // group1 has hasRole:[] -> included
    // group2 has hasRole:['MDO_ADMIN'] and accessService returns false -> excluded
    expect(component['featuresConfig'].length).toBe(1)
    expect(component['featuresConfig'][0].id).toBe('group1')
  })

  it('should include features without permissions in featuresConfig', () => {
    const featureWidgets = component['featuresConfig'][0].featureWidgets
    // feat1 has no permission -> included
    // feat2 has 'ANALYTICS' permission, accessService returns false -> excluded
    expect(featureWidgets.length).toBe(1)
    expect((featureWidgets[0] as any).widgetData.actionBtn.name).toBe('Dashboard')
  })

  it('should include restricted role features when hasRole returns true', () => {
    const comp2 = buildComponent(mockConfigSvc, { hasRole: jest.fn().mockReturnValue(true) })
    expect(comp2['featuresConfig'].length).toBe(2)
    const group1Widgets = comp2['featuresConfig'][0].featureWidgets
    expect(group1Widgets.length).toBe(2)
  })

  it('should set tourGuide data when appsConfig has tourGuide', () => {
    const cfg2 = { ...mockConfigSvc, appsConfig: { ...sampleAppsConfig, tourGuide: { steps: [] } } }
    buildComponent(cfg2)
    expect(mockTour.data).toEqual({ steps: [] })
  })

  describe('ngOnInit', () => {
    it('should subscribe to queryControl and navigate', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      jest.advanceTimersByTime(600)
      jest.useRealTimers()
      expect(component.featureGroups).not.toBeNull()
    })

    it('should set isTourGuideAvailable when tourGuideNotifier fires and not restricted', () => {
      component.ngOnInit()
      tourGuideNotifier$.next(true)
      expect(component.isTourGuideAvailable).toBe(true)
    })

    it('should NOT set isTourGuideAvailable when tourGuide is in restrictedFeatures', () => {
      const restricted = new Set(['tourGuide'])
      const cfg = { ...mockConfigSvc, restrictedFeatures: restricted }
      const comp = buildComponent(cfg)
      comp.ngOnInit()
      tourGuideNotifier$.next(true)
      expect(comp.isTourGuideAvailable).toBe(false)
    })

    it('should navigate with query param on valueChanges', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      component.queryControl.setValue('dashboard')
      jest.advanceTimersByTime(600)
      jest.useRealTimers()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParams: expect.objectContaining({ q: 'dashboard' }) }),
      )
    })

    it('should navigate with null when query is empty', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      component.queryControl.setValue('')
      jest.advanceTimersByTime(600)
      jest.useRealTimers()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParams: { q: null } }),
      )
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe queryChangeSubs', () => {
      component.ngOnInit()
      const unsubSpy = jest.spyOn(component['queryChangeSubs'] as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('should emit false to tourGuideNotifier', () => {
      const emitSpy = jest.spyOn(mockConfigSvc.tourGuideNotifier, 'next')
      component.ngOnDestroy()
      expect(emitSpy).toHaveBeenCalledWith(false)
    })

    it('should not throw if queryChangeSubs is null', () => {
      component['queryChangeSubs'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should reset queryControl to empty string', () => {
      component.queryControl.setValue('something')
      component.clear()
      expect(component.queryControl.value).toBe('')
    })
  })

  describe('logout', () => {
    it('should open dialog', () => {
      component.logout()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('startTour', () => {
    it('should call tour.startTour', () => {
      component.startTour()
      expect(mockTour.startTour).toHaveBeenCalled()
    })

    it('should unsubscribe responseSubscription if set', () => {
      const fakeSubscription = { unsubscribe: jest.fn() }
      component['responseSubscription'] = fakeSubscription as any
      component.startTour()
      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled()
      expect(fakeSubscription.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('filteredFeatures (via private method)', () => {
    it('should return all features when query is empty or null', () => {
      const result = component['filteredFeatures']('')
      expect(result).toEqual(component['featuresConfig'])
    })

    it('should filter features matching query name', () => {
      const result = component['filteredFeatures']('dashboard')
      expect(result.length).toBe(1)
    })

    it('should filter features matching keyword', () => {
      const result = component['filteredFeatures']('dash')
      expect(result.length).toBe(1)
    })

    it('should return empty array for no match', () => {
      const result = component['filteredFeatures']('xyznotfound')
      expect(result).toEqual([])
    })

    it('should filter by description', () => {
      // 'Main dashboard'.includes('dashboard') is true
      const result = component['filteredFeatures']('dashboard')
      expect(result.length).toBe(1)
    })
  })

  describe('with no appsConfig', () => {
    it('should not throw when appsConfig is null', () => {
      const cfg = { ...mockConfigSvc, appsConfig: null, tourGuideNotifier: tourGuideNotifier$ }
      expect(() => buildComponent(cfg)).not.toThrow()
    })
  })
})
