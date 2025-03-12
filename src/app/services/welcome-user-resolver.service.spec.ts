import { TncPublicResolverService } from './tnc-public-resolver.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { IResolveResponse } from '@sunbird-cb/utils-v2';
import { NsTnc } from '../models/tnc.model';

describe('TncPublicResolverService', () => {
  let service: TncPublicResolverService;
  let httpClientMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
    } as any; // Mock the HttpClient

    service = new TncPublicResolverService(httpClientMock);
  });

  describe('resolve', () => {
    it('should return the correct data when getPublicTnc() is successful', async () => {
      const mockTncData: NsTnc.ITnc = {
          isAccepted: false,
          termsAndConditions: []
      }; // Mocked data
      const mockResponse: IResolveResponse<NsTnc.ITnc> = { data: mockTncData, error: null };

      // Mock the getPublicTnc method to return an observable with mock data
      httpClientMock.get.mockReturnValue(of(mockTncData));

      // Use async/await instead of done()
      const response = await service.resolve().toPromise();
      
      expect(response).toEqual(mockResponse);
    });

    it('should return error when getPublicTnc() fails', async () => {
      const mockError = new Error('An error occurred');
      const mockResponse: IResolveResponse<NsTnc.ITnc> = { data: null, error: mockError };

      // Mock the getPublicTnc method to throw an error
      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      // Use async/await instead of done()
      const response = await service.resolve().toPromise();
      
      expect(response).toEqual(mockResponse);
    });
  });

  describe('getPublicTnc', () => {
    it('should call the correct URL without locale', async () => {
      const mockTncData: NsTnc.ITnc = {
          isAccepted: false,
          termsAndConditions: []
      };
      httpClientMock.get.mockReturnValue(of(mockTncData));

      await service.getPublicTnc().toPromise();

      // Verify the URL the HttpClient is called with
      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/public/v8/tnc');
    });

    it('should call the correct URL with locale', async () => {
      const mockTncData: NsTnc.ITnc = {
          isAccepted: false,
          termsAndConditions: []
      };
      const locale = 'en';
      httpClientMock.get.mockReturnValue(of(mockTncData));

      await service.getPublicTnc(locale).toPromise();

      // Verify the URL the HttpClient is called with
      expect(httpClientMock.get).toHaveBeenCalledWith(`/apis/public/v8/tnc?locale=${locale}`);
    });
  });
});
