import { ZohoFormService } from './zoho-form.service'

describe('ZohoFormService', () => {
  let service: ZohoFormService
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = {
      unMappedUser: {
        profileDetails: {
          personalDetails: {
            firstname: 'John',
            primaryEmail: 'john@example.com',
            mobile: '9876543210',
          },
          professionalDetails: [{ designation: 'Engineer' }],
        },
      },
    }
    service = new ZohoFormService(mockConfigSvc)
  })

  afterEach(() => {
    // Clean DOM after each test
    document.body.innerHTML = ''
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize userProfileData from configSvc.unMappedUser', () => {
      expect(service['userProfileData']).toBe(mockConfigSvc.unMappedUser)
    })

    it('should leave userProfileData null when unMappedUser is not set', () => {
      mockConfigSvc.unMappedUser = null
      const svc = new ZohoFormService(mockConfigSvc)
      // initializeUserData sets it to null
      expect(svc['userProfileData']).toBeNull()
    })
  })

  describe('getAttachedFilesCount', () => {
    it('should return 0 initially', () => {
      expect(service.getAttachedFilesCount()).toBe(0)
    })

    it('should reflect incremented count after file attachment', () => {
      service['zsAttachedAttachmentsCount'] = 3
      expect(service.getAttachedFilesCount()).toBe(3)
    })
  })

  describe('handleIssueTypeChange', () => {
    it('should show others-block when value is Others', () => {
      const othersBlock = document.createElement('div')
      othersBlock.id = 'others-block'
      const subjectInput = document.createElement('input')
      subjectInput.id = 'subject-input'
      document.body.append(othersBlock, subjectInput)

      const selectElement = { value: 'Others', options: [{ text: 'Others' }], selectedIndex: 0 }
      service.handleIssueTypeChange(selectElement)

      expect(othersBlock.classList.contains('visible')).toBe(true)
    })

    it('should hide others-block when value is not Others', () => {
      const othersBlock = document.createElement('div')
      othersBlock.id = 'others-block'
      othersBlock.classList.add('visible')
      const subjectInput = document.createElement('input')
      subjectInput.id = 'subject-input'
      document.body.append(othersBlock, subjectInput)

      const selectElement = { value: 'APAR', options: [{ text: 'APAR Issue' }], selectedIndex: 0 }
      service.handleIssueTypeChange(selectElement)

      expect(othersBlock.classList.contains('visible')).toBe(false)
    })

    it('should update subject field with SUBJECT_PREFIX + issue label', () => {
      const subjectInput = document.createElement('input')
      subjectInput.id = 'subject-input'
      document.body.appendChild(subjectInput)

      const selectElement = { value: 'APAR', options: [{ text: 'APAR Issue' }], selectedIndex: 0 }
      service.handleIssueTypeChange(selectElement)

      expect(subjectInput.value).toBe('APAR/CA issue - APAR Issue')
    })

    it('should set subject to prefix only when value is empty', () => {
      const subjectInput = document.createElement('input')
      subjectInput.id = 'subject-input'
      document.body.appendChild(subjectInput)

      const selectElement = { value: '', options: [{ text: '' }], selectedIndex: 0 }
      service.handleIssueTypeChange(selectElement)

      expect(subjectInput.value).toBe('APAR/CA issue - ')
    })

    it('should handle missing DOM elements gracefully without throwing', () => {
      expect(() =>
        service.handleIssueTypeChange({ value: 'Others', options: [], selectedIndex: 0 })
      ).not.toThrow()
    })
  })

  describe('toggleCentreState', () => {
    function setupMinistryDOM() {
      const ministryBlock = document.createElement('div')
      ministryBlock.id = 'ministry-block'
      const ministryLabel = document.createElement('label')
      ministryLabel.id = 'ministry-label'
      const ministryInput = document.createElement('input')
      ministryInput.id = 'ministry-input'
      const btnCentre = document.createElement('button')
      btnCentre.id = 'btn-centre'
      const btnState = document.createElement('button')
      btnState.id = 'btn-state'
      document.body.append(ministryBlock, ministryLabel, ministryInput, btnCentre, btnState)
      return { ministryBlock, ministryLabel, ministryInput, btnCentre, btnState }
    }

    it('should make ministry-block visible and activate Centre button', () => {
      const { ministryBlock, btnCentre, btnState } = setupMinistryDOM()

      service.toggleCentreState({ value: 'Centre' })

      expect(ministryBlock.classList.contains('visible')).toBe(true)
      expect(btnCentre.classList.contains('active')).toBe(true)
      expect(btnState.classList.contains('active')).toBe(false)
    })

    it('should set Ministry label text for Centre', () => {
      const { ministryLabel, ministryInput } = setupMinistryDOM()

      service.toggleCentreState({ value: 'Centre' })

      expect(ministryLabel.textContent).toBe('Ministry / Department / Organization')
      expect(ministryInput.placeholder).toBe('Enter ministry, department or organization name')
    })

    it('should activate State button and set State label', () => {
      const { btnState, ministryLabel } = setupMinistryDOM()

      service.toggleCentreState({ value: 'State' })

      expect(btnState.classList.contains('active')).toBe(true)
      expect(ministryLabel.textContent).toBe('State / Department / Organization')
    })

    it('should handle missing DOM elements gracefully', () => {
      expect(() => service.toggleCentreState({ value: 'Centre' })).not.toThrow()
    })
  })

  describe('toggleAIS', () => {
    function setupAISDOM() {
      const aisBlock = document.createElement('div')
      aisBlock.id = 'ais-block'
      const aisLabelText = document.createElement('span')
      aisLabelText.id = 'ais-label-text'
      const hiddenSelect = document.createElement('select')
      hiddenSelect.id = 'CASECF29'
      // Must add options so .value assignment works
      const optNo = document.createElement('option')
      optNo.value = 'No'
      const optYes = document.createElement('option')
      optYes.value = 'Yes'
      hiddenSelect.append(optNo, optYes)
      document.body.append(aisBlock, aisLabelText, hiddenSelect)
      return { aisBlock, aisLabelText, hiddenSelect }
    }

    it('should show ais-block and set Yes when checkbox checked', () => {
      const { aisBlock, aisLabelText, hiddenSelect } = setupAISDOM()

      service.toggleAIS({ checked: true })

      expect(aisBlock.classList.contains('visible')).toBe(true)
      expect(aisLabelText.textContent).toBe('Yes')
      expect(hiddenSelect.value).toBe('Yes')
    })

    it('should hide ais-block and set No when checkbox unchecked', () => {
      const { aisBlock, aisLabelText, hiddenSelect } = setupAISDOM()
      aisBlock.classList.add('visible')

      service.toggleAIS({ checked: false })

      expect(aisBlock.classList.contains('visible')).toBe(false)
      expect(aisLabelText.textContent).toBe('No')
      expect(hiddenSelect.value).toBe('No')
    })

    it('should handle missing DOM elements gracefully', () => {
      expect(() => service.toggleAIS({ checked: true })).not.toThrow()
    })

    it('should populate batch years when AIS is enabled', () => {
      setupAISDOM()
      const batchYearSelect = document.createElement('select')
      batchYearSelect.id = 'CASECF27'
      document.body.appendChild(batchYearSelect)

      service.toggleAIS({ checked: true })

      expect(batchYearSelect.options.length).toBeGreaterThan(1)
    })
  })

  describe('handleFileAttachment', () => {
    it('should return early if filePath is empty', () => {
      service.handleFileAttachment('', { files: null })
      expect(service.getAttachedFilesCount()).toBe(0)
    })

    it('should alert and return if file size exceeds 20MB', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const elem = { files: [{ size: 21 * 1024 * 1024 }], value: '' }

      service.handleFileAttachment('test.pdf', elem)

      expect(window.alert).toHaveBeenCalledWith('Maximum allowed file size is 20MB.')
      expect(service.getAttachedFilesCount()).toBe(0)
        ; (window.alert as jest.Mock).mockRestore()
    })

    it('should alert for disallowed file extension', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const elem = { files: [{ size: 1 * 1024 * 1024 }], value: '', id: 'zsattachment_1' }

      service.handleFileAttachment('malware.exe', elem)

      expect(window.alert).toHaveBeenCalledWith(
        'Only .jpg, .jpeg, .png, .svg, .doc, .pdf, .mp4 files are supported'
      )
        ; (window.alert as jest.Mock).mockRestore()
    })

    it('should increment count for a valid file', () => {
      const container = document.createElement('div')
      container.id = 'zsFileBrowseAttachments'
      document.body.appendChild(container)
      const elem = { files: [{ size: 1 * 1024 * 1024 }], value: '', id: 'zsattachment_1' }

      service.handleFileAttachment('test.pdf', elem)

      expect(service.getAttachedFilesCount()).toBe(1)
    })

    it('should handle Windows path with backslashes', () => {
      const container = document.createElement('div')
      container.id = 'zsFileBrowseAttachments'
      document.body.appendChild(container)
      const elem = { files: [{ size: 1 * 1024 * 1024 }], value: '', id: 'zsattachment_2' }

      service.handleFileAttachment('C:\\Users\\test\\report.pdf', elem)

      expect(service.getAttachedFilesCount()).toBe(1)
    })

    it('should accept jpg extension', () => {
      const container = document.createElement('div')
      container.id = 'zsFileBrowseAttachments'
      document.body.appendChild(container)
      const elem = { files: [{ size: 1 * 1024 * 1024 }], value: '', id: 'zsattachment_3' }

      service.handleFileAttachment('photo.jpg', elem)

      expect(service.getAttachedFilesCount()).toBe(1)
    })

    it('should remove fileId from available list after attachment', () => {
      const container = document.createElement('div')
      container.id = 'zsFileBrowseAttachments'
      document.body.appendChild(container)
      const elem = { files: [{ size: 1 * 1024 * 1024 }], value: '', id: 'zsattachment_1' }

      service.handleFileAttachment('test.pdf', elem)

      expect(service['zsAttachmentFileBrowserIdsList']).not.toContain(1)
    })
  })

  describe('removeFileAttachment', () => {
    it('should decrement count and add fileId back to list sorted', () => {
      service['zsAttachedAttachmentsCount'] = 1
      service['zsAttachmentFileBrowserIdsList'] = [2, 3, 4, 5]

      service.removeFileAttachment(1)

      expect(service['zsAttachedAttachmentsCount']).toBe(0)
      expect(service['zsAttachmentFileBrowserIdsList']).toContain(1)
      expect(service['zsAttachmentFileBrowserIdsList'][0]).toBe(1)
    })

    it('should remove file element from DOM', () => {
      const fileDiv = document.createElement('div')
      fileDiv.id = 'file_1'
      document.body.appendChild(fileDiv)
      service['zsAttachedAttachmentsCount'] = 1
      service['zsAttachmentFileBrowserIdsList'] = [2, 3, 4, 5]

      service.removeFileAttachment(1)

      expect(document.getElementById('file_1')).toBeNull()
    })

    it('should clear file input value if element exists', () => {
      const fileInput = document.createElement('input') as HTMLInputElement
      fileInput.id = 'zsattachment_1'
      fileInput.value = 'some-file.pdf'
      document.body.appendChild(fileInput)
      service['zsAttachedAttachmentsCount'] = 1
      service['zsAttachmentFileBrowserIdsList'] = [2, 3, 4, 5]

      service.removeFileAttachment(1)

      expect(fileInput.value).toBe('')
    })
  })

  describe('resetAttachmentState', () => {
    it('should reset count to 0', () => {
      service['zsAttachedAttachmentsCount'] = 3
      service.resetAttachmentState()
      expect(service['zsAttachedAttachmentsCount']).toBe(0)
    })

    it('should restore id list to [1,2,3,4,5]', () => {
      service['zsAttachmentFileBrowserIdsList'] = [3, 4]
      service.resetAttachmentState()
      expect(service['zsAttachmentFileBrowserIdsList']).toEqual([1, 2, 3, 4, 5])
    })

    it('should clear container innerHTML', () => {
      const container = document.createElement('div')
      container.id = 'zsFileBrowseAttachments'
      container.innerHTML = '<div>file</div>'
      document.body.appendChild(container)

      service.resetAttachmentState()

      expect(container.innerHTML).toBe('')
    })

    it('should clear all file inputs', () => {
      for (let i = 1; i <= 5; i++) {
        const input = document.createElement('input') as HTMLInputElement
        input.id = `zsattachment_${i}`
          ; (input as any).value = 'file.pdf'
        document.body.appendChild(input)
      }

      service.resetAttachmentState()

      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`zsattachment_${i}`) as HTMLInputElement
        expect(input.value).toBe('')
      }
    })
  })

  describe('clearSelectValue', () => {
    it('should clear the value of a select element by id', () => {
      const select = document.createElement('select')
      select.id = 'test-select'
      const opt = document.createElement('option')
      opt.value = 'val'
      select.appendChild(opt)
      document.body.appendChild(select)
      select.value = 'val'

      service.clearSelectValue('test-select')

      expect(select.value).toBe('')
    })

    it('should not throw if element does not exist', () => {
      expect(() => service.clearSelectValue('non-existent-id')).not.toThrow()
    })
  })

  describe('getBatchYear', () => {
    it('should return empty string if element does not exist', () => {
      expect(service.getBatchYear()).toBe('')
    })

    it('should populate batch years and return value', () => {
      const select = document.createElement('select')
      select.id = 'CASECF27'
      document.body.appendChild(select)

      service.getBatchYear()

      expect(select.options.length).toBeGreaterThan(1)
    })
  })

  describe('getAISValues', () => {
    it('should return empty values when DOM elements do not exist', () => {
      const result = service.getAISValues()
      expect(result).toEqual({ service: '', batchYear: '', cadre: '' })
    })

    it('should return values from DOM elements', () => {
      const serviceSelect = document.createElement('select')
      serviceSelect.id = 'CASECF24'
      const opt = document.createElement('option')
      opt.value = 'IAS'
      serviceSelect.appendChild(opt)
      serviceSelect.value = 'IAS'

      const batchSelect = document.createElement('select')
      batchSelect.id = 'CASECF27'

      const cadreSelect = document.createElement('select')
      cadreSelect.id = 'CASECF26'

      document.body.append(serviceSelect, batchSelect, cadreSelect)

      const result = service.getAISValues()
      expect(result.service).toBe('IAS')
    })
  })

  describe('resetForm', () => {
    it('should not throw when form does not exist', () => {
      expect(() => service.resetForm('testFormId')).not.toThrow()
    })

    it('should re-enable submit button if it exists', () => {
      const btn = document.createElement('button')
      btn.id = 'zsSubmitButton_120349000138968626'
      btn.setAttribute('disabled', 'true')
      document.body.appendChild(btn)

      service.resetForm('testFormId')

      expect(btn.getAttribute('disabled')).toBeNull()
    })
  })

  describe('patchUserDataFromConfig', () => {
    it('should return without error when userProfileData is null', () => {
      service['userProfileData'] = null
      expect(() => service.patchUserDataFromConfig()).not.toThrow()
    })

    it('should populate Contact Name input', () => {
      const input = document.createElement('input')
      input.setAttribute('name', 'Contact Name')
      document.body.appendChild(input)

      service.patchUserDataFromConfig()

      expect(input.value).toBe('John')
    })

    it('should populate Email input', () => {
      const input = document.createElement('input')
      input.setAttribute('name', 'Email')
      document.body.appendChild(input)

      service.patchUserDataFromConfig()

      expect(input.value).toBe('john@example.com')
    })

    it('should populate Phone input', () => {
      const input = document.createElement('input')
      input.setAttribute('name', 'Phone')
      document.body.appendChild(input)

      service.patchUserDataFromConfig()

      expect(input.value).toBe('9876543210')
    })

    it('should handle missing personalDetails gracefully', () => {
      service['userProfileData'] = {
        profileDetails: {
          personalDetails: {},
          professionalDetails: [],
        },
      }
      expect(() => service.patchUserDataFromConfig()).not.toThrow()
    })

    it('should populate Designation input', () => {
      const input = document.createElement('input')
      input.setAttribute('name', 'Designation')
      document.body.appendChild(input)

      service.patchUserDataFromConfig()

      expect(input.value).toBe('Engineer')
    })
  })

  describe('initializeAttachmentZone', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should not throw when zone is missing', () => {
      expect(() => service.initializeAttachmentZone()).not.toThrow()
      jest.runAllTimers()
    })

    it('should attach onclick handler to attachment zone', () => {
      const zone = document.createElement('div')
      zone.className = 'attachment-zone'
      document.body.appendChild(zone)

      service.initializeAttachmentZone()
      jest.runAllTimers()

      expect(zone.onclick).not.toBeNull()
    })

    it('should trigger file input click when zone is clicked and fileId list is non-empty', () => {
      const zone = document.createElement('div')
      zone.className = 'attachment-zone'
      document.body.appendChild(zone)

      const fileInput = document.createElement('input')
      fileInput.id = 'zsattachment_1'
      document.body.appendChild(fileInput)
      const clickSpy = jest.spyOn(fileInput, 'click')

      service.initializeAttachmentZone()
      jest.runAllTimers()
      zone.onclick!(new MouseEvent('click'))

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should not throw when fileId list is empty', () => {
      const zone = document.createElement('div')
      zone.className = 'attachment-zone'
      document.body.appendChild(zone)
      service['zsAttachmentFileBrowserIdsList'] = []

      service.initializeAttachmentZone()
      jest.runAllTimers()

      expect(() => zone.onclick!(new MouseEvent('click'))).not.toThrow()
    })
  })

  describe('loadCaptcha', () => {
    let xhrMock: any
    let origXHR: any

    beforeEach(() => {
      xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        onreadystatechange: null as any,
        readyState: 4,
        status: 200,
        responseText: JSON.stringify({ captchaUrl: 'http://example.com/captcha.png', captchaDigest: 'abc123' }),
      }
      origXHR = (global as any).XMLHttpRequest
        ; (global as any).XMLHttpRequest = jest.fn(() => xhrMock)
    })

    afterEach(() => {
      ; (global as any).XMLHttpRequest = origXHR
    })

    it('should call open and send on XMLHttpRequest', () => {
      service.loadCaptcha()

      expect(xhrMock.open).toHaveBeenCalledWith('GET', expect.stringContaining('GenerateCaptcha'), true)
      expect(xhrMock.send).toHaveBeenCalled()
    })

    it('should update captcha image when readyState=4 and status=200', () => {
      const img = document.createElement('img')
      img.id = 'zsCaptchaUrl'
      img.style.display = 'none'
      const loading = document.createElement('div')
      loading.id = 'zsCaptchaLoading'
      loading.style.display = 'block'
      const captchaBlock = document.createElement('div')
      captchaBlock.id = 'zsCaptcha'
      captchaBlock.style.display = 'none'
      const xJdfEaS = document.createElement('input')
      xJdfEaS.setAttribute('name', 'xJdfEaS')
      document.body.append(img, loading, captchaBlock, xJdfEaS)

      service.loadCaptcha()
      xhrMock.onreadystatechange()

      expect((img as HTMLImageElement).src).toContain('captcha.png')
      expect(captchaBlock.style.display).toBe('block')
      expect(loading.style.display).toBe('none')
    })

    it('should not update captcha when readyState is not 4', () => {
      xhrMock.readyState = 2

      service.loadCaptcha()
      xhrMock.onreadystatechange()

      // no DOM update, just no throw
      expect(xhrMock.open).toHaveBeenCalled()
    })

    it('should handle invalid JSON in response gracefully', () => {
      xhrMock.responseText = 'not-json'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

      service.loadCaptcha()
      xhrMock.onreadystatechange()

      const wasCalled = consoleSpy.mock.calls.length > 0
      consoleSpy.mockRestore()
      expect(wasCalled).toBe(true)
    })
  })

  describe('validateAndSubmitForm', () => {
    // Build a mock form object to bypass jsdom's named-access limitation (spaces in name)
    function buildMockForm(overrides: { [key: string]: string } = {}) {
      const defaults: { [key: string]: string } = {
        'Contact Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '9876543210',
        'Subject': 'APAR/CA issue - APAR',
        'Issues related to Training Plan and Comprehensive': 'issue text',
        'zsWebFormCaptchaWord': 'captchaValue',
      }
      const values = { ...defaults, ...overrides }

      const mockForm: any = { reset: jest.fn() }
      for (const [key, value] of Object.entries(values)) {
        const input = document.createElement('input')
        input.name = key
        input.value = value
        mockForm[key] = input
      }

      jest.spyOn(document.forms, 'namedItem').mockReturnValue(mockForm)

      // Add DOM elements the service accesses via getElementById / querySelector
      const centreRadio = document.createElement('input')
      centreRadio.type = 'radio'
      centreRadio.id = 'CASECF21_centre'
      centreRadio.checked = true
      document.body.appendChild(centreRadio)

      const ministryInput = document.createElement('input')
      ministryInput.id = 'ministry-input'
      ministryInput.value = 'Ministry of XYZ'
      document.body.appendChild(ministryInput)

      const submitBtn = document.createElement('button')
      submitBtn.id = 'zsSubmitButton_120349000138968626'
      document.body.appendChild(submitBtn)

      return mockForm
    }

    afterEach(() => {
      jest.restoreAllMocks()
      document.body.innerHTML = ''
    })

    it('should return false when form is not found', () => {
      const result = service.validateAndSubmitForm()
      expect(result).toBe(false)
    })

    it('should return false when Contact Name is empty', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const mockForm = buildMockForm()
      mockForm['Contact Name'].value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
    })

    it('should return false for invalid email', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const mockForm = buildMockForm()
      mockForm['Email'].value = 'invalid-email'

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(window.alert).toHaveBeenCalledWith('Enter a valid email address')
    })

    it('should return false for invalid phone', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const mockForm = buildMockForm()
      mockForm['Phone'].value = '12345'

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(window.alert).toHaveBeenCalledWith('Enter a valid 10 digit phone number')
    })

    it('should return false when neither Centre nor State is selected', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      buildMockForm()
      const centreRadio = document.getElementById('CASECF21_centre') as HTMLInputElement
      centreRadio.checked = false

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(window.alert).toHaveBeenCalledWith('Please select Centre or State')
    })

    it('should return false when ministry input is empty', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      buildMockForm()
      const ministryInput = document.getElementById('ministry-input') as HTMLInputElement
      ministryInput.value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
    })

    it('should return false when captcha is empty', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      const mockForm = buildMockForm()
      mockForm['zsWebFormCaptchaWord'].value = ''

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(window.alert).toHaveBeenCalledWith('Please enter the captcha code.')
    })

    it('should return true and disable submit button on valid form', () => {
      buildMockForm()
      const submitBtn = document.getElementById('zsSubmitButton_120349000138968626') as HTMLButtonElement

      const result = service.validateAndSubmitForm()

      expect(result).toBe(true)
      expect(submitBtn.disabled).toBe(true)
    })

    it('should return false when AIS is checked but AIS fields are empty', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      buildMockForm()

      const aisToggle = document.createElement('input')
      aisToggle.type = 'checkbox'
      aisToggle.id = 'ais-toggle'
      aisToggle.checked = true
      document.body.appendChild(aisToggle)

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
    })

    it('should return false when sparrow email is invalid', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      buildMockForm()

      const sparrowInput = document.createElement('input')
      sparrowInput.setAttribute('name', 'Enter Sparrow Email ID')
      sparrowInput.value = 'bad-email'
      document.body.appendChild(sparrowInput)

      const result = service.validateAndSubmitForm()

      expect(result).toBe(false)
      expect(window.alert).toHaveBeenCalledWith('Enter a valid Sparrow email ID')
    })

    it('should return true when sparrow email is valid', () => {
      buildMockForm()

      const sparrowInput = document.createElement('input')
      sparrowInput.setAttribute('name', 'Enter Sparrow Email ID')
      sparrowInput.value = 'sparrow@ias.gov.in'
      document.body.appendChild(sparrowInput)

      const result = service.validateAndSubmitForm()

      expect(result).toBe(true)
    })
  })

  describe('resetForm private helpers (via resetForm)', () => {
    it('should reset ais-block visibility and ais-toggle via resetForm', () => {
      const aisBlock = document.createElement('div')
      aisBlock.id = 'ais-block'
      aisBlock.classList.add('visible')
      const aisToggle = document.createElement('input')
      aisToggle.type = 'checkbox'
      aisToggle.id = 'ais-toggle'
      aisToggle.checked = true
      const aisLabelText = document.createElement('span')
      aisLabelText.id = 'ais-label-text'
      const hiddenCASECF29 = document.createElement('select')
      hiddenCASECF29.id = 'CASECF29'
      document.body.append(aisBlock, aisToggle, aisLabelText, hiddenCASECF29)

      service.resetForm('anyId')

      expect(aisBlock.classList.contains('visible')).toBe(false)
      expect(aisToggle.checked).toBe(false)
    })

    it('should reset ministry block and others block via resetForm', () => {
      const ministryBlock = document.createElement('div')
      ministryBlock.id = 'ministry-block'
      ministryBlock.classList.add('visible')
      const btnCentre = document.createElement('button')
      btnCentre.id = 'btn-centre'
      btnCentre.classList.add('active')
      const btnState = document.createElement('button')
      btnState.id = 'btn-state'
      btnState.classList.add('active')
      const othersBlock = document.createElement('div')
      othersBlock.id = 'others-block'
      othersBlock.classList.add('visible')
      document.body.append(ministryBlock, btnCentre, btnState, othersBlock)

      service.resetForm('anyId')

      expect(ministryBlock.classList.contains('visible')).toBe(false)
      expect(btnCentre.classList.contains('active')).toBe(false)
      expect(othersBlock.classList.contains('visible')).toBe(false)
    })

    it('should reset subject field and consent checkbox via resetForm', () => {
      const subjectInput = document.createElement('input')
      subjectInput.id = 'subject-input'
      subjectInput.value = 'old value'
      const consentCheckbox = document.createElement('input')
      consentCheckbox.type = 'checkbox'
      consentCheckbox.id = 'consent-checkbox'
      consentCheckbox.checked = false
      document.body.append(subjectInput, consentCheckbox)

      service.resetForm('anyId')

      expect(subjectInput.value).toBe('APAR/CA issue - ')
      expect(consentCheckbox.checked).toBe(true)
    })
  })
})
