// web-socket.service.spec.ts

import { WebSocketService } from "./socket.service";

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: any;
  let originalWebSocket: any;

  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console methods to prevent noise in test output
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Save original WebSocket
    originalWebSocket = global.WebSocket;
    
    // Create mock WebSocket implementation
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN,
      OPEN: WebSocket.OPEN,
    };
    
    // Mock global WebSocket constructor
  
    
    // Create service instance
    service = new WebSocketService();
  });

  afterEach(() => {
    // Restore original WebSocket
    global.WebSocket = originalWebSocket;
    
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

 

  describe('sendMessage', () => {
    

    it('should log error when WebSocket is not open', () => {
      const testMessage = 'test message';
      
      // Set WebSocket to closed state
      mockWebSocket.readyState = WebSocket.CLOSED;
      
      service.connect('wss://example.com');
      service.sendMessage(testMessage);
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('WebSocket is not open');
    });

    it('should log error when WebSocket is not initialized', () => {
      const testMessage = 'test message';
      
      // Don't call connect() to keep WebSocket undefined
      service.sendMessage(testMessage);
      
      expect(console.error).toHaveBeenCalledWith('WebSocket is not open');
    });
  });



  describe('closeConnection', () => {
    

    it('should handle case when WebSocket is not initialized', () => {
      // Create a new service without calling connect()
      const freshService = new WebSocketService();
      
      // Should not throw an error
      expect(() => freshService.closeConnection()).not.toThrow();
    });
  });

 
});