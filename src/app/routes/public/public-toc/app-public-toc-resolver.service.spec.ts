jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
}), { virtual: true })

import { AppPublicTocResolverService } from './app-public-toc-resolver.service'
import { of, throwError } from 'rxjs'

describe('AppPublicTocResolverService', () => {
  let service: AppPublicTocResolverService
  let mockContentSvc: any

  const mockState: any = {}

  beforeEach(() => {
    mockContentSvc = {
      fetchContent: jest.fn(),
    }
    service = new AppPublicTocResolverService(mockContentSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve', () => {
    it('should return { error: NO_ID, data: null } when no id in route', done => {
      const route: any = { paramMap: { get: jest.fn().mockReturnValue(null) } }

      service.resolve(route, mockState).subscribe(result => {
        expect(result).toEqual({ error: 'NO_ID', data: null })
        done()
      })
    })

    it('should call fetchContent with content id and return mapped data', done => {
      const contentId = 'do_123'
      const route: any = { paramMap: { get: jest.fn().mockReturnValue(contentId) } }
      const contentData = { identifier: contentId, name: 'Test Content' }
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: contentData } })
      )

      service.resolve(route, mockState).subscribe(result => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          contentId,
          'detail',
          expect.any(Array),
          ''
        )
        expect(result.data).toEqual(contentData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should return { error, data: null } on fetch failure', done => {
      const route: any = { paramMap: { get: jest.fn().mockReturnValue('do_fail') } }
      const error = new Error('Content not found')
      mockContentSvc.fetchContent.mockReturnValue(throwError(error))

      service.resolve(route, mockState).subscribe(result => {
        expect(result.error).toEqual(error)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should pass all additional fields to fetchContent', done => {
      const route: any = { paramMap: { get: jest.fn().mockReturnValue('do_456') } }
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: { identifier: 'do_456' } } })
      )

      service.resolve(route, mockState).subscribe(() => {
        const callArgs = mockContentSvc.fetchContent.mock.calls[0]
        const additionalFields = callArgs[2]
        expect(additionalFields).toContain('averageRating')
        expect(additionalFields).toContain('keywords')
        expect(additionalFields).toContain('hasAssessment')
        done()
      })
    })

    it('should pass empty string as 4th argument to fetchContent', done => {
      const route: any = { paramMap: { get: jest.fn().mockReturnValue('do_789') } }
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: {} } })
      )

      service.resolve(route, mockState).subscribe(() => {
        const callArgs = mockContentSvc.fetchContent.mock.calls[0]
        expect(callArgs[3]).toBe('')
        done()
      })
    })
  })
})
