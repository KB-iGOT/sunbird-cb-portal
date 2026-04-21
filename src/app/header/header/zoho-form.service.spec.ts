/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { ZohoFormService } from './zoho-form.service'

describe('ZohoFormService', () => {
  let service: ZohoFormService
  let mockConfigSvc: any

  const mockUserProfile = {
    profileDetails: {
      personalDetails: {
        firstname: 'John Doe',
        primaryEmail: 'john@example.com',
        mobile: '9876543210',
      },
      professionalDetails: [
        {
          designation: 'Senior Developer',
        },
      ],
    },
  }

  beforeEach(() => {
    // Mock ConfigurationsService
    mockConfigSvc = {
      unMappedUser: mockUserProfile,
    } as any

    // Reset DOM
    document.body.innerHTML = ''

    service = new ZohoFormService(mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeDefined()
    })

    it('should initialize user data from config service', () => {
      expect(service['userProfileData']).toEqual(mockUserProfile)
    })
  })

  describe('getAttachedFilesCount', () => {
    it('should return the count of attached files', () => {
      service['zsAttachedAttachmentsCount'] = 3

      const count = service.getAttachedFilesCount()

      expect(count).toBe(3)
    })

    it('should return 0 when no files are attached', () => {
      service['zsAttachedAttachmentsCount'] = 0

      const count = service.getAttachedFilesCount()

      expect(count).toBe(0)
    })
  })

  describe('handleIssueTypeChange', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="others-block"></div>
        <input id="subject-input" />
      `
    })

    it('should show others block when Others is selected', () => {
      const selectElement = document.createElement('select')
      selectElement.value = 'Others'
      const option = document.createElement('option')
      option.text = 'Others'
      option.value = 'Others'
      selectElement.appendChild(option)
      selectElement.selectedIndex = 0

      service.handleIssueTypeChange(selectElement)

      const othersBlock = document.getElementById('others-block')
      expect(othersBlock?.classList.contains('visible')).toBe(true)
    })

    it('should hide others block when Others is not selected', () => {
      const othersBlock = document.getElementById('others-block')
      othersBlock?.classList.add('visible')

      const selectElement = document.createElement('select')
      selectElement.value = 'Technical Issue'
      const option = document.createElement('option')
      option.text = 'Technical Issue'
      option.value = 'Technical Issue'
      selectElement.appendChild(option)
      selectElement.selectedIndex = 0

      service.handleIssueTypeChange(selectElement)

      expect(othersBlock?.classList.contains('visible')).toBe(false)
    })

    it('should update subject field with issue type', () => {
      const selectElement = document.createElement('select')
      selectElement.value = 'Login Issue'
      const option = document.createElement('option')
      option.text = 'Login Issue'
      option.value = 'Login Issue'
      selectElement.appendChild(option)
      selectElement.selectedIndex = 0

      service.handleIssueTypeChange(selectElement)

      const subjectInput = document.getElementById('subject-input') as HTMLInputElement
      expect(subjectInput.value).toBe('APAR/CA issue - Login Issue')
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const selectElement: any = null

      service.handleIssueTypeChange(selectElement)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('toggleCentreState', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="ministry-block"></div>
        <div id="ministry-label"></div>
        <input id="ministry-input" />
        <button id="btn-centre"></button>
        <button id="btn-state"></button>
      `
    })

    it('should configure for Centre selection', () => {
      const radioElement = { value: 'Centre' }

      service.toggleCentreState(radioElement)

      const ministryBlock = document.getElementById('ministry-block')
      const ministryLabel = document.getElementById('ministry-label')
      const ministryInput = document.getElementById('ministry-input') as HTMLInputElement
      const btnCentre = document.getElementById('btn-centre')

      expect(ministryBlock?.classList.contains('visible')).toBe(true)
      expect(ministryLabel?.textContent).toBe('Ministry / Department / Organization')
      expect(ministryInput.placeholder).toBe('Enter ministry, department or organization name')
      expect(btnCentre?.classList.contains('active')).toBe(true)
    })

    it('should configure for State selection', () => {
      const radioElement = { value: 'State' }

      service.toggleCentreState(radioElement)

      const ministryLabel = document.getElementById('ministry-label')
      const ministryInput = document.getElementById('ministry-input') as HTMLInputElement
      const btnState = document.getElementById('btn-state')

      expect(ministryLabel?.textContent).toBe('State / Department / Organization')
      expect(ministryInput.placeholder).toBe('Enter state, department or organization name')
      expect(btnState?.classList.contains('active')).toBe(true)
    })

    it('should remove active class from both buttons before setting new one', () => {
      const btnCentre = document.getElementById('btn-centre')
      const btnState = document.getElementById('btn-state')
      btnCentre?.classList.add('active')
      btnState?.classList.add('active')

      const radioElement = { value: 'Centre' }
      service.toggleCentreState(radioElement)

      expect(btnState?.classList.contains('active')).toBe(false)
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      document.body.innerHTML = ''
      const invalidElement: any = null

      service.toggleCentreState(invalidElement)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('toggleAIS', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="ais-block"></div>
        <div id="ais-label-text"></div>
        <select id="CASECF29"></select>
        <select id="CASECF24"></select>
        <select id="CASECF27"></select>
        <select id="CASECF26"></select>
      `
    })

    it('should show AIS block when checkbox is checked', () => {
      const checkboxElement = { checked: true }
      jest.spyOn(service as any, 'ensureBatchYearsPopulated').mockImplementation()

      service.toggleAIS(checkboxElement)

      const aisBlock = document.getElementById('ais-block')
      const aisLabelText = document.getElementById('ais-label-text')
      const hiddenSelect = document.getElementById('CASECF29') as HTMLSelectElement

      expect(aisBlock?.classList.contains('visible')).toBe(true)
      expect(aisLabelText?.textContent?.trim()).toBe('Yes')
      expect(hiddenSelect.value).toBe('Yes')
    })

    it('should hide AIS block when checkbox is unchecked', () => {
      const aisBlock = document.getElementById('ais-block')
      aisBlock?.classList.add('visible')
      const checkboxElement = { checked: false }
      const clearSelectSpy = jest.spyOn(service, 'clearSelectValue')

      service.toggleAIS(checkboxElement)

      const aisLabelText = document.getElementById('ais-label-text')
      const hiddenSelect = document.getElementById('CASECF29') as HTMLSelectElement

      expect(aisBlock?.classList.contains('visible')).toBe(false)
      expect(aisLabelText?.textContent?.trim()).toBe('No')
      expect(hiddenSelect.value).toBe('No')
      expect(clearSelectSpy).toHaveBeenCalledTimes(3)
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      document.body.innerHTML = ''
      const invalidElement: any = null

      service.toggleAIS(invalidElement)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('initializeAttachmentZone', () => {
    it('should set up click handler for attachment zone', () => {
      jest.useFakeTimers()
      document.body.innerHTML = '<div class="attachment-zone"></div>'
      const triggerSpy = jest.spyOn(service as any, 'triggerFileInputClick').mockImplementation()

      service.initializeAttachmentZone()
      jest.advanceTimersByTime(100)

      const zone = document.querySelector('.attachment-zone') as HTMLElement
      zone.click()

      expect(triggerSpy).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('handleFileAttachment', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="zsFileBrowseAttachments"></div>'
      global.alert = jest.fn()
    })

    it('should return early when filePath is empty', () => {
      const element: any = { files: [], value: '' }

      service.handleFileAttachment('', element)

      expect(service.getAttachedFilesCount()).toBe(0)
    })

    it('should reject files larger than 20MB', () => {
      const element: any = {
        files: [{ size: 25 * 1024 * 1024 }],
        value: 'test.jpg',
      }

      service.handleFileAttachment('test.jpg', element)

      expect(global.alert).toHaveBeenCalledWith('Maximum allowed file size is 20MB.')
      expect(element.value).toBe('')
    })

    it('should reject unsupported file extensions', () => {
      const element: any = {
        files: [{ size: 1024 }],
        value: 'test.exe',
        id: 'zsattachment_1',
      }

      service.handleFileAttachment('test.exe', element)

      expect(global.alert).toHaveBeenCalledWith('Only .jpg, .jpeg, .png, .svg, .doc, .pdf, .mp4 files are supported')
      expect(element.value).toBe('')
    })

    it('should accept valid files', () => {
      const element: any = {
        files: [{ size: 1024 }],
        value: 'test.jpg',
        id: 'zsattachment_1',
      }
      const addFileSpy = jest.spyOn(service as any, 'addFileToDisplay').mockImplementation()

      service.handleFileAttachment('test.jpg', element)

      expect(addFileSpy).toHaveBeenCalledWith('test.jpg', 1)
      expect(service.getAttachedFilesCount()).toBe(1)
    })
  })

  describe('removeFileAttachment', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="zsattachment_1" />
        <div id="file_1"></div>
      `
      service['zsAttachedAttachmentsCount'] = 1
      service['zsAttachmentFileBrowserIdsList'] = [2, 3, 4, 5]
    })

    it('should remove file attachment and update state', () => {
      service.removeFileAttachment(1)

      const fileInput = document.getElementById('zsattachment_1') as HTMLInputElement
      const fileDiv = document.getElementById('file_1')

      expect(fileInput?.value).toBe('')
      expect(fileDiv).toBeNull()
      expect(service.getAttachedFilesCount()).toBe(0)
      expect(service['zsAttachmentFileBrowserIdsList']).toContain(1)
    })
  })

  describe('resetAttachmentState', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="zsFileBrowseAttachments"><div>File 1</div></div>
        <input id="zsattachment_1" value="test.jpg" />
        <input id="zsattachment_2" value="test2.jpg" />
      `
      service['zsAttachedAttachmentsCount'] = 2
      service['zsAttachmentFileBrowserIdsList'] = [4, 5]
    })

    it('should reset all attachment state', () => {
      service.resetAttachmentState()

      expect(service.getAttachedFilesCount()).toBe(0)
      expect(service['zsAttachmentFileBrowserIdsList']).toEqual([1, 2, 3, 4, 5])
      const container = document.getElementById('zsFileBrowseAttachments')
      expect(container?.innerHTML).toBe('')
    })
  })

  describe('loadCaptcha', () => {
    it('should make XMLHttpRequest to load captcha', () => {
      const mockXHR: any = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: JSON.stringify({ captchaUrl: 'test-url', captchaDigest: 'digest' }),
        onreadystatechange: null,
      }
      const xhrSpy = jest.spyOn(window as any, 'XMLHttpRequest').mockImplementation(() => mockXHR)
      const updateSpy = jest.spyOn(service as any, 'updateCaptchaDisplay').mockImplementation()

      service.loadCaptcha()

      expect(mockXHR.open).toHaveBeenCalled()
      expect(mockXHR.send).toHaveBeenCalled()

      mockXHR.onreadystatechange()
      expect(updateSpy).toHaveBeenCalled()

      xhrSpy.mockRestore()
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(window as any, 'XMLHttpRequest').mockImplementation(() => {
        throw new Error('Network error')
      })

      service.loadCaptcha()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('resetForm', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form name="zsWebToCase_testId"></form>
        <button id="zsSubmitButton_120349000138968626" disabled></button>
        <div id="ais-block" class="visible"></div>
        <div id="ministry-block" class="visible"></div>
        <div id="others-block" class="visible"></div>
        <input id="subject-input" value="Test Subject" />
        <input id="consent-checkbox" />
      `
    })

    it('should reset form and all conditional blocks', () => {
      const resetAISSpy = jest.spyOn(service as any, 'resetAISBlock')
      const resetMinistrySpy = jest.spyOn(service as any, 'resetMinistryBlock')
      const resetOthersSpy = jest.spyOn(service as any, 'resetOthersBlock')
      const resetSubjectSpy = jest.spyOn(service as any, 'resetSubjectField')
      const resetConsentSpy = jest.spyOn(service as any, 'resetConsentCheckbox')
      const resetAttachmentSpy = jest.spyOn(service, 'resetAttachmentState')

      service.resetForm('testId')

      expect(resetAISSpy).toHaveBeenCalled()
      expect(resetMinistrySpy).toHaveBeenCalled()
      expect(resetOthersSpy).toHaveBeenCalled()
      expect(resetSubjectSpy).toHaveBeenCalled()
      expect(resetConsentSpy).toHaveBeenCalled()
      expect(resetAttachmentSpy).toHaveBeenCalled()
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(service as any, 'resetAISBlock').mockImplementation(() => {
        throw new Error('Test error')
      })

      service.resetForm('testId')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('clearSelectValue', () => {
    it('should clear select element value', () => {
      document.body.innerHTML = '<select id="test-select"><option value="test">Test</option></select>'
      const selectElement = document.getElementById('test-select') as HTMLSelectElement
      selectElement.value = 'test'

      service.clearSelectValue('test-select')

      expect(selectElement.value).toBe('')
    })

    it('should handle missing element gracefully', () => {
      service.clearSelectValue('non-existent')

      expect(document.getElementById('non-existent')).toBeNull()
    })
  })

  describe('getBatchYear', () => {
    beforeEach(() => {
      document.body.innerHTML = '<select id="CASECF27"></select>'
    })

    it('should return batch year value', () => {
      const selectElement = document.getElementById('CASECF27') as HTMLSelectElement
      const ensureSpy = jest.spyOn(service as any, 'ensureBatchYearsPopulated').mockImplementation()
      selectElement.value = '2020'

      const result = service.getBatchYear()

      expect(ensureSpy).toHaveBeenCalled()
      expect(result).toBe('2020')
    })

    it('should return empty string when element not found', () => {
      document.body.innerHTML = ''

      const result = service.getBatchYear()

      expect(result).toBe('')
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(service as any, 'ensureBatchYearsPopulated').mockImplementation(() => {
        throw new Error('Test error')
      })

      const result = service.getBatchYear()

      expect(result).toBe('')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getAISValues', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="CASECF24"><option value="IAS">IAS</option></select>
        <select id="CASECF27"><option value="2020">2020</option></select>
        <select id="CASECF26"><option value="General">General</option></select>
      `
    })

    it('should return AIS values', () => {
      const ensureSpy = jest.spyOn(service as any, 'ensureBatchYearsPopulated').mockImplementation()
      const serviceSelect = document.getElementById('CASECF24') as HTMLSelectElement
      const batchYearSelect = document.getElementById('CASECF27') as HTMLSelectElement
      const cadreSelect = document.getElementById('CASECF26') as HTMLSelectElement
      serviceSelect.value = 'IAS'
      batchYearSelect.value = '2020'
      cadreSelect.value = 'General'

      const result = service.getAISValues()

      expect(ensureSpy).toHaveBeenCalled()
      expect(result).toEqual({
        service: 'IAS',
        batchYear: '2020',
        cadre: 'General',
      })
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(service as any, 'ensureBatchYearsPopulated').mockImplementation(() => {
        throw new Error('Test error')
      })

      const result = service.getAISValues()

      expect(result).toEqual({ service: '', batchYear: '', cadre: '' })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('patchUserDataFromConfig', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input name="Contact Name" />
        <input name="Email" />
        <input name="Phone" />
        <input name="Designation" />
      `
    })

    it('should patch user data to form fields', () => {
      service.patchUserDataFromConfig()

      const contactNameInput = document.querySelector('input[name="Contact Name"]') as HTMLInputElement
      const emailInput = document.querySelector('input[name="Email"]') as HTMLInputElement
      const phoneInput = document.querySelector('input[name="Phone"]') as HTMLInputElement
      const designationInput = document.querySelector('input[name="Designation"]') as HTMLInputElement

      expect(contactNameInput.value).toBe('John Doe')
      expect(contactNameInput.readOnly).toBe(true)
      expect(emailInput.value).toBe('john@example.com')
      expect(emailInput.readOnly).toBe(true)
      expect(phoneInput.value).toBe('9876543210')
      expect(phoneInput.readOnly).toBe(true)
      expect(designationInput.value).toBe('Senior Developer')
    })

    it('should return early when userProfileData is null', () => {
      service['userProfileData'] = null

      service.patchUserDataFromConfig()

      const contactNameInput = document.querySelector('input[name="Contact Name"]') as HTMLInputElement
      expect(contactNameInput?.value).toBe('')
    })
  })

  describe('validateAndSubmitForm', () => {
    beforeEach(() => {
      global.alert = jest.fn()
      document.body.innerHTML = `
        <form name="zsWebToCase_120349000138968626">
          <input name="Contact Name" value="John Doe" />
          <input name="Email" value="john@example.com" />
          <input name="Phone" value="9876543210" />
          <input name="Subject" value="Test Subject" />
          <select name="Issues related to Training Plan and Comprehensive">
            <option value="Issue1">Issue1</option>
          </select>
          <input id="CASECF21_centre" type="radio" checked />
          <input id="CASECF21_state" type="radio" />
          <input id="ministry-input" value="Ministry of Test" />
          <input id="ais-toggle" type="checkbox" />
          <input name="Enter Sparrow Email ID" value="" />
          <input name="zsWebFormCaptchaWord" value="12345" />
          <button id="zsSubmitButton_120349000138968626"></button>
        </form>
      `
    })

    it('should validate and return true for valid form', () => {
      const result = service.validateAndSubmitForm()

      expect(result).toBe(true)
    })

    it('should return false when mandatory field is empty', () => {
      const contactNameInput = document.querySelector('input[name="Contact Name"]') as HTMLInputElement
      contactNameInput.value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Name cannot be empty')
    })

    it('should validate email format', () => {
      const emailInput = document.querySelector('input[name="Email"]') as HTMLInputElement
      emailInput.value = 'invalid-email'

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Enter a valid email address')
    })

    it('should validate phone number format', () => {
      const phoneInput = document.querySelector('input[name="Phone"]') as HTMLInputElement
      phoneInput.value = '123'

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Enter a valid 10 digit phone number')
    })

    it('should return false when Centre/State is not selected', () => {
      const centreRadio = document.getElementById('CASECF21_centre') as HTMLInputElement
      const stateRadio = document.getElementById('CASECF21_state') as HTMLInputElement
      centreRadio.checked = false
      stateRadio.checked = false

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Please select Centre or State')
    })

    it('should validate ministry input when Centre is selected', () => {
      const ministryInput = document.getElementById('ministry-input') as HTMLInputElement
      ministryInput.value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Ministry / Department / Organization cannot be empty')
    })

    it('should validate AIS fields when AIS toggle is checked', () => {
      document.body.innerHTML = `
        <form name="zsWebToCase_120349000138968626">
          <input name="Contact Name" value="John Doe" />
          <input name="Email" value="john@example.com" />
          <input name="Phone" value="9876543210" />
          <input name="Subject" value="Test Subject" />
          <select name="Issues related to Training Plan and Comprehensive">
            <option value="Issue1">Issue1</option>
          </select>
          <input id="CASECF21_centre" type="radio" checked />
          <input id="ministry-input" value="Ministry" />
          <input id="ais-toggle" type="checkbox" checked />
          <select id="CASECF24"></select>
          <select id="CASECF27"></select>
          <select id="CASECF26"></select>
          <input name="Enter Sparrow Email ID" value="" />
          <input name="zsWebFormCaptchaWord" value="12345" />
          <button id="zsSubmitButton_120349000138968626"></button>
        </form>
      `

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('AIS Service cannot be empty')
    })

    it('should validate Sparrow email format', () => {
      const sparrowEmailInput = document.querySelector('input[name="Enter Sparrow Email ID"]') as HTMLInputElement
      sparrowEmailInput.value = 'invalid-email'

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Enter a valid Sparrow email ID')
    })

    it('should validate captcha field', () => {
      const captchaField = document.querySelector('input[name="zsWebFormCaptchaWord"]') as HTMLInputElement
      captchaField.value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Please enter the captcha code.')
    })

    it('should disable submit button on successful validation', () => {
      service.validateAndSubmitForm()

      const submitBtn = document.getElementById('zsSubmitButton_120349000138968626') as HTMLButtonElement
      expect(submitBtn.disabled).toBe(true)
    })

    it('should return false when form is not found', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      document.body.innerHTML = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      document.forms.namedItem = jest.fn(() => {
        throw new Error('Test error')
      })

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('ensureBatchYearsPopulated', () => {
    it('should populate batch years from 1960 to 2026 skipping 1961', () => {
      const selectElement = document.createElement('select')

      service['ensureBatchYearsPopulated'](selectElement)

      expect(selectElement.options.length).toBeGreaterThan(0)
      const values = Array.from(selectElement.options).map(opt => opt.value)
      expect(values).toContain('1960')
      expect(values).not.toContain('1961')
      expect(values).toContain('2026')
    })

    it('should not populate if already populated', () => {
      const selectElement = document.createElement('select')
      selectElement.innerHTML = '<option value="1">1</option><option value="2">2</option>'

      const initialLength = selectElement.options.length

      service['ensureBatchYearsPopulated'](selectElement)

      expect(selectElement.options.length).toBe(initialLength)
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const selectElement: any = null

      service['ensureBatchYearsPopulated'](selectElement)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
