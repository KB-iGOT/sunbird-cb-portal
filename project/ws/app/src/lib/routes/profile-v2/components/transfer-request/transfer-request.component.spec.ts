import { of, throwError } from 'rxjs'
import { TransferRequestComponent } from './transfer-request.component'

describe('TransferRequestComponent', () => {
  let component: TransferRequestComponent
  let dialogRef: any
  let userProfileService: any
  let snackBar: any
  let profileV2RevampService: any

  const data = {
    portalProfile: {
      professionalDetails: [{ group: 'Group A', designation: 'Manager' }],
      employmentDetails: { departmentName: 'Current Org' },
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
    dialogRef = { close: jest.fn() }
    userProfileService = {
      editProfileDetails: jest.fn(() => of({})),
      getOrganizationData: jest.fn(() => of({
        result: { response: { count: 2, content: [{ channel: 'Org 1', rootOrgId: 'other' }, { channel: 'Self', rootOrgId: 'root' }] } },
      })),
      handleTranslateTo: jest.fn((key: string) => `translated:${key}`),
    }
    snackBar = { open: jest.fn() }
    profileV2RevampService = {
      searchIgotDesignation: jest.fn(() => of({ result: { count: 1, Term: [{ name: 'Officer' }] } })),
      searchDesignation: jest.fn(() => of({ result: { result: { data: [{ designation: 'Analyst', status: 'Active' }], totalCount: 1 } } })),
    }
    component = new TransferRequestComponent(
      dialogRef,
      data,
      userProfileService,
      snackBar,
      { unMappedUser: { id: 'user-1', rootOrg: { id: 'root' } } } as any,
      profileV2RevampService,
    )
  })

  afterEach(() => {
    component.ngOnDestroy()
    jest.useRealTimers()
  })

  it('sets initial form values and toggles other details', () => {
    expect(component.transferRequestForm.controls.group.value).toBe('Group A')
    expect(component.transferRequestForm.controls.designation.value).toBe('Manager')
    expect(component.currentOrg).toBe('Current Org')

    component.transferRequestForm.controls.organization.setValue('New Org')
    expect(component.otherDetails).toBe(true)
  })

  it('checks organization designations and loads igot/default designations', () => {
    component.selectedOrgId = 'org'
    component.checkOrgHasDesignations()
    expect(component.selectedOrgHasDesignations).toBe(true)
    expect(component.designationData[0].designation).toBe('Manager')
    expect(profileV2RevampService.searchIgotDesignation).toHaveBeenCalled()

    component.selectedOrgHasDesignations = false
    component.designationsOffset = 1
    component.getDefaultDesignations()
    expect(component.designationData.some((d: any) => d.designation === 'Analyst')).toBe(true)
    expect(component.designationsTotalCount).toBe(1)
  })

  it('handles designation service errors', () => {
    profileV2RevampService.searchIgotDesignation.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.selectedOrgId = 'org'
    component.getIgotDesignations()
    expect(snackBar.open).toHaveBeenCalledWith('Something went wrong. Please refresh or try again later.')

    profileV2RevampService.searchDesignation.mockReturnValueOnce(throwError(() => ({ ok: false })))
    component.getDefaultDesignations()
    expect(snackBar.open).toHaveBeenCalledWith('Something went wrong. Please try again later.')
  })

  it('submits valid transfer request and handles failure', () => {
    const emit = jest.spyOn(component.enableWithdraw, 'emit')
    component.transferRequestForm.controls.organization.setValue('Org 1')
    component.transferRequestForm.controls.group.setValue('Group')
    component.transferRequestForm.controls.designation.setValue('Lead')

    component.handleSubmitRequest()

    expect(userProfileService.editProfileDetails).toHaveBeenCalledWith(expect.objectContaining({
      request: expect.objectContaining({ userId: 'user-1' }),
    }))
    expect(snackBar.open).toHaveBeenCalledWith('Your transfer request has been sent for approval')
    expect(emit).toHaveBeenCalledWith(true)
    expect(dialogRef.close).toHaveBeenCalled()

    userProfileService.editProfileDetails.mockReturnValueOnce(throwError(() => ({ ok: false })))
    component.handleSubmitRequest()
    expect(snackBar.open).toHaveBeenCalledWith('translated:transferRequestFailed')
  })

  it('builds org requests and filters current org from results', () => {
    expect(component.getOrgRequest(true, 10, 'ministry').request.query).toBe('ministry')
    component.getAllDeptData(true, 0, '')
    expect(component.organizationData).toEqual([{ channel: 'Org 1', rootOrgId: 'other' }])
    expect(component.organizationDataTotalCount).toBe(2)

    userProfileService.getOrganizationData.mockReturnValueOnce(of({ result: { response: { content: [] } } }))
    component.getAllDeptData(true, 0, '')
    expect(component.organizationData).toEqual([])

    userProfileService.getOrganizationData.mockReturnValueOnce(throwError(() => ({ ok: false })))
    component.getAllDeptData(true, 0, '')
    expect(snackBar.open).toHaveBeenCalledWith('translated:orgFetchDataFailed')
  })

  it('handles dropdown scroll, close, org selection and trackBy', () => {
    const getDesignationSpy = jest.spyOn(component, 'getdesignationsMeta')
    component.designationData = [{ designation: 'Manager' }]
    component.designationsTotalCount = 2
    component.onDesignationSelectScroll({ target: { scrollTop: 95, clientHeight: 10, scrollHeight: 100 } })
    expect(component.designationsOffset).toBe(1)
    expect(getDesignationSpy).toHaveBeenCalled()

    component.transferRequestForm.controls.searchDesignation.setValue('abc')
    component.onDesignationDropdownClosed()
    expect(component.designationSearchText).toBe('')

    const orgSpy = jest.spyOn(component, 'checkOrgHasDesignations').mockImplementation()
    component.onOrgSelectionChange({ channel: 'Org 2', rootOrgId: 'org2' })
    expect(component.selectedOrgId).toBe('org2')
    expect(component.transferRequestForm.controls.organization.value).toBe('Org 2')
    expect(orgSpy).toHaveBeenCalled()

    component.organizationData = [{ channel: 'Org 1' }]
    component.organizationDataTotalCount = 2
    component.onOrgSelectScroll({ target: { scrollTop: 95, clientHeight: 10, scrollHeight: 100 } })
    expect(component.organizationListLoadCount).toBe(40)
    expect(component.trackByFn(0, { channel: 'Org 1' })).toBe('Org 1')
  })

  it('assigns initial organization data and closes modal', () => {
    component.organizationData = [{ channel: 'Org' }]
    component.assignValue()
    expect(component.deptFilterData).toEqual([{ channel: 'Org' }])
    expect(component.onLoad).toBe(false)

    expect(component.handleTranslateTo('x')).toBe('translated:x')
    component.handleCloseModal()
    expect(dialogRef.close).toHaveBeenCalled()
  })
})
