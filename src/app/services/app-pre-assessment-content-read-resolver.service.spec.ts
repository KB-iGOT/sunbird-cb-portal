import { AppPreAssessmentContentResolverService } from './app-pre-assessment-content-read-resolver.service'
import { of, throwError } from 'rxjs'

describe('AppPreAssessmentContentResolverService (Jest, no TestBed)', () => {
  let service: AppPreAssessmentContentResolverService
  let mockContentService: any

  beforeEach(() => {
    mockContentService = {
      fetchProgramContent: jest.fn()
    }

    service = new AppPreAssessmentContentResolverService(mockContentService as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return error when collectionId is missing', (done) => {
    const route: any = {
      queryParams: {
        collectionId: '',
        preAssessment: 'true'
      }
    }

    const state: any = {}

    service.resolve(route, state).subscribe((result: any) => {
      expect(result).toEqual({ error: 'Collection Id not found', data: null })
      done()
    })
  })

  it('should return error when preAssessment is missing', (done) => {
    const route: any = {
      queryParams: {
        collectionId: 'col123',
        preAssessment: ''
      }
    }

    const state: any = {}

    service.resolve(route, state).subscribe((result: any) => {
      expect(result).toEqual({ error: 'Collection Id not found', data: null })
      done()
    })
  })

  it('should fetch program content when collectionId and preAssessment are present', (done) => {
    const route: any = {
      queryParams: {
        collectionId: 'col123',
        preAssessment: 'true'
      }
    }
    const state: any = {}

    const mockResponse: any = { id: 'col123', name: 'Test Program' }
    mockContentService.fetchProgramContent.mockReturnValue(of(mockResponse))

    service.resolve(route, state).subscribe((result: any) => {
      expect(mockContentService.fetchProgramContent).toHaveBeenCalledWith('col123')
      expect(result).toEqual({ data: mockResponse, error: null })
      done()
    })
  })

  it('should handle error from fetchProgramContent', (done) => {
    const route: any = {
      queryParams: {
        collectionId: 'col123',
        preAssessment: 'true'
      }
    }
    const state: any = {}

    const mockError: any = new Error('Network error')
    mockContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

    service.resolve(route, state).subscribe((result: any) => {
      expect(mockContentService.fetchProgramContent).toHaveBeenCalledWith('col123')
      expect(result).toEqual({ error: mockError, data: null })
      done()
    })
  })
})
