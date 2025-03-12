

import { of } from 'rxjs';
import { WelcomeUsersService } from './public-welcome.service';

// Mocking HttpClient
class MockHttpClient {
  post = jest.fn();
  get = jest.fn();
}

describe('WelcomeUsersService', () => {
  let service: WelcomeUsersService;
  let mockHttpClient: MockHttpClient;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    service = new WelcomeUsersService(mockHttpClient as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the register API and return response', (done) => {
    const mockResponse = { success: true };
    const requestPayload = { name: 'John Doe' };
    
    mockHttpClient.post.mockReturnValue(of(mockResponse));

    service.register(requestPayload).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/basicProfileUpdate',
        requestPayload
      );
      done();
    });
  });

  it('should call getStatesOrMinisteries API and return response', (done) => {
    const mockResponse = ['state1', 'state2'];
    const type = 'someType';
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    service.getStatesOrMinisteries(type).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/public/v8/org/v1/list/someType'
      );
      done();
    });
  });

  it('should call getDeparmentsOfState API and return response', (done) => {
    const mockResponse = ['dept1', 'dept2'];
    const stateId = '123';
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    service.getDeparmentsOfState(stateId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/public/v8/org/v1/list/123'
      );
      done();
    });
  });

  it('should call getOrgsOfDepartment API and return response', (done) => {
    const mockResponse = ['org1', 'org2'];
    const deptId = '456';
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    service.getOrgsOfDepartment(deptId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/public/v8/org/v1/list/456'
      );
      done();
    });
  });
});
