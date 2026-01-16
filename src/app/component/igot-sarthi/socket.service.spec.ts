import { of } from 'rxjs'
import { WebSocketService } from './socket.service'

describe('WebSocketService', () => {
  let service: WebSocketService
  let mockHttp: any
  let WebSocketMock: any
  let socketInstance: any
  let originalWebSocket: any

  const originalConsoleLog = console.log
  const originalConsoleError = console.error

  beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()

    mockHttp = {
      get: jest.fn(),
    }

    originalWebSocket = (globalThis as any).WebSocket

    WebSocketMock = jest.fn().mockImplementation((url: string) => {
      socketInstance = {
        url,
        readyState: WebSocketMock.OPEN,
        send: jest.fn(),
        close: jest.fn(),
        onopen: null as any,
        onmessage: null as any,
        onerror: null as any,
        onclose: null as any,
      }
      return socketInstance
    })
    WebSocketMock.OPEN = 1
    WebSocketMock.CLOSED = 3

      ; (globalThis as any).WebSocket = WebSocketMock

    service = new WebSocketService(mockHttp)
  })

  afterEach(() => {
    ; (globalThis as any).WebSocket = originalWebSocket
    console.log = originalConsoleLog
    console.error = originalConsoleError
    jest.clearAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  describe('connect and socket lifecycle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should establish connection and start ping on open', () => {
      service.connect('wss://example.com')

      expect(WebSocketMock).toHaveBeenCalledWith('wss://example.com')

      // simulate open
      socketInstance.readyState = WebSocketMock.OPEN
      socketInstance.onopen()

      expect(console.log).toHaveBeenCalledWith('WebSocket connection established')

      // advance timer to trigger ping
      jest.advanceTimersByTime(60000)
      expect(socketInstance.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }))
    })

    it('should handle onmessage with connection payload and set clientId', () => {
      service.connect('ws://test')
      const payload = { type: 'connection', clientId: 'client-123' }

      socketInstance.onmessage({ data: JSON.stringify(payload) } as any)

      expect((service as any).clientId).toBe('client-123')
    })

    it('should emit non-connection messages through observable', done => {
      service.connect('ws://test')
      const payload = { type: 'answer', answer: 'ok' }

      service.getMessages().subscribe(data => {
        expect(data).toEqual(payload)
        done()
      })

      socketInstance.onmessage({ data: JSON.stringify(payload) } as any)
    })

    it('should safely handle invalid JSON in onmessage', () => {
      service.connect('ws://test')

      expect(() => {
        socketInstance.onmessage({ data: 'not-json' } as any)
      }).not.toThrow()
    })

    it('should log error on socket error', () => {
      service.connect('ws://test')
      const err = new Error('ws error')

      socketInstance.onerror(err as any)

      expect(console.error).toHaveBeenCalledWith('WebSocket error:', err)
    })

    it('should log when socket is closed', () => {
      service.connect('ws://test')

      socketInstance.onclose()

      expect(console.log).toHaveBeenCalledWith('WebSocket connection closed')
    })
  })

  describe('sendMessage', () => {
    it('should send message when socket is open', () => {
      service.connect('ws://test')
      socketInstance.readyState = WebSocketMock.OPEN

      const msg = { foo: 'bar' }
      service.sendMessage(msg)

      expect(socketInstance.send).toHaveBeenCalledTimes(1)
      const sent = socketInstance.send.mock.calls[0][0]
      expect(JSON.parse(sent)).toEqual(msg)
    })

    it('should log error when WebSocket is not open', () => {
      service.connect('ws://test')
      socketInstance.readyState = WebSocketMock.CLOSED

      service.sendMessage({})

      expect(socketInstance.send).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('WebSocket is not open')
    })

    it('should log error when WebSocket is not initialized', () => {
      const freshService = new WebSocketService(mockHttp)

      freshService.sendMessage('test')

      expect(console.error).toHaveBeenCalledWith('WebSocket is not open')
    })
  })

  describe('getMessages', () => {
    it('should return observable that emits messages', done => {
      service.connect('ws://test')
      const payload = { type: 'data', value: 1 }

      service.getMessages().subscribe(data => {
        expect(data).toEqual(payload)
        done()
      })

      socketInstance.onmessage({ data: JSON.stringify(payload) } as any)
    })
  })

  describe('startClientPing and closeConnection', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should not throw when closing without socket', () => {
      const freshService = new WebSocketService(mockHttp)
      expect(() => freshService.closeConnection()).not.toThrow()
    })

    it('should close socket and clear ping when connection is closed', () => {
      service.connect('ws://test')
      socketInstance.readyState = WebSocketMock.OPEN
      socketInstance.onopen()

      service.closeConnection()

      expect(socketInstance.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('getJWTToken', () => {
    it('should call http.get with correct endpoint', () => {
      mockHttp.get.mockReturnValue(of({ token: 'abc' }))

      const result$ = service.getJWTToken()

      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/fetchUserToken')
      result$.subscribe((res: any) => {
        expect(res).toEqual({ token: 'abc' })
      })
    })
  })
})
