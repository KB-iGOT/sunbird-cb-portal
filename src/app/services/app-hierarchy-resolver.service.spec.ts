jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}), { virtual: true })

import { AppHierarchyResolverService } from './app-hierarchy-resolver.service'
import { of, throwError } from 'rxjs'

describe('AppHierarchyResolverService', () => {
  let service: AppHierarchyResolverService
  let mockContentSvc: any

  const mockState: any = {}

  beforeEach(() => {
    mockContentSvc = {
      fetchContent: jest.fn(),
    }
    service = new AppHierarchyResolverService(mockContentSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve', () => {
    it('should return { error: No Collectionid, data: null } when no collectionId', done => {
      const route: any = { queryParams: {} }

      service.resolve(route, mockState).subscribe(result => {
        expect(result).toEqual({ error: 'No Collectionid', data: null })
        done()
      })
    })

    it('should return { error: No Collectionid, data: null } when queryParams is null', done => {
      const route: any = { queryParams: null }

      service.resolve(route, mockState).subscribe(result => {
        expect(result).toEqual({ error: 'No Collectionid', data: null })
        done()
      })
    })

    it('should use collectionId from queryParams and call fetchContent', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_123', _collectionType: 'Course' },
      }
      const rawData = { result: { content: { identifier: 'coll_123' } } }
      mockContentSvc.fetchContent.mockReturnValue(of(rawData))

      service.resolve(route, mockState).subscribe(result => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          'coll_123',
          'detail',
          [],
          'Course',
        )
        expect(result.data).toEqual(rawData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should use MLId as collectionId when MLId differs from collectionId', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_123', _collectionType: '', MLId: 'ml_456' },
      }
      const rawData = { result: { content: { identifier: 'ml_456' } } }
      mockContentSvc.fetchContent.mockReturnValue(of(rawData))

      service.resolve(route, mockState).subscribe(result => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          'ml_456',
          'detail',
          [],
          '',
        )
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should NOT use MLId when MLId equals collectionId', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_123', _collectionType: '', MLId: 'coll_123' },
      }
      mockContentSvc.fetchContent.mockReturnValue(of({ result: {} }))

      service.resolve(route, mockState).subscribe(() => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          'coll_123',
          'detail',
          [],
          '',
        )
        done()
      })
    })

    it('should return { error, data: null } on fetchContent failure', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_error', _collectionType: '' },
      }
      const error = new Error('Server error')
      mockContentSvc.fetchContent.mockReturnValue(throwError(error))

      service.resolve(route, mockState).subscribe(result => {
        expect(result.error).toEqual(error)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should use empty string for collectionType when _collectionType is absent', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_789' },
      }
      mockContentSvc.fetchContent.mockReturnValue(of({}))

      service.resolve(route, mockState).subscribe(() => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          'coll_789',
          'detail',
          [],
          '',
        )
        done()
      })
    })

    it('should pass empty array as additional fields to fetchContent', done => {
      const route: any = {
        queryParams: { collectionId: 'coll_001', _collectionType: 'Program' },
      }
      mockContentSvc.fetchContent.mockReturnValue(of({}))

      service.resolve(route, mockState).subscribe(() => {
        const callArgs = mockContentSvc.fetchContent.mock.calls[0]
        expect(callArgs[2]).toEqual([])
        done()
      })
    })
  })
})
