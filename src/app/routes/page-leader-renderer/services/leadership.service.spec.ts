import { LeadershipService } from './leadership.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import {
  IWsEmailTextRequest,
  IWsEmailResponse,
  IWsEmailUserId,
  IWsUserFollow,
} from '../model/leadership-email.model';

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

describe('LeadershipService', () => {
  let service: LeadershipService;
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>;
    service = new LeadershipService(httpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Basic Properties', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return correct randomId', () => {
      expect(service.randomId).toBe(1);
    });
  });

  describe('shareTextMail', () => {
    it('should call http.post with correct endpoint and request', () => {
      // Arrange
      const mockRequest: IWsEmailTextRequest = {
          // Add your interface properties here based on your model
          email: 'test@example.com',
          text: 'Test email content'
      } as unknown as IWsEmailTextRequest;

      const mockResponse = {
        result: {
            success: true,
            message: 'Email sent successfully'
        } as unknown as IWsEmailResponse
      };

      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result$ = service.shareTextMail(mockRequest);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/email/emailText',
        mockRequest
      );

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse.result);
      });
    });

    it('should return mapped result from response', (done) => {
      // Arrange
      const mockRequest: IWsEmailTextRequest = {
          email: 'test@example.com',
          text: 'Test content'
      } as unknown as IWsEmailTextRequest;

      const expectedResult: IWsEmailResponse = {
          success: true,
          message: 'Success'
      } as unknown as IWsEmailResponse;

      const mockResponse = {
        result: expectedResult,
        status: 200
      };

      httpClient.post.mockReturnValue(of(mockResponse));

      // Act & Assert
      service.shareTextMail(mockRequest).subscribe(result => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });
  });

  describe('emailToUserId', () => {
    it('should call http.get with correct endpoint including email parameter', () => {
      // Arrange
      const testEmail = 'test@example.com';
      const mockResponse: IWsEmailUserId = {
        userId: '12345',
        email: testEmail
      } as IWsEmailUserId;

      httpClient.get.mockReturnValue(of(mockResponse));

      // Act
      const result$ = service.emailToUserId(testEmail);

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(
        `/apis/protected/v8/user/emailToUserId/${testEmail}`
      );

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse);
      });
    });

    it('should return user id response', (done) => {
      // Arrange
      const testEmail = 'user@test.com';
      const expectedResponse: IWsEmailUserId = {
        userId: 'user123',
        email: testEmail
      } as IWsEmailUserId;

      httpClient.get.mockReturnValue(of(expectedResponse));

      // Act & Assert
      service.emailToUserId(testEmail).subscribe(result => {
        expect(result).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('fetchUserFollow', () => {
    it('should call http.post with correct endpoint and body structure', () => {
      // Arrange
      const testUserId = 'user123';
      const expectedBody = {
        userid: testUserId
      };
      const mockResponse: IWsUserFollow = {
        followers: [],
        following: []
      } as IWsUserFollow;

      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result$ = service.fetchUserFollow(testUserId);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow/fetchAll',
        expectedBody
      );

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse);
      });
    });

    it('should return user follow data', (done) => {
      // Arrange
      const testUserId = 'user456';
      const expectedResponse: IWsUserFollow = {
          followers: [{ id: '1', name: 'Follower 1' }],
          following: [{ id: '2', name: 'Following 1' }]
      } as unknown as IWsUserFollow;

      httpClient.post.mockReturnValue(of(expectedResponse));

      // Act & Assert
      service.fetchUserFollow(testUserId).subscribe(result => {
        expect(result).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('followUser', () => {
    it('should call http.post with correct endpoint and request', () => {
      // Arrange
      const mockRequest = {
        userId: 'user123',
        followUserId: 'user456'
      };
      const mockResponse = {
        success: true,
        message: 'User followed successfully'
      };

      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result$ = service.followUser(mockRequest);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow',
        mockRequest
      );

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse);
      });
    });

    it('should return follow response', (done) => {
      // Arrange
      const testRequest = { userId: '123', targetUserId: '456' };
      const expectedResponse = { success: true, followId: 'follow123' };

      httpClient.post.mockReturnValue(of(expectedResponse));

      // Act & Assert
      service.followUser(testRequest).subscribe(result => {
        expect(result).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('unFollowUser', () => {
    it('should call http.post with correct endpoint and request', () => {
      // Arrange
      const mockRequest = {
        userId: 'user123',
        unfollowUserId: 'user456'
      };
      const mockResponse = {
        success: true,
        message: 'User unfollowed successfully'
      };

      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result$ = service.unFollowUser(mockRequest);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow/unfollow',
        mockRequest
      );

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse);
      });
    });

    it('should return unfollow response', (done) => {
      // Arrange
      const testRequest = { userId: '123', targetUserId: '456' };
      const expectedResponse = { success: true, message: 'Unfollowed' };

      httpClient.post.mockReturnValue(of(expectedResponse));

      // Act & Assert
      service.unFollowUser(testRequest).subscribe(result => {
        expect(result).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors in shareTextMail', (done) => {
      // Arrange
      const mockRequest: IWsEmailTextRequest = {
          email: 'test@example.com',
          text: 'Test'
      } as unknown as IWsEmailTextRequest;

      const errorResponse = new Error('HTTP Error');
      httpClient.post.mockReturnValue(of().pipe(() => {
        throw errorResponse;
      }));

      // Act & Assert
      service.shareTextMail(mockRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBe(errorResponse);
          done();
        }
      });
    });

    it('should handle HTTP errors in emailToUserId', (done) => {
      // Arrange
      const testEmail = 'test@example.com';
      const errorResponse = new Error('User not found');
      httpClient.get.mockReturnValue(of().pipe(() => {
        throw errorResponse;
      }));

      // Act & Assert
      service.emailToUserId(testEmail).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBe(errorResponse);
          done();
        }
      });
    });
  });

  describe('API Endpoints Validation', () => {
    it('should use correct API endpoints', () => {
      // This test validates that the service uses the expected endpoints
      const mockRequest = { test: 'data' };
      httpClient.post.mockReturnValue(of({}));
      httpClient.get.mockReturnValue(of({}));

      // Test all endpoints
      service.shareTextMail(mockRequest as any);
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/email/emailText',
        mockRequest
      );

      service.emailToUserId('test@email.com');
      expect(httpClient.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/emailToUserId/test@email.com'
      );

      service.fetchUserFollow('user123');
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow/fetchAll',
        { userid: 'user123' }
      );

      service.followUser(mockRequest);
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow',
        mockRequest
      );

      service.unFollowUser(mockRequest);
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/follow/unfollow',
        mockRequest
      );
    });
  });
});