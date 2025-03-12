
import { AppPublicPositionResolverService } from './position-resolver.service';
import { of, throwError } from 'rxjs';

// Mock SignupService
class MockSignupService {
  getPositions = jest.fn();
}

describe('AppPublicPositionResolverService', () => {
  let resolver: AppPublicPositionResolverService;
  let mockSignupService: MockSignupService;

  beforeEach(() => {
    mockSignupService = new MockSignupService();
    resolver = new AppPublicPositionResolverService(mockSignupService as any);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  describe('resolve', () => {
    it('should resolve data when getPositions returns data successfully', (done) => {
      const mockResponse = { responseData: [{ name: 'Position 1' }, { name: 'Position 2' }] };
      mockSignupService.getPositions.mockReturnValue(of(mockResponse));

      resolver.resolve({} as any, {} as any).subscribe((result) => {
        expect(result.error).toBeNull();
        expect(result.data).toEqual(mockResponse.responseData);
        done();
      });
    });

    it('should handle error when getPositions throws an error', (done) => {
      const mockError = new Error('Something went wrong');
      mockSignupService.getPositions.mockReturnValue(throwError(mockError));

      resolver.resolve({} as any, {} as any).subscribe((result) => {
        expect(result.error).toEqual(mockError);
        expect(result.data).toBeNull();
        done();
      });
    });
  });
});
