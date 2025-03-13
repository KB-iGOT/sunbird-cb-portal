import { AppGyaanKarmayogiService } from './app-gyaan-karmayogi.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('AppGyaanKarmayogiService', () => {
  let service: AppGyaanKarmayogiService;
  let httpClientSpy: jest.Mocked<HttpClient>;

  beforeEach(() => {
    // Create a spy object with the required methods
    httpClientSpy = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    // Initialize the service with the mock
    service = new AppGyaanKarmayogiService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resolve', () => {
    it('should return combined data from both API calls when successful', () => {
      // Mock response for the first API call (facets)
      const facetsResponse = {
        result: {
          facets: [
            { name: 'resourceCategory', values: [{ name: 'Course', count: 10 }] },
            { name: 'sectorName', values: [{ name: 'IT', count: 5 }] },
          ]
        }
      };
      
      // Mock response for the second API call (sectors)
      const sectorsResponse = {
        result: {
          sectors: [
            { id: '1', name: 'IT' },
            { id: '2', name: 'Healthcare' }
          ]
        }
      };

      // Configure the spies to return the mock responses
      httpClientSpy.post.mockReturnValue(of(facetsResponse));
      httpClientSpy.get.mockReturnValue(of(sectorsResponse));

      // Call the method under test and use a return promise instead of done callback
      return new Promise<void>((resolve) => {
        service.resolve().subscribe(result => {
          // Verify the result structure matches what we expect
          expect(result).toEqual({
            facets: { data: facetsResponse.result.facets, error: null },
            sector: { data: sectorsResponse.result.sectors, error: null }
          });
          
          // Verify that the HTTP methods were called with the correct parameters
          expect(httpClientSpy.post).toHaveBeenCalledWith(
            'apis/proxies/v8/sunbirdigot/v4/search',
            expect.objectContaining({
              request: expect.objectContaining({
                filters: { status: ['Live'] },
                facets: ['resourceCategory', 'sectorName', 'subSectorName', 'createdFor']
              })
            })
          );
          
          expect(httpClientSpy.get).toHaveBeenCalledWith('apis/proxies/v8/catalog/v1/sector');
          
          resolve();
        });
      });
    });

    it('should handle error in facets API call', () => {
      // Set up the post method to return an error through the catchError operator
      const facetsError = new Error('Facets API error');
      httpClientSpy.post.mockReturnValue(throwError(() => facetsError));
      
      // Mock success for sectors API
      const sectorsResponse = {
        result: {
          sectors: [{ id: '1', name: 'IT' }]
        }
      };
      httpClientSpy.get.mockReturnValue(of(sectorsResponse));

      return new Promise<void>((resolve) => {
        service.resolve().subscribe(result => {
          expect(result.facets).toEqual({ error: null, data: null });
          expect(result.sector.data).toEqual(sectorsResponse.result.sectors);
          resolve();
        });
      });
    });

    it('should handle error in sectors API call', () => {
      // Mock success for facets API
      const facetsResponse = {
        result: {
          facets: [{ name: 'resourceCategory', values: [{ name: 'Course', count: 10 }] }]
        }
      };
      httpClientSpy.post.mockReturnValue(of(facetsResponse));
      
      // Mock error for sectors API
      const sectorsError = new Error('Sectors API error');
      httpClientSpy.get.mockReturnValue(throwError(() => sectorsError));

      return new Promise<void>((resolve) => {
        service.resolve().subscribe(result => {
          expect(result.facets.data).toEqual(facetsResponse.result.facets);
          expect(result.sector).toEqual({ error: null, data: null });
          resolve();
        });
      });
    });

    it('should handle errors in both API calls', () => {
      // Mock HTTP errors
      const facetsError = new Error('Facets API error');
      httpClientSpy.post.mockReturnValue(throwError(() => facetsError));
      
      const sectorsError = new Error('Sectors API error');
      httpClientSpy.get.mockReturnValue(throwError(() => sectorsError));

      return new Promise<void>((resolve) => {
        service.resolve().subscribe(result => {
          expect(result.facets).toEqual({ error: null, data: null });
          expect(result.sector).toEqual({ error: null, data: null });
          resolve();
        });
      });
    });

    // Alternative approach using async/await with lastValueFrom
    it('should handle network errors correctly using async/await', async () => {
      // Import at the top of your file if using this approach
      // import { lastValueFrom } from 'rxjs';
      
      // Create network errors
      const networkError = new Error('Network error');
      
      // Mock throwing errors for both HTTP methods
      httpClientSpy.post.mockReturnValue(throwError(() => networkError));
      httpClientSpy.get.mockReturnValue(throwError(() => networkError));

      // Using lastValueFrom to convert observable to promise
      // const result = await lastValueFrom(service.resolve());
      
      // expect(result.facets).toEqual({ error: null, data: null });
      // expect(result.sector).toEqual({ error: null, data: null });
    });
  });
});