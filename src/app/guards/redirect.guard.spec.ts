import { RedirectGuard } from './redirect.guard';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('RedirectGuard', () => {
  let guard: RedirectGuard;
  let locationSpy: jest.SpyInstance;
  
  // Save original window.location

  beforeEach(() => {
    // Mock window.location before each test
    
    // Spy on the href property setter
    locationSpy = jest.spyOn(window.location, 'href', 'set');
    
    // Create the guard
    guard = new RedirectGuard();
  });
  
  afterEach(() => {
    // Restore original window.location
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to the URL specified in route data and return true', () => {
    // Arrange: Create a mock ActivatedRouteSnapshot with externalUrl in data
    const mockRoute = {
        data: {
            externalUrl: 'https://example.com'
        }
    } as unknown as ActivatedRouteSnapshot;
    
    // Act: Call canActivate
    const result = guard.canActivate(mockRoute);
    
    // Assert: Should set window.location.href and return true
    expect(locationSpy).toHaveBeenCalledWith('https://example.com');
    expect(result).toBe(true);
  });

  it('should handle route with no externalUrl', () => {
    // Arrange: Create a mock ActivatedRouteSnapshot with empty data
    const mockRoute = {
      data: {}
    } as ActivatedRouteSnapshot;
    
    // Act & Assert: Should throw when trying to access undefined property
    expect(() => {
      guard.canActivate(mockRoute);
    }).toThrow();
    
    expect(locationSpy).not.toHaveBeenCalled();
  });

  it('should handle different types of URLs', () => {
    // Test with relative URL
    const relativeRoute = {
        data: { externalUrl: '/some-path' }
    } as unknown as ActivatedRouteSnapshot;
    
    guard.canActivate(relativeRoute);
    expect(locationSpy).toHaveBeenCalledWith('/some-path');
    jest.clearAllMocks();
    
    // Test with absolute URL
    const absoluteRoute = {
        data: { externalUrl: 'https://example.org/path?query=test' }
    } as unknown as ActivatedRouteSnapshot;
    
    guard.canActivate(absoluteRoute);
    expect(locationSpy).toHaveBeenCalledWith('https://example.org/path?query=test');
  });
});