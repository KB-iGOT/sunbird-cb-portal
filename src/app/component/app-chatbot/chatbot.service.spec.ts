import { ChatbotService } from './chatbot.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

// Mock HttpClient as Jest mock function
jest.mock('@angular/common/http', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

describe('ChatbotService', () => {
  let chatbotService: ChatbotService;
  let httpClientMock: HttpClient;

  beforeEach(() => {
    // We have to cast the HttpClient mock to the correct type.
    httpClientMock = new HttpClient(null as any); // `null` or `undefined` here, as we don't need actual HttpHandler.
    chatbotService = new ChatbotService(httpClientMock);
  });

  it('should be created', () => {
    expect(chatbotService).toBeTruthy();
  });

  describe('getLangugages', () => {
    it('should make a GET request and return data', () => {
      const mockResponse = { languages: ['en', 'fr', 'es'] };
      
      // Mock the HTTP Client's GET method
      (httpClientMock.get as jest.Mock).mockReturnValue(of(mockResponse)); 

      chatbotService.getLangugages().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith('/api/faq/v1/assistant/available/language');
    });

    it('should handle error correctly when GET request fails', () => {
      const errorResponse = { message: 'Error' };

      // Simulate an error response with `throwError`
      (httpClientMock.get as jest.Mock).mockReturnValue(throwError(errorResponse));

      chatbotService.getLangugages().subscribe({
        next: () => {},
        error: (err) => {
          expect(err).toEqual(errorResponse);
        },
      });

      expect(httpClientMock.get).toHaveBeenCalledWith('/api/faq/v1/assistant/available/language');
    });
  });

  describe('getChatData', () => {
    it('should make a POST request and return data', () => {
      const tabType = { type: 'someType' };
      const mockResponse = { data: 'some data' };

      // Mock the HTTP Client's POST method
      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse));

      chatbotService.getChatData(tabType).subscribe((response:any) => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith('/api/faq/v1/assistant/configs/language', tabType);
    });

    it('should handle error correctly when POST request fails', () => {
      const tabType = { type: 'someType' };
      const errorResponse = { message: 'Error' };

      // Simulate an error response with `throwError`
      (httpClientMock.post as jest.Mock).mockReturnValue(throwError(errorResponse));

      chatbotService.getChatData(tabType).subscribe({
        next: () => {},
        error: (err:any) => {
          expect(err).toEqual(errorResponse);
        },
      });

      expect(httpClientMock.post).toHaveBeenCalledWith('/api/faq/v1/assistant/configs/language', tabType);
    });
  });
});
