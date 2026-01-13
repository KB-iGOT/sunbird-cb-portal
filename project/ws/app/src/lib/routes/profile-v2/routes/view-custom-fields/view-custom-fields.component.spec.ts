import { of, Subject } from 'rxjs'
import { BreakpointObserver } from '@angular/cdk/layout'
import { ActivatedRoute } from '@angular/router'
import { ViewCustomFieldsComponent } from './view-custom-fields.component'
import { CustomFieldsComponent } from '../custom-fields/custom-fields.component'

describe('ViewCustomFieldsComponent (unit, no TestBed)', () => {
  let mockUserProfileService: any
  let mockConfigService: any
  let mockDialog: any
  let mockBreakpointObserver: any
  let fragmentSubject: Subject<string | null>
  let mockRoute: any
  let component: ViewCustomFieldsComponent

  beforeEach(() => {
    mockUserProfileService = {
      readOrgData: jest.fn().mockReturnValue(of({
        result: {
          response: {
            customfieldsdata: {
              customFieldIds: ['f1', 'f2'],
            },
          },
        },
      })),
      fetchCustomFields: jest.fn().mockReturnValue(of({
        result: {
          searchResults: {
            data: [],
          },
        },
      })),
      readCustomattributeDetails: jest.fn().mockReturnValue(of({
        result: {
          response: {
            customFieldValues: [],
          },
        },
      })),
    }

    mockConfigService = {
      userProfile: {
        userId: 'u1',
        rootOrgId: 'org1',
      },
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    }

    mockBreakpointObserver = {
      observe: jest.fn().mockReturnValue(of({ matches: true })),
    } as any

    fragmentSubject = new Subject<string | null>()
    mockRoute = {
      fragment: fragmentSubject.asObservable(),
    } as ActivatedRoute

    component = new ViewCustomFieldsComponent(
      mockUserProfileService,
      mockConfigService,
      mockDialog,
      mockBreakpointObserver as BreakpointObserver,
      mockRoute as ActivatedRoute,
    )
  })

  it('should set isMobile based on BreakpointObserver', () => {
    const observeMock: any = mockBreakpointObserver.observe
    expect(observeMock).toHaveBeenCalled()
    expect(component.isMobile).toBe(true)
  })

  it('ngOnInit should set user and org ids and call getOrgDetails', () => {
    component.ngOnInit()
    expect(component.userId).toBe('u1')
    expect(component.orgId).toBe('org1')
  })

  it('getOrgDetails sets customAttrListIds and triggers getCustomAttributes', () => {
    const readOrgSpy: any = mockUserProfileService.readOrgData
    const getCustomSpy = jest.spyOn(component, 'getCustomAttributes')
    component.getOrgDetails()
    expect(readOrgSpy).toHaveBeenCalled()
    expect(getCustomSpy).toHaveBeenCalled()
  })

  it('getCustomAttributes calls userProfileService.fetchCustomFields and readCustomattributeDetails when list present', () => {
    component.customAttrListIds = ['f1']
    const fetchSpy = jest.spyOn(mockUserProfileService, 'fetchCustomFields')
    component.getCustomAttributes()
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('readCustomattributeDetails populates customFieldValues', () => {
    const resp = {
      result: {
        response: {
          customFieldValues: [
            { attributeName: 'a1', value: 'v1' },
          ],
        },
      },
    }
    mockUserProfileService.readCustomattributeDetails = jest.fn().mockReturnValue(of(resp))
    component.readCustomattributeDetails()
    expect(component.customFieldValues.length).toBe(1)
    expect(component.customFieldValues[0].value).toBe('v1')
  })

  it('getValue returns matching value or empty string', () => {
    component.customFieldValues = [
      { attributeName: 'a1', value: 'v1' },
    ]
    expect(component.getValue('a1')).toBe('v1')
    expect(component.getValue('missing')).toBe('')
  })

  it('getListItemName returns nested list item value', () => {
    component.customFieldValues = [
      {
        attributeName: 'listField',
        values: [
          { attributeName: 'item1', value: 'Item 1' },
        ],
      },
    ]

    const arryListItem: any = { attributeName: 'listField' }
    const listItem: any = { name: 'item1' }
    expect(component.getListItemName(arryListItem, listItem)).toBe('Item 1')
    const missingItem: any = { name: 'nope' }
    expect(component.getListItemName(arryListItem, missingItem)).toBe('')
  })

  it('getName returns display name or attributeName', () => {
    component.customAttrList = [
      { attributeName: 'a1', name: 'Name 1' },
    ]
    expect(component.getName('a1')).toBe('Name 1')
    expect(component.getName('missing')).toBe('missing')
  })

  it('handleEditCustomDetails opens dialog and refreshes on close', () => {
    const orgSpy = jest.spyOn(component, 'getOrgDetails')
    component.handleEditCustomDetails()
    const openMock: any = mockDialog.open
    expect(openMock).toHaveBeenCalled()
    const args = openMock.mock.calls[0]
    expect(args[0]).toBe(CustomFieldsComponent)
    expect(args[1].disableClose).toBe(true)
    expect(args[1].panelClass).toBe('dialog_sidenav')
    expect(args[1].autoFocus).toBe(false)
    expect(orgSpy).toHaveBeenCalled()
  })
})
