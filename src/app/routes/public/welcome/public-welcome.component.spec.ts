jest.mock('src/app/services/init.service', () => ({
  InitService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

// Fix for 'import _ from lodash' with esModuleInterop: false
jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

import {
  forbiddenNamesValidator,
  forbiddenNamesValidatorNonEmpty,
  forbiddenNamesValidatorPosition,
  PublicWelcomeComponent,
} from './public-welcome.component'
import { UntypedFormControl } from '@angular/forms'
import { of } from 'rxjs'

// ─── Pure validator function tests ────────────────────────────────────────────

describe('public-welcome.component — exported validators', () => {
  describe('forbiddenNamesValidator', () => {
    it('should return null when optionsArray is falsy', () => {
      const validator = forbiddenNamesValidator(null)
      const control = new UntypedFormControl({ orgName: 'Anything' })
      expect(validator(control)).toBeNull()
    })

    it('should return null when control value is falsy', () => {
      const options = [{ orgName: 'Ministry A' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl(null)
      expect(validator(control)).toBeNull()
    })

    it('should return null when orgName matches an option', () => {
      const options = [{ orgName: 'Ministry A' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgName: 'Ministry A' })
      expect(validator(control)).toBeNull()
    })

    it('should return forbiddenNames error when orgName is NOT in options', () => {
      const options = [{ orgName: 'Ministry A' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgName: 'Unknown' })
      const result = validator(control)
      expect(result).not.toBeNull()
      expect(result!['forbiddenNames']).toEqual({ value: 'Unknown' })
    })

    it('should return error for empty options array', () => {
      const validator = forbiddenNamesValidator([])
      const control = new UntypedFormControl({ orgName: 'Anything' })
      expect(validator(control)).not.toBeNull()
    })

    it('should match second element in options', () => {
      const options = [{ orgName: 'Org1' }, { orgName: 'Org2' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgName: 'Org2' })
      expect(validator(control)).toBeNull()
    })
  })

  describe('forbiddenNamesValidatorNonEmpty', () => {
    it('should return null when optionsArray is falsy', () => {
      const validator = forbiddenNamesValidatorNonEmpty(null)
      const control = new UntypedFormControl({ orgName: 'Any' })
      expect(validator(control)).toBeNull()
    })

    it('should return null when orgName matches an option', () => {
      const options = [{ orgName: 'DOPT' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgName: 'DOPT' })
      expect(validator(control)).toBeNull()
    })

    it('should return error when orgName NOT in options', () => {
      const options = [{ orgName: 'DOPT' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgName: 'Unknown' })
      const result = validator(control)
      expect(result!['forbiddenNames']).toEqual({ value: 'Unknown' })
    })

    it('should return error for empty options array', () => {
      const validator = forbiddenNamesValidatorNonEmpty([])
      const control = new UntypedFormControl({ orgName: 'SomeOrg' })
      expect(validator(control)).not.toBeNull()
    })
  })

  describe('forbiddenNamesValidatorPosition', () => {
    it('should return null when optionsArray is falsy', () => {
      const validator = forbiddenNamesValidatorPosition(null)
      const control = new UntypedFormControl({ name: 'Director' })
      expect(validator(control)).toBeNull()
    })

    it('should return null when name matches an option', () => {
      const options = [{ name: 'Director' }]
      const validator = forbiddenNamesValidatorPosition(options)
      const control = new UntypedFormControl({ name: 'Director' })
      expect(validator(control)).toBeNull()
    })

    it('should return forbiddenNames error when name NOT in options', () => {
      const options = [{ name: 'Director' }]
      const validator = forbiddenNamesValidatorPosition(options)
      const control = new UntypedFormControl({ name: 'Unknown' })
      const result = validator(control)
      expect(result!['forbiddenNames']).toEqual({ value: 'Unknown' })
    })

    it('should return error for empty options array', () => {
      const validator = forbiddenNamesValidatorPosition([])
      const control = new UntypedFormControl({ name: 'Director' })
      expect(validator(control)).not.toBeNull()
    })
  })
})

// ─── Component instance tests ─────────────────────────────────────────────────

describe('PublicWelcomeComponent', () => {
  let component: PublicWelcomeComponent
  let mockWelcomeSignupSvc: any
  let mockSignupSvc: any
  let mockLoggerSvc: any
  let mockConfigSvc: any
  let mockSnackBar: any
  let mockActivatedRoute: any
  let mockRouter: any
  let mockInitSvc: any

  const mockUsr = {
    userId: 'user-abc',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@gov.in',
    phone: '9876543210',
    isUpdateRequired: true,
  }

  beforeEach(() => {
    mockWelcomeSignupSvc = { register: jest.fn() }
    mockSignupSvc = { searchOrgs: jest.fn() }
    mockLoggerSvc = { error: jest.fn(), info: jest.fn() }
    mockConfigSvc = {
      userProfileV2: null,
      instanceConfig: {
        telemetryConfig: { pdata: { id: 'test-portal' } },
        isMultilingualEnabled: false,
      },
      updateGlobalProfile: jest.fn(),
    }
    mockSnackBar = { open: jest.fn() }
    mockActivatedRoute = {
      snapshot: {
        data: {
          userData: { data: mockUsr },
          group: { data: ['Engineer', 'Director'] },
        },
      },
    }
    mockRouter = { navigate: jest.fn() }
    mockInitSvc = { init: jest.fn().mockResolvedValue(true) }

    component = new PublicWelcomeComponent(
      mockWelcomeSignupSvc,
      mockSignupSvc,
      mockLoggerSvc,
      mockConfigSvc,
      mockSnackBar,
      mockActivatedRoute,
      mockRouter,
      mockInitSvc
    )
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should navigate to home if isUpdateRequired is false', () => {
      const usr = { ...mockUsr, isUpdateRequired: false }
      mockActivatedRoute.snapshot.data.userData.data = usr
      mockConfigSvc.userProfileV2 = { someProfile: true }

      new PublicWelcomeComponent(
        mockWelcomeSignupSvc, mockSignupSvc, mockLoggerSvc,
        mockConfigSvc, mockSnackBar, mockActivatedRoute,
        mockRouter, mockInitSvc
      )

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })
  })

  describe('confirmChange', () => {
    it('should toggle confirm flag', () => {
      component.init()
      component.confirm = false
      component.confirmChange()
      expect(component.confirm).toBe(true)
    })

    it('should toggle confirm back to false', () => {
      component.init()
      component.confirm = true
      component.confirmChange()
      expect(component.confirm).toBe(false)
    })
  })

  describe('init', () => {
    it('should initialize registrationForm', () => {
      component.init()
      expect(component.registrationForm).toBeTruthy()
    })

    it('should pre-fill firstname from usr', () => {
      component.init()
      expect(component.registrationForm.get('firstname')!.value).toBe('Jane Doe')
    })

    it('should set isEmailVerified to true when usr has email', () => {
      component.init()
      expect(component.isEmailVerified).toBe(true)
    })

    it('should set isMobileVerified to true when usr has phone', () => {
      component.init()
      expect(component.isMobileVerified).toBe(true)
    })
  })

  describe('editOrg', () => {
    it('should reset hideOrg, resultFetched, searching and heirarchyObject', () => {
      component.init()
      component.hideOrg = true
      component.resultFetched = true
      component.searching = true
      component.heirarchyObject = { some: 'data' }

      component.editOrg()

      expect(component.hideOrg).toBe(false)
      expect(component.resultFetched).toBe(false)
      expect(component.searching).toBe(false)
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('orgClicked', () => {
    it('should set heirarchyObject and hideOrg when org option selected', () => {
      component.init()
      const event = { option: { value: { orgName: 'Ministry A', channel: 'ch1' } } }
      component.orgClicked(event)
      expect(component.heirarchyObject).toEqual({ orgName: 'Ministry A', channel: 'ch1' })
      expect(component.hideOrg).toBe(true)
    })

    it('should set hideOrg to false when option value has no orgName', () => {
      component.init()
      const event = { option: { value: {} } }
      component.orgClicked(event)
      expect(component.hideOrg).toBe(false)
    })

    it('should not throw when event is null', () => {
      component.init()
      expect(() => component.orgClicked(null)).not.toThrow()
    })
  })

  describe('openDialog', () => {
    it('should not throw', () => {
      expect(() => component.openDialog()).not.toThrow()
    })
  })

  describe('signup', () => {
    beforeEach(() => {
      component.init()
      component.heirarchyObject = {
        orgName: 'Ministry X',
        channel: 'ch1',
        sbOrgId: 'org1',
        mapId: 'map1',
        sbRootOrgId: 'root1',
        sbOrgType: 'Government',
        sbOrgSubType: 'Central',
      }
    })

    it('should call register with correct payload', () => {
      mockWelcomeSignupSvc.register = jest.fn().mockReturnValue(of({ success: true }))
      component.registrationForm.patchValue({ mobile: '9876543210', group: 'Director' })
      component.signup()
      expect(mockWelcomeSignupSvc.register).toHaveBeenCalled()
    })

    it('should navigate to /page/home on success', () => {
      mockWelcomeSignupSvc.register = jest.fn().mockReturnValue(of({ success: true }))
      component.signup()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should open snackbar on error', () => {
      const errResp = { error: { params: { errmsg: 'Server error' } } }
      mockWelcomeSignupSvc.register = jest.fn().mockReturnValue({
        subscribe: (_ok: any, errCb: any) => errCb(errResp),
      })
      component.signup()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Server error', 'X', expect.any(Object))
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptionContact if set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['subscriptionContact'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when subscriptionContact is null', () => {
      component['subscriptionContact'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('typeValue getter', () => {
    it('should return form type value', () => {
      component.init()
      expect(component.typeValue).toBe('ministry')
    })
  })

  describe('typeValueStartCase getter', () => {
    it('should return start-cased type value', () => {
      component.init()
      expect(component.typeValueStartCase).toBe('Ministry')
    })
  })

  describe('displayFn', () => {
    it('should return channel when value has channel', () => {
      expect(component.displayFn({ channel: 'ch1' })).toBe('ch1')
    })
    it('should return undefined when value is falsy', () => {
      expect(component.displayFn(null)).toBeUndefined()
    })
  })

  describe('displayFnGroup', () => {
    it('should return value itself', () => {
      expect(component.displayFnGroup('Director')).toBe('Director')
    })
    it('should return undefined when value is falsy', () => {
      expect(component.displayFnGroup(null)).toBeUndefined()
    })
  })

  describe('displayFnState', () => {
    it('should return orgName when value has orgName', () => {
      expect(component.displayFnState({ orgName: 'Ministry X' })).toBe('Ministry X')
    })
    it('should return undefined when value is falsy', () => {
      expect(component.displayFnState(null)).toBeUndefined()
    })
  })

  describe('clearValues', () => {
    it('should set organisation to empty string and heirarchyObject to null', () => {
      component.init()
      component.heirarchyObject = { orgName: 'Some org' }
      component['clearValues']()
      expect(component.registrationForm.get('organisation')!.value).toBe('')
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('filterOrgsSearch', () => {
    it('should set resultFetched to true on success', () => {
      component.init()
      mockSignupSvc.searchOrgs = jest.fn().mockReturnValue(of({ result: { response: [{ orgName: 'Org1' }] } }))
      component.filterOrgsSearch('org')
      expect(component.resultFetched).toBe(true)
    })

    it('should set searching to false on success', () => {
      component.init()
      mockSignupSvc.searchOrgs = jest.fn().mockReturnValue(of({ result: { response: [{ orgName: 'Org1' }] } }))
      component.filterOrgsSearch('org')
      expect(component.searching).toBe(false)
    })
  })

  describe('searchOrgs', () => {
    it('should call openSnackbar when searchValue is empty', async () => {
      component.init()
      const snackSpy = jest.spyOn(component as any, 'openSnackbar').mockImplementation(() => { })
      await component.searchOrgs('')
      expect(snackSpy).toHaveBeenCalled()
    })

    it('should set searching to true then call filterOrgsSearch when value given', async () => {
      component.init()
      mockSignupSvc.searchOrgs = jest.fn().mockReturnValue(of({ result: { response: [] } }))
      await component.searchOrgs('ministry')
      expect(component.resultFetched).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    it('should set groupsOriginal from route data after init', () => {
      component.init()
      component.ngOnInit()
      expect(component.groupsOriginal).toContain('Engineer')
    })

    it('should set telemetryConfig from instanceConfig', () => {
      component.init()
      component.ngOnInit()
      expect(component.telemetryConfig).not.toBeNull()
    })

    it('should handle missing group.data gracefully', () => {
      mockActivatedRoute.snapshot.data.group = {}
      component = new PublicWelcomeComponent(
        mockWelcomeSignupSvc, mockSignupSvc, mockLoggerSvc,
        mockConfigSvc, mockSnackBar, mockActivatedRoute,
        mockRouter, mockInitSvc
      )
      component.init()
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('startCountDown', () => {
    it('should set timeLeftforOTP to OTP_TIMER value', () => {
      component.init()
      component.OTP_TIMER = 0 // avoid interval
      component.startCountDown()
      expect(component.timeLeftforOTP).toBe(0)
    })
  })
})
