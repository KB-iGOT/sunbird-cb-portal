import { GlobalErrorHandlingService } from './global-error-handling.service';

describe('GlobalErrorHandlingService', () => {
  let service: GlobalErrorHandlingService;
  let originalWindowLocation: Location;

  beforeEach(() => {
    // Save original window.location
    originalWindowLocation = window.location;
    
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalWindowLocation, reload: jest.fn() } as any;
    
    // Create service instance
    service = new GlobalErrorHandlingService();
  });

  afterEach(() => {
    // Restore original window.location
   
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reload page when encountering a ChunkLoadError', () => {
    // Arrange
    const chunkError = new Error('ChunkLoadError: Failed to load chunk');
    
    // Act
    service.handleError(chunkError);
    
    // Assert
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('should reload page for errors with ChunkLoadError in the message', () => {
    // Arrange
    const chunkError = new Error('Something went wrong with ChunkLoadError in the message');
    
    // Act
    service.handleError(chunkError);
    
    // Assert
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('should rethrow other errors', () => {
    // Arrange
    const regularError = new Error('Regular error message');
    
    // Act & Assert
    expect(() => service.handleError(regularError)).toThrow('Regular error message');
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('should handle null or undefined errors', () => {
    // Since the implementation uses error.message, we should test null/undefined handling
    
    // Act & Assert - this would throw if not handled properly
    expect(() => service.handleError(null)).toThrow();
    expect(() => service.handleError(undefined)).toThrow();
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});