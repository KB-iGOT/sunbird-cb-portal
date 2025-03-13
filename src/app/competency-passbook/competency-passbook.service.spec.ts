import { CompetencyPassbookService } from './competency-passbook.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('CompetencyPassbookService', () => {
  let service: CompetencyPassbookService;
  let httpClientMock: HttpClient;

  beforeEach(() => {
    // Mock the HttpClient using Jest's fn() for each method
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as HttpClient;

    // Create an instance of the service with the mocked HttpClient
    service = new CompetencyPassbookService(httpClientMock);
  });

  describe('getCompetencyList', () => {
    it('should call post method with correct parameters and return observable', () => {
      const payload = { key: 'value' };
      const response = { data: 'test' };

      // Mock the HTTP post method
      (httpClientMock.post as jest.Mock).mockReturnValue(of(response));

      // Call the method and check if it returns the correct observable
      service.getCompetencyList(payload).subscribe((result) => {
        expect(result).toEqual(response);
      });

      // Check if HttpClient.post was called with the correct URL and payload
      expect(httpClientMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/competency/v4/search',
        payload
      );
    });

    it('should handle error when HttpClient.post fails', () => {
      const payload = { key: 'value' };
      const errorResponse = new Error('Something went wrong');
      
      // Mock the HTTP post method to return an error
      (httpClientMock.post as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      // Call the method and check if it returns the error
      service.getCompetencyList(payload).subscribe({
        next: () => {},
        error: (err) => {
          expect(err).toEqual(errorResponse);
        },
      });
    });
  });

  describe('fetchCertificate', () => {
    it('should call get method with correct parameters and return observable', () => {
      const certId = '12345';
      const response = { certificateUrl: 'url' };

      // Mock the HTTP get method
      (httpClientMock.get as jest.Mock).mockReturnValue(of(response));

      // Call the method and check if it returns the correct observable
      service.fetchCertificate(certId).subscribe((result) => {
        expect(result).toEqual(response);
      });

      // Check if HttpClient.get was called with the correct URL
      expect(httpClientMock.get).toHaveBeenCalledWith(
        'apis/protected/v8/cohorts/course/batch/cert/download/12345'
      );
    });

    it('should handle error when HttpClient.get fails', () => {
      const certId = '12345';
      const errorResponse = new Error('Certificate fetch failed');

      // Mock the HTTP get method to return an error
      (httpClientMock.get as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      // Call the method and check if it returns the error
      service.fetchCertificate(certId).subscribe({
        next: () => {},
        error: (err) => {
          expect(err).toEqual(errorResponse);
        },
      });
    });
  });
});
