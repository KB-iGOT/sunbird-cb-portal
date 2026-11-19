jest.mock('video.js', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('videojs-youtube', () => ({}))
jest.mock('videojs-contrib-quality-levels', () => ({}))
jest.mock('videojs-hls-quality-selector', () => ({}))
jest.mock('videojs-vr', () => ({}))
jest.mock('@sunbird-cb/utils-v2', () => ({
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'LOADED', Unloaded: 'UNLOADED', HeartBeat: 'HEARTBEAT' },
    EnumTelemetryMediaActivity: { PLAYED: 'PLAYED', PAUSED: 'PAUSED', ENDED: 'ENDED' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info', Trace: 'Trace' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
}))

import { youtubeInitializer } from './videojs-util'

const PLAYING = 1
const PAUSED = 2
const BUFFERING = 3

describe('videojs-util youtubeInitializer', () => {
  let onStateChange: (e: any) => void
  let dispatcher: jest.Mock
  let passThroughData: any
  const playerMock = {
    getCurrentTime: jest.fn().mockReturnValue(10),
    getDuration: jest.fn().mockReturnValue(1000),
  }
  const widgetData: any = { identifier: 'do_1', primaryCategory: 'Event', version: 1, collectionId: '' }

  const init = () => youtubeInitializer(
    document.createElement('div'), 'yt-id', dispatcher, jest.fn(), jest.fn(),
    passThroughData, 'eventYouTube', true, widgetData, 'video/x-youtube' as any, '400px',
  )

  // heartbeat events that carry the running time (the ones event-you-tube compares with rateToFire)
  const timedHeartBeats = () => dispatcher.mock.calls
    .map(c => c[0])
    .filter(e => e.data && e.data.state === 'HEARTBEAT' && e.data.passThroughData)

  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    dispatcher = jest.fn()
    passThroughData = {}
    ;(window as any).YT = {
      PlayerState: { PLAYING, PAUSED, BUFFERING, ENDED: 0 },
      Player: jest.fn().mockImplementation((_elem: any, opts: any) => {
        onStateChange = opts.events.onStateChange
        return playerMock
      }),
    }
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    delete (window as any).YT
  })

  it('should send passThroughData.timeSpent with every heartbeat', () => {
    const { dispose } = init()
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(3000)

    const beats = timedHeartBeats()
    expect(beats.length).toBe(3)
    expect(beats.every(e => typeof e.data.passThroughData.timeSpent === 'number')).toBe(true)
    dispose()
  })

  it('should increase timeSpent by 1 a second after buffering (no duplicate timer)', () => {
    const { dispose } = init()
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(2000)
    onStateChange({ data: BUFFERING })
    onStateChange({ data: PLAYING })
    const before = passThroughData.timeSpent
    jest.advanceTimersByTime(5000)

    expect(passThroughData.timeSpent - before).toBe(5)
    dispose()
  })

  it('should reach every second so a timeSpent % rateToFire === 0 check can match', () => {
    // passThroughData is one shared object, so read timeSpent when each heartbeat is dispatched
    const values: number[] = []
    dispatcher.mockImplementation((e: any) => {
      if (e.data && e.data.state === 'HEARTBEAT' && e.data.passThroughData) {
        values.push(e.data.passThroughData.timeSpent)
      }
    })
    const { dispose } = init()
    onStateChange({ data: PLAYING })
    onStateChange({ data: BUFFERING })
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(60000)

    expect(values.length).toBe(60)
    expect(values.some(v => v % 60 === 0)).toBe(true)
    dispose()
  })

  it('should stop counting time on pause and send unloaded', () => {
    const { dispose } = init()
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(2000)
    onStateChange({ data: PAUSED })
    const paused = passThroughData.timeSpent
    jest.advanceTimersByTime(5000)

    expect(passThroughData.timeSpent).toBe(paused)
    expect(dispatcher.mock.calls.some(c => c[0].data && c[0].data.state === 'UNLOADED')).toBe(true)
    dispose()
  })

  it('should resume time spent from passThroughData.resumeFrom', () => {
    passThroughData = { resumeFrom: 100 }
    const { dispose } = init()
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(1000)

    expect(passThroughData.timeSpent).toBe(101)
    dispose()
  })

  it('should not dispatch anything when telemetry is disabled', () => {
    const { dispose } = youtubeInitializer(
      document.createElement('div'), 'yt-id', dispatcher, jest.fn(), jest.fn(),
      passThroughData, 'eventYouTube', false, widgetData, 'video/x-youtube' as any, '400px',
    )
    onStateChange({ data: PLAYING })
    jest.advanceTimersByTime(3000)

    expect(dispatcher).not.toHaveBeenCalled()
    dispose()
  })
})
