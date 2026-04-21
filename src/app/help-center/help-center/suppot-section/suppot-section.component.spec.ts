/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SuppotSectionComponent } from './suppot-section.component'
import { of } from 'rxjs'

describe('SuppotSectionComponent', () => {
  let component: SuppotSectionComponent
  let mockZohoFormService: any
  let mockHttpClient: any
  let mockSanitizer: any
  let mockDialog: any
  let mockSnackBar: any

  const mockStateContacts = {
    'Maharashtra': {
      region: 'West',
      admins: [
        { name: 'John Doe', designation: 'Admin', email: 'john@test.com', mobile: '9876543210' },
      ],
    },
    'Karnataka': {
      region: 'South',
      admins: [
        { name: 'Jane Smith', designation: 'Manager', email: 'jane@test.com', mobile: '9876543211' },
      ],
    },
    'Delhi': {
      region: 'North',
      admins: [
        { name: 'Bob Brown', designation: 'Director', email: 'bob@test.com', mobile: '9876543212' },
      ],
    },
  }

  const mockHelpCenterData = {
    stateContacts: mockStateContacts,
    utStates: ['Delhi', 'Puducherry'],
    supportSection: {
      phoneNumbers: [
        { number: '1234567890', label: 'Helpline', clickEnabled: true, copyEnabled: true },
      ],
      supportHours: '9:00 AM - 6:00 PM IST',
      features: [
        { icon: 'support', label: 'Support Feature' },
      ],
    },
  }

  beforeEach(() => {
    // Mock ZohoFormService
    mockZohoFormService = {
      handleIssueTypeChange: jest.fn(),
      toggleCentreState: jest.fn(),
      toggleAIS: jest.fn(),
      handleFileAttachment: jest.fn(),
      loadCaptcha: jest.fn(),
      resetForm: jest.fn(),
      validateAndSubmitForm: jest.fn().mockReturnValue(true),
      getAttachedFilesCount: jest.fn().mockReturnValue(0),
      patchUserDataFromConfig: jest.fn(),
      initializeAttachmentZone: jest.fn(),
    } as any

    // Mock HttpClient
    mockHttpClient = {
      get: jest.fn().mockReturnValue(of('<html></html>')),
    } as any

    // Mock DomSanitizer
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html),
    } as any

    // Mock MatDialog
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    } as any

    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn().mockReturnValue({
        onAction: () => of(true),
      }),
    } as any

    component = new SuppotSectionComponent(
      mockZohoFormService,
      mockHttpClient,
      mockSanitizer,
      mockDialog,
      mockSnackBar
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
      expect(component.enabledSections).toEqual({})
      expect(component.helpCenterData).toBeNull()
      expect(component.filteredStates).toEqual([])
      expect(component.selectedState).toBeNull()
      expect(component.gridSearch).toBe('')
      expect(component.activeRegion).toBe('all')
      expect(component.phoneNumbers).toEqual([])
      expect(component.supportHours).toBe('8:00 AM – 8:00 PM IST')
    })

    it('should initialize features array', () => {
      expect(component.features.length).toBe(3)
      expect(component.features[0].icon).toBe('shield')
      expect(component.features[0].label).toBe('Dedicated Expert Team')
    })
  })

  describe('isSectionEnabled', () => {
    it('should return true when section is not explicitly disabled', () => {
      component.enabledSections = { someSection: true }

      const result = component.isSectionEnabled('someSection')

      expect(result).toBe(true)
    })

    it('should return false when section is explicitly disabled', () => {
      component.enabledSections = { someSection: false }

      const result = component.isSectionEnabled('someSection')

      expect(result).toBe(false)
    })

    it('should return true when section is not in enabledSections', () => {
      component.enabledSections = {}

      const result = component.isSectionEnabled('nonExistent')

      expect(result).not.toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should load Zoho form HTML', () => {
      const bindConfigSpy = jest.spyOn(component as any, 'bindConfig')

      component.ngOnInit()

      expect(mockHttpClient.get).toHaveBeenCalledWith(component.zohoUrl, { responseType: 'text' })
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html></html>')
      expect(component.zohoHtml).toBe('<html></html>')
      expect(bindConfigSpy).toHaveBeenCalled()
    })

  })

  describe('ngOnChanges', () => {
    it('should call bindConfig when helpCenterData changes', () => {
      const bindConfigSpy = jest.spyOn(component as any, 'bindConfig')
      const changes: any = {
        helpCenterData: {
          currentValue: mockHelpCenterData,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      }

      component.ngOnChanges(changes)

      expect(bindConfigSpy).toHaveBeenCalled()
    })

    it('should not call bindConfig when helpCenterData has no currentValue', () => {
      const bindConfigSpy = jest.spyOn(component as any, 'bindConfig')
      const changes: any = {
        helpCenterData: {
          currentValue: null,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      }

      component.ngOnChanges(changes)

      expect(bindConfigSpy).not.toHaveBeenCalled()
    })

    it('should not call bindConfig when no helpCenterData changes', () => {
      const bindConfigSpy = jest.spyOn(component as any, 'bindConfig')
      const changes: any = {}

      component.ngOnChanges(changes)

      expect(bindConfigSpy).not.toHaveBeenCalled()
    })
  })

  describe('bindConfig', () => {
    it('should bind state contacts from helpCenterData', () => {
      component.helpCenterData = mockHelpCenterData

        ; (component as any).bindConfig()

      expect(component.stateContacts).toEqual(mockStateContacts)
    })

    it('should bind utStates from helpCenterData', () => {
      component.helpCenterData = mockHelpCenterData

        ; (component as any).bindConfig()

      expect(component.utStates.size).toBe(2)
      expect(component.utStates.has('Delhi')).toBe(true)
      expect(component.utStates.has('Puducherry')).toBe(true)
    })

    it('should bind support section data', () => {
      component.helpCenterData = mockHelpCenterData

        ; (component as any).bindConfig()

      expect(component.phoneNumbers.length).toBe(1)
      expect(component.phoneNumbers[0].number).toBe('1234567890')
      expect(component.supportHours).toBe('9:00 AM - 6:00 PM IST')
      expect(component.features.length).toBe(1)
    })

    it('should handle missing stateContacts', () => {
      component.helpCenterData = { supportSection: {} }

        ; (component as any).bindConfig()

      expect(component.stateContacts).toEqual({})
    })

    it('should handle null helpCenterData', () => {
      component.helpCenterData = null
      component.stateContacts = {}

        ; (component as any).bindConfig()

      expect(component.filteredStates).toEqual([])
    })

    it('should call applyFilters after binding', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters')
      component.helpCenterData = mockHelpCenterData

        ; (component as any).bindConfig()

      expect(applyFiltersSpy).toHaveBeenCalled()
    })
  })

  describe('onCall', () => {
    it('should trigger phone call with formatted number', () => {
      const originalLocation = window.location
      delete (window as any).location
        ; (window as any).location = { href: '' }

      component.onCall('123 456 7890')

      expect(window.location.href).toBe('tel:1234567890')

        ; (window as any).location = originalLocation
    })

    it('should remove all spaces from phone number', () => {
      const originalLocation = window.location
      delete (window as any).location
        ; (window as any).location = { href: '' }

      component.onCall('  123  456  ')

      expect(window.location.href).toBe('tel:123456')

        ; (window as any).location = originalLocation
    })
  })

  describe('onCallNow', () => {
    it('should trigger phone call to default helpline number', () => {
      const originalLocation = window.location
      delete (window as any).location
        ; (window as any).location = { href: '' }

      component.onCallNow()

      expect(window.location.href).toBe('tel:+919990141256')

        ; (window as any).location = originalLocation
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text using navigator.clipboard', (done) => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      component.copyToClipboard('test text')

      setTimeout(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('test text')
        expect(mockSnackBar.open).toHaveBeenCalledWith('Copied!', '', {
          duration: 2000,
          panelClass: 'copy-snackbar',
        })
        done()
      }, 50)
    })

    it('should fallback to execCommand when clipboard API fails', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard not available')),
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      const mockTextarea = {
        value: '',
        select: jest.fn(),
      }
      const mockAppendChild = jest.fn()
      const mockRemoveChild = jest.fn()
      const mockExecCommand = jest.fn().mockReturnValue(true)

      document.createElement = jest.fn().mockReturnValue(mockTextarea as any)
      document.body.appendChild = mockAppendChild
      document.body.removeChild = mockRemoveChild
      document.execCommand = mockExecCommand

      component.copyToClipboard('fallback text')

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockTextarea.value).toBe('fallback text')
      expect(mockTextarea.select).toHaveBeenCalled()
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('onRaiseTicket', () => {
    it('should open Zoho dialog', () => {
      component.zohoHtml = '<form></form>'
      jest.useFakeTimers()
      const initializeZohoFormSpy = jest.spyOn(component as any, 'initializeZohoForm')

      component.onRaiseTicket()

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 'auto',
          height: '100vh',
          maxWidth: '100vw',
          data: {
            view: 'zohoform',
            value: '<form></form>',
          },
        })
      )

      jest.advanceTimersByTime(300)
      expect(initializeZohoFormSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('initializeZohoForm', () => {
    it('should expose all form handlers to window', () => {
      ; (component as any).initializeZohoForm()

      expect((window as any).handleIssueType).toBeDefined()
      expect((window as any).toggleCentreState).toBeDefined()
      expect((window as any).toggleAIS).toBeDefined()
      expect((window as any).zsRenderBrowseFileAttachment).toBeDefined()
      expect((window as any).zsRegenerateCaptcha).toBeDefined()
      expect((window as any).zsResetWebForm).toBeDefined()
      expect((window as any).zsValidateMandatoryFields).toBeDefined()
      expect((window as any).zsGetAttachedFilesCount).toBeDefined()
    })

    it('should call zohoFormService methods', () => {
      ; (component as any).initializeZohoForm()

      expect(mockZohoFormService.loadCaptcha).toHaveBeenCalled()
      expect(mockZohoFormService.patchUserDataFromConfig).toHaveBeenCalled()
      expect(mockZohoFormService.initializeAttachmentZone).toHaveBeenCalled()
    })

    it('should handle initialization errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockZohoFormService.patchUserDataFromConfig = jest.fn().mockImplementation(() => {
        throw new Error('Test error')
      })

        ; (component as any).initializeZohoForm()

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing Zoho form:', expect.any(Error))
      expect(mockZohoFormService.loadCaptcha).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should execute window handlers correctly', () => {
      ; (component as any).initializeZohoForm()

      const mockSelector = { value: 'test' }
        ; (window as any).handleIssueType(mockSelector)
      expect(mockZohoFormService.handleIssueTypeChange).toHaveBeenCalledWith(mockSelector)

        ; (window as any).toggleCentreState(mockSelector)
      expect(mockZohoFormService.toggleCentreState).toHaveBeenCalledWith(mockSelector)

        ; (window as any).toggleAIS(mockSelector)
      expect(mockZohoFormService.toggleAIS).toHaveBeenCalledWith(mockSelector)

        ; (window as any).zsRenderBrowseFileAttachment('path', {})
      expect(mockZohoFormService.handleFileAttachment).toHaveBeenCalledWith('path', {})

        ; (window as any).zsRegenerateCaptcha()
      expect(mockZohoFormService.loadCaptcha).toHaveBeenCalled()

        ; (window as any).zsResetWebForm('formId')
      expect(mockZohoFormService.resetForm).toHaveBeenCalledWith('formId')

      const validateResult = (window as any).zsValidateMandatoryFields()
      expect(validateResult).toBe(true)

      const countResult = (window as any).zsGetAttachedFilesCount()
      expect(countResult).toBe(0)
    })
  })

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      const result = component.getInitials('John Doe')

      expect(result).toBe('JD')
    })

    it('should handle single name', () => {
      const result = component.getInitials('John')

      expect(result).toBe('J')
    })

    it('should take only first two words', () => {
      const result = component.getInitials('John Michael Doe')

      expect(result).toBe('JM')
    })

    it('should return uppercase initials', () => {
      const result = component.getInitials('alice bob')

      expect(result).toBe('AB')
    })
  })

  describe('applyFilters', () => {
    beforeEach(() => {
      component.stateContacts = mockStateContacts
    })

    it('should filter all states when activeRegion is all', () => {
      component.activeRegion = 'all'
      component.gridSearch = ''

      component.applyFilters()

      expect(component.filteredStates.length).toBe(3)
      expect(component.filteredStates).toContain('Maharashtra')
      expect(component.filteredStates).toContain('Karnataka')
      expect(component.filteredStates).toContain('Delhi')
    })

    it('should filter states by region', () => {
      component.activeRegion = 'South'
      component.gridSearch = ''

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
      expect(component.filteredStates).toContain('Karnataka')
    })

    it('should filter states by search text', () => {
      component.activeRegion = 'all'
      component.gridSearch = 'kar'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
      expect(component.filteredStates).toContain('Karnataka')
    })

    it('should filter states by region and search text', () => {
      component.activeRegion = 'West'
      component.gridSearch = 'maha'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
      expect(component.filteredStates).toContain('Maharashtra')
    })

    it('should return empty array when no states match', () => {
      component.activeRegion = 'all'
      component.gridSearch = 'nonexistent'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(0)
    })

    it('should handle null stateContacts', () => {
      component.stateContacts = null as any

      component.applyFilters()

      expect(component.filteredStates).toEqual([])
    })

    it('should sort states alphabetically', () => {
      component.activeRegion = 'all'
      component.gridSearch = ''

      component.applyFilters()

      expect(component.filteredStates[0]).toBe('Delhi')
      expect(component.filteredStates[1]).toBe('Karnataka')
      expect(component.filteredStates[2]).toBe('Maharashtra')
    })

    it('should be case insensitive for search', () => {
      component.activeRegion = 'all'
      component.gridSearch = 'DELHI'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
      expect(component.filteredStates).toContain('Delhi')
    })
  })

  describe('filterRegion', () => {
    it('should set activeRegion and call applyFilters', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters')

      component.filterRegion('North')

      expect(component.activeRegion).toBe('North')
      expect(applyFiltersSpy).toHaveBeenCalled()
    })

    it('should handle all region filter', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters')

      component.filterRegion('all')

      expect(component.activeRegion).toBe('all')
      expect(applyFiltersSpy).toHaveBeenCalled()
    })
  })

  describe('filterStateGrid', () => {
    it('should set gridSearch and call applyFilters', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters')

      component.filterStateGrid('test')

      expect(component.gridSearch).toBe('test')
      expect(applyFiltersSpy).toHaveBeenCalled()
    })

    it('should handle empty search', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters')

      component.filterStateGrid('')

      expect(component.gridSearch).toBe('')
      expect(applyFiltersSpy).toHaveBeenCalled()
    })
  })

  describe('openStateModal', () => {
    it('should set selectedState', () => {
      component.openStateModal('Maharashtra')

      expect(component.selectedState).toBe('Maharashtra')
    })
  })

  describe('closeStateModal', () => {
    it('should reset selectedState to null', () => {
      component.selectedState = 'Maharashtra'

      component.closeStateModal()

      expect(component.selectedState).toBeNull()
    })
  })

  describe('onEsc', () => {
    it('should call closeStateModal', () => {
      const closeModalSpy = jest.spyOn(component, 'closeStateModal')

      component.onEsc()

      expect(closeModalSpy).toHaveBeenCalled()
    })
  })

  describe('formatPhone', () => {
    it('should remove all spaces from phone number', () => {
      const result = component.formatPhone('123 456 7890')

      expect(result).toBe('1234567890')
    })

    it('should handle phone number without spaces', () => {
      const result = component.formatPhone('1234567890')

      expect(result).toBe('1234567890')
    })

    it('should handle phone number with multiple spaces', () => {
      const result = component.formatPhone('  123  456  ')

      expect(result).toBe('123456')
    })
  })

  describe('selectedStateData', () => {
    it('should return state data for selected state', () => {
      component.stateContacts = mockStateContacts
      component.selectedState = 'Maharashtra'

      const result = component.selectedStateData

      expect(result).toEqual(mockStateContacts['Maharashtra'])
    })

    it('should return null when no state is selected', () => {
      component.stateContacts = mockStateContacts
      component.selectedState = null

      const result = component.selectedStateData

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined helpCenterData properties', () => {
      component.helpCenterData = {}

        ; (component as any).bindConfig()

      expect(component.stateContacts).toEqual({})
    })

    it('should handle partial supportSection data', () => {
      component.helpCenterData = {
        supportSection: {
          phoneNumbers: [{ number: '123', label: 'Test' }],
        },
      }

        ; (component as any).bindConfig()

      expect(component.phoneNumbers.length).toBe(1)
      expect(component.supportHours).toBe('8:00 AM – 8:00 PM IST')
    })

    it('should handle state with null region', () => {
      component.stateContacts = {
        'TestState': {
          region: null as any,
          admins: [],
        },
      }
      component.activeRegion = 'all'

      component.applyFilters()

      expect(component.filteredStates).toContain('TestState')
    })

    it('should handle filtering when region does not match', () => {
      component.stateContacts = mockStateContacts
      component.activeRegion = 'NonExistentRegion'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(0)
    })

    it('should handle empty state name in getInitials', () => {
      const result = component.getInitials('')

      expect(result).toBe('')
    })

    it('should handle state with undefined admins', () => {
      component.stateContacts = {
        'TestState': {
          region: 'North',
          admins: undefined as any,
        },
      }
      component.selectedState = 'TestState'

      expect(component.selectedStateData?.admins).toBeUndefined()
    })

    it('should properly filter by multiple criteria simultaneously', () => {
      component.stateContacts = mockStateContacts
      component.activeRegion = 'South'
      component.gridSearch = 'kar'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
      expect(component.filteredStates[0]).toBe('Karnataka')
    })

    it('should handle empty stateContacts object', () => {
      component.stateContacts = {}
      component.activeRegion = 'all'

      component.applyFilters()

      expect(component.filteredStates).toEqual([])
    })

    it('should maintain state after multiple filter operations', () => {
      component.stateContacts = mockStateContacts

      component.filterRegion('West')
      expect(component.activeRegion).toBe('West')
      expect(component.filteredStates.length).toBe(1)

      component.filterStateGrid('maha')
      expect(component.gridSearch).toBe('maha')
      expect(component.filteredStates.length).toBe(1)

      component.filterRegion('all')
      expect(component.filteredStates.length).toBe(1)
    })

    it('should handle supportSection without features', () => {
      component.helpCenterData = {
        supportSection: {
          phoneNumbers: [],
          supportHours: '24/7',
        },
      }

        ; (component as any).bindConfig()

      expect(component.phoneNumbers).toEqual([])
      expect(component.supportHours).toBe('24/7')
      expect(component.features.length).toBe(3)
    })

    it('should handle supportSection without phoneNumbers', () => {
      component.helpCenterData = {
        supportSection: {
          supportHours: '10:00 AM - 5:00 PM',
          features: [],
        },
      }

        ; (component as any).bindConfig()

      expect(component.phoneNumbers).toEqual([])
      expect(component.features).toEqual([])
    })

    it('should handle supportSection without supportHours', () => {
      component.helpCenterData = {
        supportSection: {
          phoneNumbers: [{ number: '123' }],
          features: [{ icon: 'test', label: 'Test' }],
        },
      }

        ; (component as any).bindConfig()

      expect(component.supportHours).toBe('8:00 AM – 8:00 PM IST')
    })
  })

  describe('additional coverage', () => {
    it('should handle zoho form initialization with empty config', () => {
      component.zohoHtml = null

      expect(() => component.onRaiseTicket()).not.toThrow()
    })

    it('should expose zsGetAttachedFilesCount that returns number', () => {
      mockZohoFormService.getAttachedFilesCount = jest.fn().mockReturnValue(5)

        ; (component as any).initializeZohoForm()

      const count = (window as any).zsGetAttachedFilesCount()
      expect(count).toBe(5)
    })

    it('should expose zsValidateMandatoryFields that returns boolean', () => {
      mockZohoFormService.validateAndSubmitForm = jest.fn().mockReturnValue(false)

        ; (component as any).initializeZohoForm()

      const result = (window as any).zsValidateMandatoryFields()
      expect(result).toBe(false)
    })

    it('should call applyFilters multiple times correctly', () => {
      component.stateContacts = mockStateContacts

      component.applyFilters()
      const firstLength = component.filteredStates.length

      component.applyFilters()
      const secondLength = component.filteredStates.length

      expect(firstLength).toBe(secondLength)
    })

    it('should handle modal state changes', () => {
      expect(component.selectedState).toBeNull()

      component.openStateModal('Maharashtra')
      expect(component.selectedState).toBe('Maharashtra')

      component.openStateModal('Karnataka')
      expect(component.selectedState).toBe('Karnataka')

      component.closeStateModal()
      expect(component.selectedState).toBeNull()
    })

    it('should format phone with special characters', () => {
      const result = component.formatPhone('+91 999 014 1256')

      expect(result).toBe('+919990141256')
    })

    it('should handle getInitials with extra spaces', () => {
      const result = component.getInitials('  John   Doe  ')

      expect(result).toBe('')
    })

    it('should handle very long state names in search', () => {
      component.stateContacts = {
        'VeryLongStateName': { region: 'Test', admins: [] },
      }
      component.gridSearch = 'verylongstatename'

      component.applyFilters()

      expect(component.filteredStates.length).toBe(1)
    })

    it('should handle selectedStateData when state does not exist', () => {
      component.stateContacts = mockStateContacts
      component.selectedState = 'NonExistentState'

      const result = component.selectedStateData

      expect(result).toBeUndefined()
    })

    it('should maintain filter state after closing modal', () => {
      component.stateContacts = mockStateContacts
      component.activeRegion = 'West'
      component.gridSearch = 'maha'
      component.applyFilters()

      component.openStateModal('Maharashtra')
      expect(component.selectedState).toBe('Maharashtra')

      component.closeStateModal()
      expect(component.filteredStates.length).toBe(1)
    })
  })
})
