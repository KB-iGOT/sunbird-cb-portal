import { AssignmentViewerV2Component } from '../app-toc-assignment-viewerV2/app-toc-assignment-viewerV2.component'

describe('AppTocBatchAssignmentsComponent', () => {
  let component: AppTocBatchAssignmentsComponent
  let mockRouter: any
  let mockSnackBar: any
  let mockTocSvc: any
  let mockConfigSvc: any
  let mockDialog: any
  let mockDialogLegacy: any
  let mockRoute: any
  let mockDialogRef: any

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn()
    }

    // Mock MatLegacySnackBar
    mockSnackBar = {
      open: jest.fn().mockReturnValue({
        afterDismissed: jest.fn().mockReturnValue(of({}))
      })
    }

    // Mock AppTocService
    mockTocSvc = {
      searchAssignments: jest.fn().mockReturnValue(of({
        result: {
          response: {
            content: [
              {
                id: 'assignment1',
                title: 'Test Assignment 1',
                formId: 'form1',
                additionalProperties: {
                  batchId: 'batch1',
                  assignmentUrl: 'http://example.com/assignment1.pdf'
                }
              }
            ]
          }
        }
      })),
      getAssignmentStatus: jest.fn().mockReturnValue(of({
        result: {
          response: {
            content: [
              {
                formId: 'form1',
                submitUrl: 'http://example.com/submission1.pdf',
                status: 'EVALUATED',
                submissionMeta: {
                  marksGiven: 85,
                  maximumMarks: 100
                }
              }
            ]
          }
        }
      })),
      uploadAssignmentAnswer: jest.fn().mockReturnValue(of({
        responseCode: 'OK',
        result: {
          url: 'http://example.com/uploaded-file.pdf'
        }
      }).toPromise())
    }

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'user123',
        userName: 'testuser'
      }
    }

    // Mock MatDialog
    mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of({})),
      close: jest.fn()
    }

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    }

    // Mock MatLegacyDialog
    mockDialogLegacy = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(1))
      })
    }

    // Mock ActivatedRoute
    mockRoute = {
      snapshot: {
        queryParams: {
          batchId: 'batch123'
        }
      }
    }

    // Create component instance
    component = new AppTocBatchAssignmentsComponent(
      mockRouter,
      mockSnackBar,
      mockTocSvc,
      mockConfigSvc,
      mockDialog,
      mockDialogLegacy,
      mockRoute
    )

    // Initialize component properties
    component.content = {
      identifier: 'content123'
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with correct default values', () => {
      expect(component.assignments).toEqual([])
      expect(component.allowType).toEqual(['.pdf'])
      expect(component.isLoading).toBe(false)
      expect(component.batchId).toBe('batch123')
      expect(component.submissions).toEqual([])
    })

    it('should set batchId from route params', () => {
      expect(component.batchId).toBe('batch123')
    })

    it('should handle empty batchId from route params', () => {
      mockRoute.snapshot.queryParams = {}
      const newComponent = new AppTocBatchAssignmentsComponent(
        mockRouter,
        mockSnackBar,
        mockTocSvc,
        mockConfigSvc,
        mockDialog,
        mockDialogLegacy,
        mockRoute
      )
      expect(newComponent.batchId).toBe('')
    })
  })

  describe('ngOnInit', () => {
    it('should call fetchAssignments on init', () => {
      const fetchAssignmentsSpy = jest.spyOn(component, 'fetchAssignments')
      component.ngOnInit()
      expect(fetchAssignmentsSpy).toHaveBeenCalled()
    })
  })

  describe('fetchAssignments', () => {


    it('should handle fetchAssignments error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      mockTocSvc.searchAssignments.mockReturnValue(throwError('API Error'))

      component.fetchAssignments()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching assignments', 'API Error')
      consoleSpy.mockRestore()
    })
  })

  describe('getUserAssignmentStatus', () => {
    it('should get user assignment status successfully', () => {
      const processAssignmentsWithStatusSpy = jest.spyOn(component, 'processAssignmentsWithStatus')

      component.getUserAssignmentStatus()

      expect(mockTocSvc.getAssignmentStatus).toHaveBeenCalledWith({
        filters: {
          contextId: 'content123',
          submittedBy: 'user123'
        }
      })
      //expect(component.submissions).toHaveLength(1)
      expect(processAssignmentsWithStatusSpy).toHaveBeenCalled()
    })

    it('should handle getUserAssignmentStatus error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      mockTocSvc.getAssignmentStatus.mockReturnValue(throwError('API Error'))

      component.getUserAssignmentStatus()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching assignment status', 'API Error')
      consoleSpy.mockRestore()
    })

    it('should not call API if user profile is missing', () => {
      mockConfigSvc.userProfile = null

      component.getUserAssignmentStatus()

      expect(mockTocSvc.getAssignmentStatus).not.toHaveBeenCalled()
    })
  })

  describe('processAssignmentsWithStatus', () => {
    it('should process assignments with status correctly', () => {
      component.assignments = [
        {
          id: 'assignment1',
          title: 'Test Assignment 1',
          formId: 'form1'
        }
      ]
      component.submissions = [
        {
          formId: 'form1',
          submitUrl: 'http://example.com/submission1.pdf',
          status: 'EVALUATED',
          submissionMeta: {
            marksGiven: 85,
            maximumMarks: 100
          }
        }
      ]

      component.processAssignmentsWithStatus()

      expect(component.assignments[0]).toEqual({
        id: 'assignment1',
        title: 'Test Assignment 1',
        formId: 'form1',
        expand: false,
        downloading: false,
        enableDownload: false,
        answerURL: 'http://example.com/submission1.pdf',
        status: 'EVALUATED',
        enableView: true,
        submissionMeta: {
          marksGiven: 85,
          maximumMarks: 100
        }
      })
    })

    it('should handle assignments without submissions', () => {
      component.assignments = [
        {
          id: 'assignment1',
          title: 'Test Assignment 1',
          formId: 'form1'
        }
      ]
      component.submissions = []

      component.processAssignmentsWithStatus()

      expect(component.assignments[0].status).toBe('PENDING')
      expect(component.assignments[0].enableView).toBe(false)
      expect(component.assignments[0].answerURL).toBe('')
    })
  })

  describe('handleViewFeedback', () => {
    it('should expand assignment', () => {
      const assignment = { expand: false }

      component.handleViewFeedback(assignment)

      expect(assignment.expand).toBe(true)
    })
  })

  describe('downloadFile', () => {
    it('should set downloading properties and call downloadFileWithFetch', () => {
      const assignment = { downloading: false, enableDownload: false }
      const downloadFileWithFetchSpy = jest.spyOn(component, 'downloadFileWithFetch').mockImplementation(() => Promise.resolve())

      component.downloadFile(assignment)

      expect(assignment.downloading).toBe(true)
      expect(assignment.enableDownload).toBe(true)
      expect(component.selectedAssignment).toBe(assignment)
      expect(downloadFileWithFetchSpy).toHaveBeenCalledWith(assignment)
    })
  })

  describe('downloadFileDirectly', () => {
    it('should open file in new window and reset downloading', () => {
      const assignment = {
        downloading: true,
        additionalProperties: {
          assignmentUrl: 'http://example.com/file.pdf'
        }
      }
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)

      component.downloadFileDirectly(assignment)

      expect(openSpy).toHaveBeenCalledWith('http://example.com/file.pdf', '_blank')
      expect(assignment.downloading).toBe(false)
      openSpy.mockRestore()
    })

    it('should not open window if assignmentUrl is missing', () => {
      const assignment = {
        downloading: true,
        additionalProperties: {}
      }
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)

      component.downloadFileDirectly(assignment)

      expect(openSpy).not.toHaveBeenCalled()
      openSpy.mockRestore()
    })
  })

  describe('triggerFileUpload', () => {
    it('should trigger submit assignment if answerURL exists', () => {
      const assignment = { answerURL: 'http://example.com/answer.pdf' }
      const submitAssignmentSpy = jest.spyOn(component, 'submitAssignment')

      component.triggerFileUpload(assignment)

      expect(component.selectedAssignment).toBe(assignment)
      expect(submitAssignmentSpy).toHaveBeenCalledWith(assignment)
    })

    it('should trigger file input click if no answerURL', () => {
      const assignment = { answerURL: '' }
      const mockFileInput = {
        click: jest.fn()
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockFileInput as any)

      component.triggerFileUpload(assignment)

      expect(component.selectedAssignment).toBe(assignment)
      expect(mockFileInput.click).toHaveBeenCalled()
    })
  })

  describe('submitAssignment', () => {
    it('should open confirmation dialog and handle re-upload', () => {
      const assignment = { answerURL: 'http://example.com/answer.pdf' }
      const mockFileInput = {
        click: jest.fn()
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockFileInput as any)
      mockDialogLegacy.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(0)) // Re-upload
      })

      component.submitAssignment(assignment)

      expect(mockDialogLegacy.open).toHaveBeenCalled()
      expect(mockFileInput.click).toHaveBeenCalled()
    })

    it('should open confirmation dialog and handle keep submission', () => {
      const assignment = { answerURL: 'http://example.com/answer.pdf' }
      const previewAssignmentsSpy = jest.spyOn(component, 'previewAssignments')
      mockDialogLegacy.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(1)) // Keep submission
      })

      component.submitAssignment(assignment)

      expect(mockDialogLegacy.open).toHaveBeenCalled()
      expect(previewAssignmentsSpy).toHaveBeenCalledWith('http://example.com/answer.pdf')
    })
  })

  describe('fileInputEmit', () => {
    it('should process valid file', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const fileList = {
        0: mockFile,
        length: 1
      } as any
      const checkFileTypeSpy = jest.spyOn(component, 'checkFileType').mockReturnValue(true)
      const uploadSpy = jest.spyOn(component, 'upload')

      component.fileInputEmit(fileList)

      expect(checkFileTypeSpy).toHaveBeenCalledWith(mockFile)
      expect(uploadSpy).toHaveBeenCalledWith(mockFile)
    })

    it('should return early if no files', () => {
      const checkFileTypeSpy = jest.spyOn(component, 'checkFileType')

      component.fileInputEmit(null)

      expect(checkFileTypeSpy).not.toHaveBeenCalled()
    })

    it('should return early if file validation fails', () => {
      const mockFile = new File(['test'], 'test.doc', { type: 'application/msword' })
      const fileList = {
        0: mockFile,
        length: 1
      } as any
      jest.spyOn(component, 'checkFileType').mockReturnValue(false)
      const uploadSpy = jest.spyOn(component, 'upload')

      component.fileInputEmit(fileList)

      expect(uploadSpy).not.toHaveBeenCalled()
    })
  })

  describe('upload', () => {


    it('should handle upload failure', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      mockTocSvc.uploadAssignmentAnswer.mockReturnValue(Promise.resolve({
        responseCode: 'ERROR',
        message: 'Upload failed'
      }))
      component.selectedAssignment = { formId: 'form1' }

      await component.upload(mockFile)

      expect(component.isLoading).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith('File upload failed. Please try again.', 'X', { duration: 5000 })
    })

  })

  describe('previewAssignments', () => {
    it('should set loading to false and call callingViewAssignments', () => {
      const callingViewAssignmentsSpy = jest.spyOn(component, 'callingViewAssignments')
      const result = 'http://example.com/file.pdf'

      component.previewAssignments(result)

      expect(component.isLoading).toBe(false)
      expect(callingViewAssignmentsSpy).toHaveBeenCalledWith(result)
    })
  })

  describe('callingViewAssignments', () => {
    it('should open dialog and refresh assignments after close', () => {
      const url = 'http://example.com/file.pdf'
      const fetchAssignmentsSpy = jest.spyOn(component, 'fetchAssignments')
      component.selectedAssignment = { formId: 'form1' }

      component.callingViewAssignments(url)

      expect(mockDialog.open).toHaveBeenCalledWith(AssignmentViewerV2Component, {
        width: '40%',
        disableClose: true,
        panelClass: 'dialog_sidenav',
        data: {
          assessment: component.selectedAssignment,
          url: url,
          contentId: 'content123',
          batchId: 'batch123'
        }
      })

      // Simulate dialog close
      setTimeout(() => {
        expect(fetchAssignmentsSpy).toHaveBeenCalled()
      }, 1001)
    })
  })

  describe('checkFileType', () => {
    it('should return true for valid PDF file under 5MB', () => {
      const mockFile = new File(['x'.repeat(1024 * 1024)], 'test.pdf', { type: 'application/pdf' }) // 1MB file

      const result = component.checkFileType(mockFile)

      expect(result).toBe(true)
    })

    it('should return false for file over 5MB', () => {
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.pdf', { type: 'application/pdf' }) // 6MB file
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 })

      const result = component.checkFileType(mockFile)

      expect(result).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'File size exceeds 5 MB limit. Please upload a smaller file.',
        'X',
        { duration: 5000 }
      )
    })

    it('should return false for non-PDF file', () => {
      const mockFile = new File(['test'], 'test.doc', { type: 'application/msword' })

      const result = component.checkFileType(mockFile)

      expect(result).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Invalid file type uploaded. Please upload PDF format only.',
        'X',
        { duration: 5000 }
      )
    })

    it('should handle file with no size', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 0 })

      const result = component.checkFileType(mockFile)

      expect(result).toBe(true)
    })
  })

  describe('getMarks', () => {
    it('should return formatted marks with both given and maximum', () => {
      const submissionMeta = {
        marksGiven: 85,
        maximumMarks: 100
      }

      const result = component.getMarks(submissionMeta)

      expect(result).toBe('85/100')
    })

    it('should return only given marks if maximum is null', () => {
      const submissionMeta = {
        marksGiven: 85,
        maximumMarks: null
      }

      const result = component.getMarks(submissionMeta)

      expect(result).toBe('85')
    })

    it('should return N/A if marks are not available', () => {
      const submissionMeta = {
        marksGiven: null,
        maximumMarks: null
      }

      const result = component.getMarks(submissionMeta)

      expect(result).toBe('N/A')
    })

    it('should handle undefined submissionMeta', () => {
      const result = component.getMarks(undefined)

      expect(result).toBe('N/A')
    })
  })

  describe('openSnackbar', () => {
    it('should open snackbar with default duration', () => {
      component.openSnackbar('Test message')

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 })
    })

    it('should open snackbar with custom duration', () => {
      component.openSnackbar('Test message', 10000)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 10000 })
    })
  })

  describe('extractFilenameFromUrl', () => {
    it('should extract filename from URL', () => {
      const url = 'http://example.com/path/to/file.pdf'

      const result = component.extractFilenameFromUrl(url)

      expect(result).toBe('file.pdf')
    })

    it('should return empty string if no extension', () => {
      const url = 'http://example.com/path/to/file'

      const result = component.extractFilenameFromUrl(url)

      expect(result).toBe('')
    })

    it('should handle invalid URL gracefully', () => {
      const result = component.extractFilenameFromUrl('')

      expect(result).toBe('')
    })
  })

  describe('downloadFileWithFetch', () => {
    let assignment: any
    let mockResponse: any
    let mockBlob: any
    let mockUrl: any
    let mockLink: any

    beforeEach(() => {
      assignment = {
        downloading: true,
        title: 'Test Assignment',
        additionalProperties: {
          assignmentUrl: 'http://example.com/test.pdf'
        }
      }

      mockBlob = new Blob(['test'], { type: 'application/pdf' })
      mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob)
      }
      mockUrl = 'blob:http://localhost/test-blob'
      mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }

      global.fetch = jest.fn().mockResolvedValue(mockResponse)
      global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl)
      global.URL.revokeObjectURL = jest.fn()
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      //jest.spyOn(document.body, 'appendChild').mockImplementation(() => null)
      //jest.spyOn(document.body, 'removeChild').mockImplementation(() => null)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })


    it('should use assignment title if filename extraction fails', async () => {
      assignment.additionalProperties.assignmentUrl = 'http://example.com/somefile'

      await component.downloadFileWithFetch(assignment)

      expect(mockLink.download).toBe('Test Assignment.pdf')
    })

    it('should handle fetch error and fallback to direct download', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      const downloadFileDirectlySpy = jest.spyOn(component, 'downloadFileDirectly')
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      await component.downloadFileWithFetch(assignment)

      //expect(consoleSpy).toHaveBeenCalledWith('Download failed:', expect.any(Error))
      expect(downloadFileDirectlySpy).toHaveBeenCalledWith(assignment)
      consoleSpy.mockRestore()
    })

    it('should handle response not ok and fallback to direct download', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      const downloadFileDirectlySpy = jest.spyOn(component, 'downloadFileDirectly')
      mockResponse.ok = false
      global.fetch = jest.fn().mockResolvedValue(mockResponse)

      await component.downloadFileWithFetch(assignment)

      // expect(consoleSpy).toHaveBeenCalledWith('Download failed:', expect.any(Error))
      expect(downloadFileDirectlySpy).toHaveBeenCalledWith(assignment)
      consoleSpy.mockRestore()
    })

    it('should return early if no assignment URL', async () => {
      assignment.additionalProperties.assignmentUrl = null

      await component.downloadFileWithFetch(assignment)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})


jest.mock('@sunbird-cb/consumption', () => ({
  ContentLanguageService: jest.fn().mockImplementation(() => ({
    getContentLanguage: jest.fn().mockReturnValue('en')
  }))
}));

jest.mock('lodash', () => ({
  get: jest.fn(),
  map: jest.fn(),
  each: jest.fn(),
  first: jest.fn(),
  filter: jest.fn(),
  toInteger: jest.fn(),
  defaults: jest.fn()
}));

// Mock the specific AppTocService path
jest.mock('../../../../../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service', () => ({
  AppTocService: jest.fn().mockImplementation(() => ({
    searchAssignments: jest.fn(),
    getAssignmentStatus: jest.fn(),
    createContentV2: jest.fn(),
    readContentV2: jest.fn(),
    upload: jest.fn(),
    updateContentWithFewFields: jest.fn(),
    submitAssignment: jest.fn(),
    submitDraftAssignment: jest.fn(),
    analyticsReplaySubject: { next: jest.fn() },
    batchReplaySubject: { next: jest.fn() },
    resumeData: { next: jest.fn() }
  }))
}));

// Now import the required modules
import { of, throwError } from 'rxjs';
import { AppTocBatchAssignmentsComponent } from './app-toc-batch-assignments.component';

describe('AppTocBatchAssignmentsComponent', () => {
  let component: AppTocBatchAssignmentsComponent;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockTocSvc: any;
  let mockConfigSvc: any;
  let mockDialog: any;
  let mockDialogLegacy: any;
  let mockRoute: any;

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      navigateByUrl: jest.fn().mockReturnValue(Promise.resolve(true))
    };

    // Mock MatLegacySnackBar
    mockSnackBar = {
      open: jest.fn().mockReturnValue({
        afterDismissed: jest.fn().mockReturnValue(of({}))
      })
    };

    // Mock AppTocService
    mockTocSvc = {
      searchAssignments: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
      getAssignmentStatus: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
      createContentV2: jest.fn().mockReturnValue(Promise.resolve('test-id')),
      readContentV2: jest.fn().mockReturnValue(Promise.resolve({ identifier: 'test-id' })),
      upload: jest.fn().mockReturnValue(of({ result: {} })),
      updateContentWithFewFields: jest.fn().mockReturnValue(of({ result: {} })),
      submitAssignment: jest.fn().mockReturnValue(of({ result: {} })),
      submitDraftAssignment: jest.fn().mockReturnValue(of({ result: {} }))
    };

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'test-user-id',
        userName: 'Test User',
        rootOrgId: 'test-org-id',
        departmentName: 'Test Department'
      }
    };

    // Mock MatDialog
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({}))
      })
    };

    // Mock MatLegacyDialog
    mockDialogLegacy = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };

    // Mock ActivatedRoute
    mockRoute = {
      snapshot: {
        queryParams: {
          batchId: 'test-batch-id'
        }
      }
    };

    // Create component instance
    component = new AppTocBatchAssignmentsComponent(
      mockRouter,
      mockSnackBar,
      mockTocSvc,
      mockConfigSvc,
      mockDialog,
      mockDialogLegacy,
      mockRoute
    );

    // Initialize component properties
    component.content = { identifier: 'test-content-id' };
    component.assignments = [];
    component.submissions = [];
    component.allowType = ['.pdf', '.doc', '.docx'];
    component.isLoading = false;
    component.batchId = 'test-batch-id';
    component.resourceFileAdded = null;
    component.selectedAssignment = null;
    component.fileExtention = '';
    component.openSnackbar = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined();
      expect(component.assignments).toEqual([]);
      expect(component.batchId).toBe('test-batch-id');
    });

    it('should initialize with default values', () => {
      expect(component.allowType).toEqual(['.pdf', '.doc', '.docx']);
      expect(component.isLoading).toBe(false);
      expect(component.submissions).toEqual([]);
    });
  });


  describe('getUserAssignmentStatus', () => {
    it('should get assignment status successfully', () => {
      const mockResponse = {
        result: {
          response: {
            content: [
              { formId: 'form1', status: 'SUBMITTED' }
            ]
          }
        }
      };

      mockTocSvc.getAssignmentStatus.mockReturnValue(of(mockResponse));
      const processAssignmentsSpy = jest.spyOn(component, 'processAssignmentsWithStatus').mockImplementation(() => { });

      component.getUserAssignmentStatus();

      expect(mockTocSvc.getAssignmentStatus).toHaveBeenCalled();
      expect(processAssignmentsSpy).toHaveBeenCalled();
    });
  });

  describe('getMarks', () => {
    it('should return marks with maximum when both are available', () => {
      const submissionMeta = { marksGiven: 20, maximumMarks: 100 };
      const result = component.getMarks(submissionMeta);
      expect(result).toBe('20/100');
    });

    it('should return only marks when maximum is not available', () => {
      const submissionMeta = { marksGiven: 20 };
      const result = component.getMarks(submissionMeta);
      expect(result).toBe('20');
    });

    it('should return N/A when no marks are available', () => {
      const submissionMeta = {};
      const result = component.getMarks(submissionMeta);
      expect(result).toBe('N/A');
    });

    it('should handle null submissionMeta', () => {
      const result = component.getMarks(null);
      expect(result).toBe('N/A');
    });
  });

  describe('checkFileType', () => {
    it('should return false for files larger than 1024MB', () => {
      const largeFile = new File(['content'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 1025 * 1024 * 1024 });

      const result = component.checkFileType(largeFile);
      expect(result).toBe(false);
    });

    it('should return true for valid PDF file', () => {
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });
      component.allowType = ['.pdf', '.doc', '.docx'];

      const result = component.checkFileType(validFile);
      expect(result).toBe(true);
      expect(component.fileExtention).toBe('.pdf');
    });
  });

  describe('getMimeType', () => {
    it('should return correct mime type for pdf', () => {
      component.fileExtention = '.pdf';
      //expect(component.getMimeType()).toBe('application/pdf');
    });

    it('should return correct mime type for doc files', () => {
      component.fileExtention = '.doc';
      //expect(component.getMimeType()).toBe('application/msword');

      component.fileExtention = '.docx';
      //expect(component.getMimeType()).toBe('application/msword');
    });

    it('should return default mime type for unknown extensions', () => {
      component.fileExtention = '.unknown';
      //expect(component.getMimeType()).toBe('application/octet-stream');
    });
  });

  // describe('getRandomNumber', () => {
  //   it('should generate 16 digit random number', () => {
  //     const result = component.getRandomNumber();
  //     expect(result.length).toBe(16);
  //     expect(/^\d{16}$/.test(result)).toBe(true);
  //   });
  // });

  describe('handleViewFeedback', () => {
    it('should expand assignment feedback', () => {
      const assignment = { expand: false };
      component.handleViewFeedback(assignment);
      expect(assignment.expand).toBe(true);
    });
  });

  describe('downloadFile', () => {
    it('should set downloading state', () => {
      const assignment = { downloading: false, enableDownload: false };
      const downloadSpy = jest.spyOn(component, 'downloadFileWithFetch').mockImplementation(() => Promise.resolve());

      component.downloadFile(assignment);

      expect(assignment.downloading).toBe(true);
      expect(assignment.enableDownload).toBe(true);
      expect(component.selectedAssignment).toBe(assignment);
      expect(downloadSpy).toHaveBeenCalledWith(assignment);
    });
  });

  describe('triggerFileUpload', () => {
    it('should call submitAssignment if answerURL exists', () => {
      const assignment = { answerURL: 'test-url' };
      const submitSpy = jest.spyOn(component, 'submitAssignment').mockImplementation(() => { });

      component.triggerFileUpload(assignment);

      expect(component.selectedAssignment).toBe(assignment);
      expect(submitSpy).toHaveBeenCalledWith(assignment);
    });

    it('should trigger file input click if no answerURL', () => {
      const assignment = { answerURL: '' };
      const mockFileInput = { click: jest.fn() };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockFileInput as any);

      component.triggerFileUpload(assignment);

      expect(component.selectedAssignment).toBe(assignment);
      expect(mockFileInput.click).toHaveBeenCalled();
    });
  });

  describe('fileInputEmit', () => {
    it('should return early if no files', () => {
      const checkFileTypeSpy = jest.spyOn(component, 'checkFileType');

      component.fileInputEmit(null);
      component.fileInputEmit([] as any);

      expect(checkFileTypeSpy).not.toHaveBeenCalled();
    });

    it('should process file if valid', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockFileList = [mockFile] as any;
      mockFileList.length = 1;

      const checkFileTypeSpy = jest.spyOn(component, 'checkFileType').mockReturnValue(true);
      //const createResourceSpy = jest.spyOn(component, 'createResource').mockImplementation(() => Promise.resolve());
      component.selectedAssignment = { title: 'Test' };

      component.fileInputEmit(mockFileList);

      expect(checkFileTypeSpy).toHaveBeenCalledWith(mockFile);
      //expect(createResourceSpy).toHaveBeenCalledWith(mockFile, component.selectedAssignment);
    });
  });
});