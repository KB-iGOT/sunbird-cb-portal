// web-socket.service.spec.ts

import { WebSocketService } from './socket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: any;

  beforeEach(() => {
    service = new WebSocketService();

    // Mocking the WebSocket
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN,
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onerror: jest.fn(),
      onclose: jest.fn(),
    };

    global.WebSocket = jest.fn(() => mockWebSocket) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to WebSocket and set event handlers', () => {
    service.connect('ws://localhost');

    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost');
    expect(mockWebSocket.onopen).toBeDefined();
    expect(mockWebSocket.onmessage).toBeDefined();
    expect(mockWebSocket.onerror).toBeDefined();
    expect(mockWebSocket.onclose).toBeDefined();
  });

  it('should emit messages received from WebSocket', (done) => {
    service.connect('ws://localhost');

    const testData = 'Hello from server';
    service.getMessages().subscribe((msg) => {
      expect(msg).toBe(testData);
      done();
    });

    // Simulate receiving a message
    mockWebSocket.onmessage({ data: testData });
  });

  it('should send a message if WebSocket is open', () => {
    service.connect('ws://localhost');
    service.sendMessage('Test Message');

    expect(mockWebSocket.send).toHaveBeenCalledWith('Test Message');
  });

  it('should not send a message if WebSocket is not open', () => {
    mockWebSocket.readyState = WebSocket.CLOSED;
    service.connect('ws://localhost');
    service.sendMessage('Test Message');

    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should close the WebSocket connection', () => {
    service.connect('ws://localhost');
    service.closeConnection();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});
