/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { ViewCustomFieldsComponent } from './view-custom-fields.component'
import { of, throwError } from 'rxjs'
import { Breakpoints } from '@angular/cdk/layout'

describe('ViewCustomFieldsComponent', () => {
  let component: ViewCustomFieldsComponent
  let mockUserProfileService: any
  let mockConfigService: any
  let mockDialog: any
  let mockBreakpointObserver: any
  let mockRoute: any

  const mockOrgResponse = {
    result: {
      response: {
        customfieldsdata: {
          customFieldIds: ['field-1', 'field-2', 'field-3'],
        },
      },
    },
  }

  const mockCustomFieldsResponse = {
    result: {
      searchResults: {
        data: [
          {
            customFieldId: 'field-1',
            attributeName: 'department',
            name: 'Department',
            isEnabled: true,
          },
          {
            customFieldId: 'field-2',
            attributeName: 'designation',
            name: 'Designation',
            isEnabled: true,
          },
          {
            customFieldId: 'field-3',
            attributeName: 'location',
            name: 'Location',
            isEnabled: true,
          },
        ],
      },
    },
  }

  const mockCustomFieldValuesResponse = {
    result: {
      response: {
        customFieldValues: [
          { attributeName: 'department', value: 'Engineering' },
          { attributeName: 'designation', value: 'Senior Developer' },
          {
            attributeName: 'skills',
            values: [
              { attributeName: 'java', value: 'Expert' },
              { attributeName: 'python', value: 'Intermediate' },
            ],
          },
        ],
      },
    },
  }

  beforeEach(() => {
    mockUserProfileService = {
      readOrgData: jest.fn().mockReturnValue(of(mockOrgResponse)),
      fetchCustomFields: jest.fn().mockReturnValue(of(mockCustomFieldsResponse)),
      readCustomattributeDetails: jest.fn().mockReturnValue(of(mockCustomFieldValuesResponse)),
    }

    mockConfigService = {
      userProfile: {
        userId: 'user-123',
        rootOrgId: 'org-456',
      },
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true)),
      }),
    }

    mockBreakpointObserver = {
      observe: jest.fn().mockReturnValue(of({ matches: false })),
    }

    mockRoute = {
      fragment: of(''),
    }

    component = new ViewCustomFieldsComponent(
      mockUserProfileService,
      mockConfigService,
      mockDialog,
      mockBreakpointObserver,
      mockRoute
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.editCustomDetails).toBe(false)
      expect(component.customAttrList).toEqual([])
      expect(component.customAttrForm).toEqual({})
      expect(component.customFieldValues).toEqual([])
      expect(component.customAttrListIds).toEqual([])
      expect(component.userId).toBe('')
      expect(component.orgId).toBe('')
      expect(component.currentUser).toEqual({})
    })

    it('should subscribe to breakpoint changes', () => {
      expect(mockBreakpointObserver.observe).toHaveBeenCalledWith([Breakpoints.Handset])
    })

    it('should set isMobile based on breakpoint matches', () => {
      const mockObserveResult = { matches: true }
      mockBreakpointObserver.observe.mockReturnValue(of(mockObserveResult))

      const newComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        mockConfigService,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      expect(newComponent.isMobile).toBe(true)
    })

    it('should subscribe to route fragment', () => {
      mockRoute.fragment = of('someFragment')

      const newComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        mockConfigService,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      expect(newComponent).toBeDefined()
    })
  })

  describe('constructor with orgDetails fragment', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      document.getElementById = jest.fn().mockReturnValue({
        scrollIntoView: jest.fn(),
      }) as any
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should scroll to element and open dialog when fragment is orgDetails', () => {
      mockRoute.fragment = of('orgDetails')
      const scrollSpy = jest.fn()
      document.getElementById = jest.fn().mockReturnValue({
        scrollIntoView: scrollSpy,
      }) as any

      const testComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        mockConfigService,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      jest.advanceTimersByTime(500)
      expect(document.getElementById).toHaveBeenCalledWith('orgDetails')
      expect(scrollSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      })

      jest.advanceTimersByTime(1000)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(testComponent).toBeDefined()
    })

    it('should not scroll when element is not found', () => {
      mockRoute.fragment = of('orgDetails')
      document.getElementById = jest.fn().mockReturnValue(null) as any

      const testComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        mockConfigService,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      jest.advanceTimersByTime(500)
      expect(document.getElementById).toHaveBeenCalledWith('orgDetails')
      expect(mockDialog.open).not.toHaveBeenCalled()
      expect(testComponent).toBeDefined()
    })
  })

  describe('ngOnInit', () => {
    it('should initialize currentUser from configService', () => {
      component.ngOnInit()

      expect(component.currentUser).toEqual(mockConfigService.userProfile)
      expect(component.userId).toBe('user-123')
      expect(component.orgId).toBe('org-456')
    })

    it('should call getOrgDetails', () => {
      const getOrgSpy = jest.spyOn(component, 'getOrgDetails')

      component.ngOnInit()

      expect(getOrgSpy).toHaveBeenCalled()
    })

    it('should handle missing userProfile', () => {
      const customConfigService = {
        userProfile: null,
      }
      const testComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        customConfigService as any,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      testComponent.ngOnInit()

      expect(testComponent.userId).toBe('')
      expect(testComponent.orgId).toBe('')
    })

    it('should handle userProfile without userId', () => {
      const customConfigService = {
        userProfile: { rootOrgId: 'org-789' },
      }
      const testComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        customConfigService as any,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      testComponent.ngOnInit()

      expect(testComponent.userId).toBe('')
      expect(testComponent.orgId).toBe('org-789')
    })

    it('should handle userProfile without rootOrgId', () => {
      const customConfigService = {
        userProfile: { userId: 'user-789' },
      }
      const testComponent = new ViewCustomFieldsComponent(
        mockUserProfileService,
        customConfigService as any,
        mockDialog,
        mockBreakpointObserver,
        mockRoute
      )

      testComponent.ngOnInit()

      expect(testComponent.userId).toBe('user-789')
      expect(testComponent.orgId).toBe('')
    })
  })

  describe('getOrgDetails', () => {
    it('should fetch organization details', () => {
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(mockUserProfileService.readOrgData).toHaveBeenCalledWith({
        request: { organisationId: 'org-456' },
      })
    })

    it('should set customAttrListIds from response', () => {
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(component.customAttrListIds).toEqual(['field-1', 'field-2', 'field-3'])
    })

    it('should call getCustomAttributes when customAttrListIds has items', () => {
      const getCustomSpy = jest.spyOn(component, 'getCustomAttributes')
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(getCustomSpy).toHaveBeenCalled()
    })

    it('should not call getCustomAttributes when customAttrListIds is empty', () => {
      const getCustomSpy = jest.spyOn(component, 'getCustomAttributes')
      mockUserProfileService.readOrgData.mockReturnValue(
        of({
          result: {
            response: {
              customfieldsdata: {
                customFieldIds: [],
              },
            },
          },
        })
      )
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(getCustomSpy).not.toHaveBeenCalled()
    })

    it('should handle error when fetching org details', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Fetch error')
      mockUserProfileService.readOrgData.mockReturnValue(throwError(error))
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching organization details', error)
      consoleErrorSpy.mockRestore()
    })

    it('should handle missing customFieldIds in response', () => {
      mockUserProfileService.readOrgData.mockReturnValue(
        of({
          result: {
            response: {
              customfieldsdata: {},
            },
          },
        })
      )
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(component.customAttrListIds).toEqual([])
    })
  })

  describe('getCustomAttributes', () => {
    beforeEach(() => {
      component.orgId = 'org-456'
      component.customAttrListIds = ['field-1', 'field-2']
    })

    it('should fetch custom attributes with correct payload', () => {
      component.getCustomAttributes()

      expect(mockUserProfileService.fetchCustomFields).toHaveBeenCalledWith({
        filterCriteriaMap: {
          organisationId: 'org-456',
          isEnabled: true,
          customFieldId: ['field-1', 'field-2'],
        },
        pageNumber: 0,
        pageSize: 50,
        orderDirection: 'DESC',
        orderBy: 'updatedOn',
        facets: [],
      })
    })

    it('should set customAttrList from response', () => {
      component.getCustomAttributes()

      expect(component.customAttrList).toEqual(mockCustomFieldsResponse.result.searchResults.data)
    })

    it('should call readCustomattributeDetails when customAttrList has items', () => {
      const readCustomSpy = jest.spyOn(component, 'readCustomattributeDetails')

      component.getCustomAttributes()

      expect(readCustomSpy).toHaveBeenCalled()
    })

    it('should not call readCustomattributeDetails when customAttrList is empty', () => {
      const readCustomSpy = jest.spyOn(component, 'readCustomattributeDetails')
      mockUserProfileService.fetchCustomFields.mockReturnValue(
        of({
          result: {
            searchResults: {
              data: [],
            },
          },
        })
      )

      component.getCustomAttributes()

      expect(readCustomSpy).not.toHaveBeenCalled()
    })

    it('should handle error when fetching custom fields', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const error = new Error('Fetch error')
      mockUserProfileService.fetchCustomFields.mockReturnValue(throwError(error))

      component.getCustomAttributes()

      expect(consoleLogSpy).toHaveBeenCalledWith('Error', error)
      consoleLogSpy.mockRestore()
    })

    it('should handle missing data in response', () => {
      mockUserProfileService.fetchCustomFields.mockReturnValue(
        of({
          result: {
            searchResults: {},
          },
        })
      )

      component.getCustomAttributes()

      expect(component.customAttrList).toEqual([])
    })
  })

  describe('readCustomattributeDetails', () => {
    beforeEach(() => {
      component.userId = 'user-123'
      component.orgId = 'org-456'
    })

    it('should fetch custom attribute details', () => {
      component.readCustomattributeDetails()

      expect(mockUserProfileService.readCustomattributeDetails).toHaveBeenCalledWith(
        'user-123',
        'org-456'
      )
    })

    it('should set customFieldValues from response', () => {
      component.readCustomattributeDetails()

      expect(component.customFieldValues).toEqual(
        mockCustomFieldValuesResponse.result.response.customFieldValues
      )
    })

    it('should handle error when fetching custom attribute details', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const error = new Error('Fetch error')
      mockUserProfileService.readCustomattributeDetails.mockReturnValue(throwError(error))

      component.readCustomattributeDetails()

      expect(consoleLogSpy).toHaveBeenCalledWith('Error', error)
      consoleLogSpy.mockRestore()
    })

    it('should handle missing customFieldValues in response', () => {
      mockUserProfileService.readCustomattributeDetails.mockReturnValue(
        of({
          result: {
            response: {},
          },
        })
      )

      component.readCustomattributeDetails()

      expect(component.customFieldValues).toEqual([])
    })
  })

  describe('getValue', () => {
    beforeEach(() => {
      component.customFieldValues = mockCustomFieldValuesResponse.result.response.customFieldValues
    })

    it('should return value for matching attributeName', () => {
      const value = component.getValue('department')

      expect(value).toBe('Engineering')
    })

    it('should return empty string when attributeName not found', () => {
      const value = component.getValue('nonexistent')

      expect(value).toBe('')
    })

    it('should return empty string for null customFieldValues', () => {
      component.customFieldValues = null

      const value = component.getValue('department')

      expect(value).toBe('')
    })

    it('should return empty string for empty customFieldValues', () => {
      component.customFieldValues = []

      const value = component.getValue('department')

      expect(value).toBe('')
    })

    it('should return correct value for different attributes', () => {
      const depValue = component.getValue('department')
      const desValue = component.getValue('designation')

      expect(depValue).toBe('Engineering')
      expect(desValue).toBe('Senior Developer')
    })
  })

  describe('getListItemName', () => {
    beforeEach(() => {
      component.customFieldValues = mockCustomFieldValuesResponse.result.response.customFieldValues
    })

    it('should return value for matching attributeName and listItem', () => {
      const arryListItem = { attributeName: 'skills' }
      const listItem = { name: 'java' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('Expert')
    })

    it('should be case-insensitive when matching listItem name', () => {
      const arryListItem = { attributeName: 'skills' }
      const listItem = { name: 'JAVA' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('Expert')
    })

    it('should return empty string when attributeName not found', () => {
      const arryListItem = { attributeName: 'nonexistent' }
      const listItem = { name: 'java' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('')
    })

    it('should return empty string when listItem not found', () => {
      const arryListItem = { attributeName: 'skills' }
      const listItem = { name: 'nonexistent' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('')
    })

    it('should return empty string when values array is empty', () => {
      component.customFieldValues = [{ attributeName: 'skills', values: [] }]
      const arryListItem = { attributeName: 'skills' }
      const listItem = { name: 'java' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('')
    })

    it('should return empty string when values property is missing', () => {
      component.customFieldValues = [{ attributeName: 'skills' }]
      const arryListItem = { attributeName: 'skills' }
      const listItem = { name: 'java' }

      const value = component.getListItemName(arryListItem, listItem)

      expect(value).toBe('')
    })
  })

  describe('getName', () => {
    beforeEach(() => {
      component.customAttrList = mockCustomFieldsResponse.result.searchResults.data
    })

    it('should return name for matching attributeName', () => {
      const name = component.getName('department')

      expect(name).toBe('Department')
    })

    it('should return attributeName when not found in customAttrList', () => {
      const name = component.getName('nonexistent')

      expect(name).toBe('nonexistent')
    })

    it('should return attributeName when customAttrList is empty', () => {
      component.customAttrList = []

      const name = component.getName('department')

      expect(name).toBe('department')
    })

    it('should return correct name for different attributes', () => {
      const depName = component.getName('department')
      const desName = component.getName('designation')
      const locName = component.getName('location')

      expect(depName).toBe('Department')
      expect(desName).toBe('Designation')
      expect(locName).toBe('Location')
    })
  })

  describe('handleEditCustomDetails', () => {
    it('should open dialog with correct configuration', () => {
      component.handleEditCustomDetails()

      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        disableClose: true,
        panelClass: 'dialog_sidenav',
        autoFocus: false,
      })
    })

    it('should call getOrgDetails when dialog closes with result', () => {
      const getOrgSpy = jest.spyOn(component, 'getOrgDetails')

      component.handleEditCustomDetails()

      expect(getOrgSpy).toHaveBeenCalled()
    })

    it('should not call getOrgDetails when dialog closes without result', () => {
      const getOrgSpy = jest.spyOn(component, 'getOrgDetails')
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false)),
      })

      component.handleEditCustomDetails()

      expect(getOrgSpy).not.toHaveBeenCalled()
    })

    it('should not call getOrgDetails when dialog closes with null', () => {
      const getOrgSpy = jest.spyOn(component, 'getOrgDetails')
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
      })

      component.handleEditCustomDetails()

      expect(getOrgSpy).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle null response in getOrgDetails', () => {
      mockUserProfileService.readOrgData.mockReturnValue(of(null))
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(component.customAttrListIds).toEqual([])
    })

    it('should handle null response in getCustomAttributes', () => {
      mockUserProfileService.fetchCustomFields.mockReturnValue(of(null))
      component.orgId = 'org-456'

      component.getCustomAttributes()

      expect(component.customAttrList).toEqual([])
    })

    it('should handle null response in readCustomattributeDetails', () => {
      mockUserProfileService.readCustomattributeDetails.mockReturnValue(of(null))

      component.readCustomattributeDetails()

      expect(component.customFieldValues).toEqual([])
    })

    it('should handle customFieldValues with null value property', () => {
      component.customFieldValues = [{ attributeName: 'department', value: null }]

      const value = component.getValue('department')

      expect(value).toBeNull()
    })

    it('should handle undefined customAttrListIds in getOrgDetails', () => {
      mockUserProfileService.readOrgData.mockReturnValue(
        of({
          result: {
            response: {
              customfieldsdata: {
                customFieldIds: undefined,
              },
            },
          },
        })
      )
      component.orgId = 'org-456'

      component.getOrgDetails()

      expect(component.customAttrListIds).toBeUndefined()
    })
  })
})
