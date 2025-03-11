import {RecommendeLearningsResolverService} from './recommende-learnings-resolver.resolver'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('RecommendeLearningsResolverService', () => {
    let service: RecommendeLearningsResolverService
    let httpClientMock: HttpClient
    let routeSnapshotMock: ActivatedRouteSnapshot
    let routerStateMock: RouterStateSnapshot

    beforeEach(() => {
        // Create mock for HttpClient
        httpClientMock = {
            get: jest.fn()
        } as any

        service = new RecommendeLearningsResolverService(httpClientMock)

        // Mocking route and router state objects
        routeSnapshotMock = {} as ActivatedRouteSnapshot
        routerStateMock = {} as RouterStateSnapshot
    })

    it('should resolve with data when HTTP request is successful', (done) => {
        // Arrange: Mock the HttpClient's get method to return an observable with dummy data
        const mockData = { key: 'value' }
        httpClientMock.get = jest.fn().mockReturnValue(of(mockData))

        // Act: Call the resolver's resolve method
        service.resolve(routeSnapshotMock, routerStateMock).subscribe(result => {
            // Assert: Verify the result of the resolution
            expect(result).toEqual({ data: mockData, error: null })
            done()
        })
    })

    it('should resolve with error when HTTP request fails', (done) => {
        // Arrange: Mock the HttpClient's get method to return an observable that throws an error
        const mockError = new Error('Request failed')
        httpClientMock.get = jest.fn().mockReturnValue(throwError(() => mockError))

        // Act: Call the resolver's resolve method
        service.resolve(routeSnapshotMock, routerStateMock).subscribe(result => {
            // Assert: Verify that the result contains the error
            expect(result).toEqual({ data: null, error: mockError })
            done()
        })
    })
})
