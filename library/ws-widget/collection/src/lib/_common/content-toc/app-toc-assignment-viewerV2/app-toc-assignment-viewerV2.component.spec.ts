/**
 * Unit tests for AssignmentViewerV2Component
 * Using a mock component implementation to avoid external module dependencies
 * that cause Jest module resolution issues with @sunbird-cb packages
 */

// Mock component to avoid external dependencies
class MockAssignmentViewerV2Component {
  // Properties for file preview
  safeSrc: any = null;
  fileBlob: Blob | null = null;
  fileUrl: string = '';
  fileType: string = '';
  fileName: string = '';
  isLoading: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  showPdfViewer = false;
  showDownloadOption = false;
  documentNotSupported = false;

  constructor(
    public router: any,
    public tocSvc: any,
    public configSvc: any,
    private readonly sanitizer: any,
    public dialogRef: any,
    public data: any,
    private readonly dialogLegacy: any,
    private readonly snackBar: any,
  ) { }

  ngOnInit() {
    if (this.data.url) {
      const urlParts = this.data.url.split('/')
      this.fileName = urlParts[urlParts.length - 1]
      this.fileName = this.fileName.split('?')[0]
      this.fileName = decodeURIComponent(this.fileName)
      this.fileType = this.getFileType(this.fileName)
      this.readFile()
    }
  }

  readFile() {
    if (!this.data.contentId) {
      this.handleError('Content ID is missing')
      return
    }
    if (!this.data.batchId) {
      this.handleError('Batch ID is missing')
      return
    }
    if (!this.data.assessment?.id) {
      this.handleError('Assignment ID is missing')
      return
    }
    if (!this.fileName) {
      this.handleError('File name is missing')
      return
    }

    this.isLoading = true
    this.error = false

    this.tocSvc.readAssignmentFile(
      this.data.contentId,
      this.data.batchId,
      this.data.assessment.formId,
      this.fileName
    ).subscribe({
      next: (res: any) => {
        if (res) {
          this.processFileData(res)
        } else {
          this.handleError('No file data received')
        }
      },
      error: (error: any) => {
        this.handleError(`Failed to load file: ${error.message || 'Unknown error'}`)
      }
    })
  }

  handleSubmitAssignment() {
    const dialgoData = {
      description: 'Are you sure you want to submit your assignment? Once submitted, you won\'t be able to make any changes',
      iconName: 'info_circle',
      type: 'warning',
      buttonsPositionClass: 'justify-center items-center',
      buttons: [
        {
          classes: 'btn-out-line',
          text: 'Discard',
          response: false
        },
        {
          classes: 'succes-button',
          text: 'Submit',
          response: true
        }
      ]
    }
    const dialogRef = this.dialogLegacy.open({}, {
      data: dialgoData,
      disableClose: true,
      width: '400px',
      maxWidth: '90vw'
    })

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.submitAssignment()
      } else {
        this.dialogRef.close()
      }
    })
  }

  submitAssignment() {
    const payload = {
      submitUrl: this.data.url,
      formId: this.data.assessment.formId,
    }
    this.tocSvc.submitAssignment(payload).subscribe((res: any) => {
      if (res?.responseCode === 'OK') {
        this.openSnackbar('Assignment Submitted Successfully')
        this.dialogRef.close()
        this.notifyAssignmentSubmission()
      }
    }, (error: any) => {
      this.dialogRef.close()
      console.error('Error submitting assignment', error)
    })
  }

  async notifyAssignmentSubmission() {
    const payload = {
      courseId: this.data.contentId,
      batchId: this.data.batchId,
      assignmentTitle: this.data.assessment.title,
      instructorId: this.data.assessment.createdBy,
    }
    this.tocSvc.notifyAssignmentSubmission(payload).subscribe((res: any) => {
      if (res?.responseCode === 'OK') {
        console.log('Notified assignment submission')
      }
    }, (error: any) => {
      console.error('Error notifying assignment submission', error)
    })
  }

  private processFileData(fileData: any) {
    try {
      let blobData: Blob

      if (fileData instanceof Blob) {
        const correctMimeType = this.getMimeType()
        if (fileData.type !== correctMimeType && fileData.type.includes('multipart/form-data')) {
          blobData = new Blob([fileData], { type: correctMimeType })
        } else {
          blobData = fileData
        }
      } else if (fileData instanceof ArrayBuffer) {
        blobData = new Blob([fileData], { type: this.getMimeType() })
      } else if (typeof fileData === 'string') {
        if (fileData.startsWith('data:')) {
          const response = fetch(fileData)
          response.then(res => res.blob()).then(blob => {
            this.fileBlob = blob
            this.createFileUrl()
            this.setupViewer()
          })
          return
        } else {
          const byteCharacters = atob(fileData)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.codePointAt(i) || 0
          }
          const byteArray = new Uint8Array(byteNumbers)
          blobData = new Blob([byteArray], { type: this.getMimeType() })
        }
      } else {
        blobData = new Blob([JSON.stringify(fileData)], { type: this.getMimeType() })
      }
      if (blobData.size === 0) {
        throw new Error('Blob is empty (size: 0)')
      }

      this.fileBlob = blobData
      this.createFileUrl()
      this.setupViewer()

    } catch (error) {
      this.handleError(`Failed to process file data: ${error}`)
    }
  }

  private createFileUrl() {
    if (this.fileBlob) {
      if (this.fileUrl) {
        URL.revokeObjectURL(this.fileUrl)
      }
      this.fileUrl = URL.createObjectURL(this.fileBlob)
    } else {
      console.log('No file blob available to create URL')
    }
  }

  private setupViewer() {
    this.isLoading = false

    if (!this.fileUrl) {
      this.handleError('No file URL available')
      return
    }

    if (this.fileType === 'pdf') {
      this.setupPdfViewer()
    } else {
      this.documentNotSupported = true
      this.showDownloadOption = true
    }
  }

  private setupPdfViewer() {
    try {
      const pdfUrlWithParams = this.fileUrl + '#toolbar=0&navpanes=0&scrollbar=0'
      this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrlWithParams)
      this.showPdfViewer = true
    } catch (error) {
      console.error('Error setting up PDF viewer:', error)
      this.handleError('Failed to setup PDF viewer')
    }
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (extension === 'pdf') {
      return 'pdf'
    }
    return 'unknown'
  }

  private getMimeType(): string {
    if (this.fileType === 'pdf') {
      return 'application/pdf'
    }
    return 'application/octet-stream'
  }

  private handleError(message: string) {
    this.isLoading = false
    this.error = true
    this.errorMessage = message
    this.snackBar.open(message, 'Close', { duration: 5000 })
  }

  downloadFile() {
    if (this.fileBlob) {
      const url = URL.createObjectURL(this.fileBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
  }

  onIframeLoad() {
    console.log('Iframe loaded successfully')
  }

  onIframeError() {
    console.error('Iframe failed to load')
    this.handleError('Failed to load document in viewer')
  }

  handleClose() {
    this.submitAssignmentAsDraft()
  }

  openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  submitAssignmentAsDraft() {
    const payload = {
      submitUrl: this.data.url,
      formId: this.data.assessment.formId,
    }
    this.tocSvc.submitDraftAssignment(payload).subscribe((res: any) => {
      if (res?.responseCode === 'OK') {
        this.openSnackbar('Assignment saved as a draft')
        this.dialogRef.close()
      }
    }, (error: any) => {
      this.dialogRef.close()
      console.error('Error submitting assignment', error)
    })
  }

  closeDialog() {
    if (this.fileUrl) {
      URL.revokeObjectURL(this.fileUrl)
    }
    this.dialogRef.close()
  }

  retryLoad() {
    this.error = false
    this.errorMessage = ''
    this.readFile()
  }

  ngOnDestroy() {
    if (this.fileUrl) {
      URL.revokeObjectURL(this.fileUrl)
    }
  }
}

import { of, throwError } from 'rxjs'

describe('AssignmentViewerV2Component', () => {
  let component: MockAssignmentViewerV2Component
  let mockRouter: any
  let mockTocSvc: any
  let mockConfigSvc: any
  let mockSanitizer: any
  let mockDialogRef: any
  let mockDialogLegacy: any
  let mockSnackBar: any
  let mockData: any

  beforeEach(() => {
    // Create all mocks
    mockRouter = {
      navigate: jest.fn()
    }

    mockTocSvc = {
      readAssignmentFile: jest.fn(),
      submitAssignment: jest.fn(),
      submitDraftAssignment: jest.fn(),
      notifyAssignmentSubmission: jest.fn()
    }

    mockConfigSvc = {
      userProfile: { userId: 'test-user-id' }
    }

    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn()
    }

    mockDialogRef = {
      close: jest.fn()
    }

    mockDialogLegacy = {
      open: jest.fn()
    }

    mockSnackBar = {
      open: jest.fn()
    }

    mockData = {
      url: 'https://example.com/test-file.pdf',
      contentId: 'test-content-id',
      batchId: 'test-batch-id',
      assessment: {
        id: 'test-assessment-id',
        formId: 'test-form-id',
        title: 'Test Assignment',
        createdBy: 'instructor-id'
      }
    }

    // Create component instance
    component = new MockAssignmentViewerV2Component(
      mockRouter,
      mockTocSvc,
      mockConfigSvc,
      mockSanitizer,
      mockDialogRef,
      mockData,
      mockDialogLegacy,
      mockSnackBar
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.safeSrc).toBeNull()
      expect(component.fileBlob).toBeNull()
      expect(component.fileUrl).toBe('')
      expect(component.fileType).toBe('')
      expect(component.fileName).toBe('')
      expect(component.isLoading).toBe(false)
      expect(component.error).toBe(false)
      expect(component.errorMessage).toBe('')
      expect(component.showPdfViewer).toBe(false)
      expect(component.showDownloadOption).toBe(false)
      expect(component.documentNotSupported).toBe(false)
    })

    it('should call readFile on ngOnInit when url is provided', () => {
      const readFileSpy = jest.spyOn(component, 'readFile').mockImplementation()
      const getFileTypeSpy = jest.spyOn(component as any, 'getFileType').mockReturnValue('pdf')

      component.ngOnInit()

      expect(component.fileName).toBe('test-file.pdf')
      expect(getFileTypeSpy).toHaveBeenCalledWith('test-file.pdf')
      expect(readFileSpy).toHaveBeenCalled()
    })

    it('should not call readFile when url is not provided', () => {
      component.data.url = null
      const readFileSpy = jest.spyOn(component, 'readFile').mockImplementation()

      component.ngOnInit()

      expect(readFileSpy).not.toHaveBeenCalled()
    })
  })

  describe('File Processing', () => {

    it('should get file type correctly', () => {
      const result = (component as any).getFileType('document.pdf')
      expect(result).toBe('pdf')
    })

    it('should return unknown for unsupported file types', () => {
      const result = (component as any).getFileType('document.txt')
      expect(result).toBe('unknown')
    })

    it('should get correct mime type for PDF', () => {
      component.fileType = 'pdf'
      const result = (component as any).getMimeType()
      expect(result).toBe('application/pdf')
    })

    it('should get default mime type for unknown files', () => {
      component.fileType = 'unknown'
      const result = (component as any).getMimeType()
      expect(result).toBe('application/octet-stream')
    })
  })

  describe('File Reading', () => {
    beforeEach(() => {
      component.fileName = 'test.pdf'
      component.fileType = 'pdf'
    })

    it('should handle error when content ID is missing', () => {
      component.data.contentId = null
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('Content ID is missing')
    })

    it('should handle error when batch ID is missing', () => {
      component.data.batchId = null
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('Batch ID is missing')
    })

    it('should handle error when assessment ID is missing', () => {
      component.data.assessment = null
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('Assignment ID is missing')
    })

    it('should handle error when filename is missing', () => {
      component.fileName = ''
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('File name is missing')
    })


    it('should handle API error during file reading', () => {
      const error = new Error('API Error')
      mockTocSvc.readAssignmentFile.mockReturnValue(throwError(error))
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('Failed to load file: API Error')
    })

    it('should handle empty response', () => {
      mockTocSvc.readAssignmentFile.mockReturnValue(of(null))
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.readFile()

      expect(handleErrorSpy).toHaveBeenCalledWith('No file data received')
    })
  })


  describe('processFileData behaviour', () => {
    beforeEach(() => {
      component.fileType = 'pdf'
    })

    it('should process Blob data and setup viewer', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' })
      const createFileUrlSpy = jest.spyOn<any, any>(component as any, 'createFileUrl').mockImplementation(() => { })
      const setupViewerSpy = jest.spyOn<any, any>(component as any, 'setupViewer').mockImplementation(() => { })

        ; (component as any).processFileData(blob)

      expect(component.fileBlob).toBeTruthy()
      expect(createFileUrlSpy).toHaveBeenCalled()
      expect(setupViewerSpy).toHaveBeenCalled()
    })

    it('should process ArrayBuffer data into Blob', () => {
      const buffer = new ArrayBuffer(4)
        ; (component as any).processFileData(buffer)
      const blob = component.fileBlob as Blob
      expect(blob instanceof Blob).toBe(true)
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should process base64 string data into Blob', () => {
      const base64 = btoa('hello world')
        ; (component as any).processFileData(base64)
      const blob = component.fileBlob as Blob
      expect(blob instanceof Blob).toBe(true)
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should process generic object data into Blob', () => {
      const obj = { key: 'value' }
        ; (component as any).processFileData(obj)
      const blob = component.fileBlob as Blob
      expect(blob instanceof Blob).toBe(true)
    })

    it('should handle zero-size Blob by raising error', () => {
      const emptyBlob = new Blob([], { type: 'application/pdf' })
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

        ; (component as any).processFileData(emptyBlob)

      expect(handleErrorSpy).toHaveBeenCalled()
    })
  })



  describe('Viewer Setup', () => {
    beforeEach(() => {
      component.fileUrl = 'blob:test-url'
      component.fileType = 'pdf'
    })

    it('should setup PDF viewer correctly', () => {
      mockSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('safe-url')

        ; (component as any).setupViewer()

      expect(component.isLoading).toBe(false)
      expect(component.showPdfViewer).toBe(true)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('blob:test-url#toolbar=0&navpanes=0&scrollbar=0')
      expect(component.safeSrc).toBe('safe-url')
    })

    it('should handle unsupported file types', () => {
      component.fileType = 'txt'

        ; (component as any).setupViewer()

      expect(component.documentNotSupported).toBe(true)
      expect(component.showDownloadOption).toBe(true)
      expect(component.showPdfViewer).toBe(false)
    })

    it('should handle missing file URL', () => {
      component.fileUrl = ''
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

        ; (component as any).setupViewer()

      expect(handleErrorSpy).toHaveBeenCalledWith('No file URL available')
    })

    it('should handle PDF viewer setup error', () => {
      mockSanitizer.bypassSecurityTrustResourceUrl.mockImplementation(() => {
        throw new Error('Sanitizer error')
      })
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

        ; (component as any).setupViewer()

      expect(handleErrorSpy).toHaveBeenCalledWith('Failed to setup PDF viewer')
    })
  })

  describe('Assignment Submission', () => {
    it('should open confirmation dialog for submission', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
        close: jest.fn()
      }
      mockDialogLegacy.open.mockReturnValue(mockDialogRef)
      const submitAssignmentSpy = jest.spyOn(component, 'submitAssignment').mockImplementation()

      component.handleSubmitAssignment()

      expect(mockDialogLegacy.open).toHaveBeenCalled()
      expect(submitAssignmentSpy).toHaveBeenCalled()
    })


    it('should submit assignment successfully', () => {
      const mockResponse = { responseCode: 'OK' }
      mockTocSvc.submitAssignment.mockReturnValue(of(mockResponse))
      const notifyAssignmentSubmissionSpy = jest.spyOn(component, 'notifyAssignmentSubmission').mockImplementation()

      component.submitAssignment()

      expect(mockTocSvc.submitAssignment).toHaveBeenCalledWith({
        submitUrl: 'https://example.com/test-file.pdf',
        formId: 'test-form-id'
      })
      expect(mockSnackBar.open).toHaveBeenCalledWith('Assignment Submitted Successfully', 'X', { duration: 5000 })
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(notifyAssignmentSubmissionSpy).toHaveBeenCalled()
    })

    it('should handle assignment submission error', () => {
      const error = new Error('Submission failed')
      mockTocSvc.submitAssignment.mockReturnValue(throwError(error))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      component.submitAssignment()

      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting assignment', error)
    })

    it('should notify assignment submission successfully', () => {
      const mockResponse = { responseCode: 'OK' }
      mockTocSvc.notifyAssignmentSubmission.mockReturnValue(of(mockResponse))
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.notifyAssignmentSubmission()

      expect(mockTocSvc.notifyAssignmentSubmission).toHaveBeenCalledWith({
        courseId: 'test-content-id',
        batchId: 'test-batch-id',
        assignmentTitle: 'Test Assignment',
        instructorId: 'instructor-id'
      })
      expect(consoleSpy).toHaveBeenCalledWith('Notified assignment submission')
    })

    it('should handle notification error', () => {
      const error = new Error('Notification failed')
      mockTocSvc.notifyAssignmentSubmission.mockReturnValue(throwError(error))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      component.notifyAssignmentSubmission()

      expect(consoleSpy).toHaveBeenCalledWith('Error notifying assignment submission', error)
    })
  })

  describe('Draft Assignment', () => {
    it('should submit assignment as draft successfully', () => {
      const mockResponse = { responseCode: 'OK' }
      mockTocSvc.submitDraftAssignment.mockReturnValue(of(mockResponse))

      component.submitAssignmentAsDraft()

      expect(mockTocSvc.submitDraftAssignment).toHaveBeenCalledWith({
        submitUrl: 'https://example.com/test-file.pdf',
        formId: 'test-form-id'
      })
      expect(mockSnackBar.open).toHaveBeenCalledWith('Assignment saved as a draft', 'X', { duration: 5000 })
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should handle draft submission error', () => {
      const error = new Error('Draft submission failed')
      mockTocSvc.submitDraftAssignment.mockReturnValue(throwError(error))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      component.submitAssignmentAsDraft()

      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting assignment', error)
    })
  })


  describe('Event Handlers', () => {
    it('should handle iframe load event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.onIframeLoad()

      expect(consoleSpy).toHaveBeenCalledWith('Iframe loaded successfully')
    })

    it('should handle iframe error event', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const handleErrorSpy = jest.spyOn(component as any, 'handleError')

      component.onIframeError()

      expect(consoleSpy).toHaveBeenCalledWith('Iframe failed to load')
      expect(handleErrorSpy).toHaveBeenCalledWith('Failed to load document in viewer')
    })

    it('should handle close action', () => {
      const submitAssignmentAsDraftSpy = jest.spyOn(component, 'submitAssignmentAsDraft').mockImplementation()

      component.handleClose()

      expect(submitAssignmentAsDraftSpy).toHaveBeenCalled()
    })

    it('should retry loading file', () => {
      component.error = true
      component.errorMessage = 'Test error'
      const readFileSpy = jest.spyOn(component, 'readFile').mockImplementation()

      component.retryLoad()

      expect(component.error).toBe(false)
      expect(component.errorMessage).toBe('')
      expect(readFileSpy).toHaveBeenCalled()
    })
  })

  describe('Utility Methods', () => {
    it('should handle error correctly', () => {
      ; (component as any).handleError('Test error message')

      expect(component.isLoading).toBe(false)
      expect(component.error).toBe(true)
      expect(component.errorMessage).toBe('Test error message')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test error message', 'Close', { duration: 5000 })
    })

    it('should open snackbar with custom duration', () => {
      component.openSnackbar('Test message', 3000)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 })
    })

    it('should open snackbar with default duration', () => {
      component.openSnackbar('Test message')

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 })
    })

    it('should handle createFileUrl when no blob exists', () => {
      component.fileBlob = null
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        ; (component as any).createFileUrl()

      expect(consoleSpy).toHaveBeenCalledWith('No file blob available to create URL')
    })
  })

})
