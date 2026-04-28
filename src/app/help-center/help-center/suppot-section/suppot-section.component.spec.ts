import { of } from 'rxjs'
import { SuppotSectionComponent } from './suppot-section.component'

describe('SuppotSectionComponent', () => {
  let component: SuppotSectionComponent
  let zohoFormService: any
  let dialog: any
  let snackBar: any

  const helpCenterData = {
    stateContacts: {
      Karnataka: { region: 'south', admins: [{ name: 'Ada Lovelace', designation: 'Admin', email: 'a@b.com', mobile: '99 99' }] },
      Delhi: { region: 'north', admins: [] },
    },
    utStates: ['Delhi'],
    supportSection: {
      phoneNumbers: [{ number: '123 456' }],
      supportHours: '9-5',
      features: [{ icon: 'x', label: 'Fast' }],
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
    zohoFormService = {
      handleIssueTypeChange: jest.fn(),
      toggleCentreState: jest.fn(),
      toggleAIS: jest.fn(),
      handleFileAttachment: jest.fn(),
      loadCaptcha: jest.fn(),
      resetForm: jest.fn(),
      validateAndSubmitForm: jest.fn(() => true),
      getAttachedFilesCount: jest.fn(() => 2),
      patchUserDataFromConfig: jest.fn(),
      initializeAttachmentZone: jest.fn(),
    }
    dialog = { open: jest.fn() }
    snackBar = { open: jest.fn() }
    component = new SuppotSectionComponent(
      zohoFormService,
      { get: jest.fn(() => of('<form></form>')) } as any,
      { bypassSecurityTrustHtml: jest.fn((html: string) => `safe:${html}`) } as any,
      dialog,
      snackBar,
    )
    component.helpCenterData = helpCenterData
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('loads form html and binds support config', () => {
    component.ngOnInit()
    expect(component.zohoHtml).toBe('safe:<form></form>')
    expect(component.phoneNumbers).toEqual([{ number: '123 456' }])
    expect(component.supportHours).toBe('9-5')
    expect(component.features).toEqual([{ icon: 'x', label: 'Fast' }])
    expect(component.filteredStates).toEqual(['Delhi', 'Karnataka'])
    expect(component.utStates.has('Delhi')).toBe(true)
  })

  it('reacts to input changes and section flags', () => {
    component.ngOnChanges({ helpCenterData: { currentValue: helpCenterData } } as any)
    expect(component.filteredStates).toEqual(['Delhi', 'Karnataka'])
    component.enabledSections = { phone: false }
    expect(component.isSectionEnabled('phone')).toBe(false)
    expect(component.isSectionEnabled('email')).toBe(true)
  })

  it('filters states by region and search and opens modal', () => {
    component.ngOnInit()
    component.filterRegion('south')
    expect(component.filteredStates).toEqual(['Karnataka'])
    component.filterStateGrid('kar')
    expect(component.filteredStates).toEqual(['Karnataka'])

    component.openStateModal('Karnataka')
    expect(component.selectedStateData?.admins[0].name).toBe('Ada Lovelace')
    component.onEsc()
    expect(component.selectedState).toBeNull()
  })

  it('formats names and phone numbers', () => {
    expect(component.getInitials('Ada Lovelace Byron')).toBe('AL')
    expect(component.formatPhone('99 88')).toBe('9988')
  })

  it('places call links and copies through clipboard success/fallback', async () => {
    const oldLocation = window.location
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } })
    component.onCall('12 34')
    expect(window.location.href).toBe('tel:1234')
    component.onCallNow()
    expect(window.location.href).toBe('tel:+919990141256')
    Object.defineProperty(window, 'location', { configurable: true, value: oldLocation })

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: jest.fn(() => Promise.resolve()) } })
    await component.copyToClipboard('hello')
    await Promise.resolve()
    expect(snackBar.open).toHaveBeenCalledWith('Copied!', '', { duration: 2000, panelClass: 'copy-snackbar' })

    ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('fail'))
    document.execCommand = jest.fn()
    await component.copyToClipboard('fallback')
    await Promise.resolve()
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('opens ticket dialog and wires zoho handlers', () => {
    component.zohoHtml = 'safe-form'
    component.onRaiseTicket()
    jest.advanceTimersByTime(300)

    expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: { view: 'zohoform', value: 'safe-form' },
    }))
    expect((window as any).handleIssueType('issue')).toBe(true)
    expect((window as any).toggleCentreState('state')).toBe(true)
    expect((window as any).toggleAIS('ais')).toBe(true)
    expect((window as any).zsRenderBrowseFileAttachment('file', {})).toBe(true)
    expect((window as any).zsRegenerateCaptcha()).toBe(true)
    expect((window as any).zsResetWebForm('id')).toBe(true)
    expect((window as any).zsValidateMandatoryFields()).toBe(true)
    expect((window as any).zsGetAttachedFilesCount()).toBe(2)
    expect(zohoFormService.patchUserDataFromConfig).toHaveBeenCalled()
    expect(zohoFormService.initializeAttachmentZone).toHaveBeenCalled()
  })
})
