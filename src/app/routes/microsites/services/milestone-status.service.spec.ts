import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { firstValueFrom, of, throwError } from 'rxjs'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { NsCampaignMicrosite } from '../models/campaign-microsite.model'
import { MilestoneStatusService, fallbackStates, isMilestoneOpenable, toProgressState } from './milestone-status.service'

const PRE = 'do_pre'
const POST = 'do_post'
const EVENT = 'do_event'

const milestones = [
  { order: 1, type: 'assessment', identifier: PRE },
  { order: 2, type: 'event', identifier: EVENT, batchId: 'b_event' },
  { order: 3, type: 'survey', formId: 'f1' },
  { order: 4, type: 'assessment', identifier: POST },
] as NsCampaignMilestone.IMilestone[]

const courses = (pre?: object, post?: object) => ({
  result: {
    courses: [
      ...(pre ? [{ courseId: PRE, ...pre }] : []),
      ...(post ? [{ courseId: POST, ...post }] : []),
    ],
  },
})
const event = (record?: object) => ({ result: { events: record ? [{ contentId: EVENT, ...record }] : [] } })
const survey = (submitted?: boolean) => ({ result: { response: submitted === undefined ? [] : [{ submitted }] } })
const DONE = { status: 2, completionPercentage: 100 }

describe('MilestoneStatusService', () => {
  let service: MilestoneStatusService
  let http: { post: jest.Mock, get: jest.Mock }
  let configSvc: { userProfile: any }

  /** post() serves API A or C by URL; get() serves API B */
  function mockApis(apiA: any, apiB: any = event(), apiC: any = survey()) {
    http.post.mockImplementation((url: string) =>
      url.includes('bulkGetApplicationsById') ? toObservable(apiC) : toObservable(apiA))
    http.get.mockImplementation(() => toObservable(apiB))
  }
  const toObservable = (value: any) => value instanceof HttpErrorResponse ? throwError(() => value) : of(value)
  const callCounts = () => ({
    a: http.post.mock.calls.filter(([url]) => url.includes('enrollment/details')).length,
    b: http.get.mock.calls.length,
    c: http.post.mock.calls.filter(([url]) => url.includes('bulkGetApplicationsById')).length,
  })
  const resolve = (items = milestones) => firstValueFrom(service.resolveStates(items))
  const withFlags = (flags: Record<number, Partial<NsCampaignMilestone.IMilestone>>) =>
    milestones.map(m => ({ ...m, ...flags[m.order] }))

  beforeEach(() => {
    http = { post: jest.fn(), get: jest.fn() }
    configSvc = { userProfile: { userId: 'u1' } }
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: http },
        { provide: ConfigurationsService, useValue: configSvc },
      ],
    })
    service = TestBed.inject(MilestoneStatusService)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  describe('states (guide §4) and call counts (guide §9)', () => {
    it('new user: every unlocked milestone resolves on its own, 3 calls', async () => {
      mockApis(courses())
      expect(await resolve()).toEqual(['notStarted', 'notStarted', 'notStarted', 'notStarted'])
      expect(callCounts()).toEqual({ a: 1, b: 1, c: 1 })
    })

    it('order does not gate: a later milestone can be completed before an earlier one', async () => {
      mockApis(courses({ status: 1 }, DONE), event(), survey(true))
      expect(await resolve()).toEqual(['inProgress', 'notStarted', 'completed', 'completed'])
    })

    it('journey complete', async () => {
      mockApis(courses(DONE, DONE), event(DONE), survey(true))
      expect(await resolve()).toEqual(['completed', 'completed', 'completed', 'completed'])
      expect(callCounts()).toEqual({ a: 1, b: 1, c: 1 })
    })

    it('locked: true stays locked whatever the API says, and is not fetched', async () => {
      mockApis(courses(DONE, DONE), event(DONE), survey(true))
      expect(await resolve(withFlags({ 2: { locked: true }, 4: { locked: true } })))
        .toEqual(['completed', 'locked', 'completed', 'locked'])
      expect(callCounts()).toEqual({ a: 1, b: 0, c: 1 })
      expect(http.post).toHaveBeenCalledWith(expect.stringContaining('enrollment/details'),
        { request: { courseId: [PRE], retiredCoursesEnabled: true } })
    })

    it('enabled: false resolves as locked without an API call', async () => {
      mockApis(courses(DONE, DONE), event(DONE), survey(true))
      expect(await resolve(withFlags({ 3: { enabled: false } }))).toEqual(['completed', 'completed', 'locked', 'completed'])
      expect(callCounts()).toEqual({ a: 1, b: 1, c: 0 })
    })

    it('no assessment call when every assessment is locked or disabled', async () => {
      mockApis(courses(DONE, DONE), event(DONE), survey(true))
      await resolve(withFlags({ 1: { locked: true }, 4: { enabled: false } }))
      expect(callCounts()).toEqual({ a: 0, b: 1, c: 1 })
    })
  })

  describe('requests', () => {
    it('sends both assessments in one v4 call and the event/survey ids from JSON', async () => {
      mockApis(courses(DONE, DONE), event(DONE), survey(true))
      await resolve()
      expect(http.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/course/v4/user/enrollment/details/u1',
        { request: { courseId: [PRE, POST], retiredCoursesEnabled: true } },
      )
      expect(http.get).toHaveBeenCalledWith('/apis/proxies/v8/user/event/read/u1?eventId=do_event&batchId=b_event')
      expect(http.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/forms/v2/bulkGetApplicationsById',
        { userId: 'u1', formContextList: [{ formId: 'f1', contextId: 'f1' }] },
      )
    })
  })

  describe('failures', () => {
    it('event 404 means not registered, not an error', async () => {
      mockApis(courses(DONE), new HttpErrorResponse({ status: 404 }))
      expect(await resolve()).toEqual(['completed', 'notStarted', 'notStarted', 'notStarted'])
    })

    it.each([
      ['API A', () => mockApis(new HttpErrorResponse({ status: 500 }))],
      ['API B', () => mockApis(courses(DONE), new HttpErrorResponse({ status: 500 }))],
      ['API C', () => mockApis(courses(DONE), event(DONE), new HttpErrorResponse({ status: 500 }))],
    ])('%s failure falls back to every unlocked milestone available', async (_name, setup) => {
      setup()
      expect(await resolve(withFlags({ 4: { locked: true } }))).toEqual(['notStarted', 'notStarted', 'notStarted', 'locked'])
    })

    it('falls back without calling any API when userId is missing', async () => {
      configSvc.userProfile = null
      mockApis(courses(DONE, DONE))
      expect(await resolve()).toEqual(['notStarted', 'notStarted', 'notStarted', 'notStarted'])
      expect(callCounts()).toEqual({ a: 0, b: 0, c: 0 })
    })
  })

  describe('event enrollment', () => {
    const event = { order: 2, type: 'event', identifier: EVENT, batchId: 'b_event' } as NsCampaignMicrosite.IMilestone

    it('registers the user for the event batch and remembers it', async () => {
      http.post.mockReturnValue(of({ responseCode: 'OK' }))
      await service.enrollEvent(event)
      expect(http.post).toHaveBeenCalledWith('/apis/proxies/v8/event/batch/enroll', {
        request: { userId: 'u1', eventId: EVENT, batchId: 'b_event' },
      })
      expect(service.isEventEnrolled(EVENT)).toBe(true)
    })

    it('rejects when the API does not confirm, without marking the user enrolled', async () => {
      http.post.mockReturnValue(of({ responseCode: 'CLIENT_ERROR' }))
      await expect(service.enrollEvent(event)).rejects.toThrow()
      expect(service.isEventEnrolled(EVENT)).toBe(false)
    })

    it('rejects without a batchId', async () => {
      await expect(service.enrollEvent({ ...event, batchId: '' })).rejects.toThrow()
      expect(http.post).not.toHaveBeenCalled()
    })

    it('API B marks the event as enrolled only when a record exists', async () => {
      mockApis(courses(), event_record())
      await resolve()
      expect(service.isEventEnrolled(EVENT)).toBe(true)
    })

    it('API B with no record leaves the event not enrolled', async () => {
      mockApis(courses())
      await resolve()
      expect(service.isEventEnrolled(EVENT)).toBe(false)
    })

    function event_record() {
      return { result: { events: [{ contentId: EVENT, status: 0 }] } }
    }
  })

  describe('assessment enrollment (API D)', () => {
    const assessment = { order: 1, type: 'assessment', identifier: PRE, language: 'hindi' } as NsCampaignMicrosite.IMilestone
    const enrolled = (batchId?: string) => ({ result: { response: { content: batchId ? [{ batchId }] : [] } } })

    it('calls autoenrollment with the config language and remembers the batch it returns', async () => {
      http.get.mockReturnValue(of(enrolled('b_new')))
      expect(await service.enrollAssessment(assessment)).toBe('b_new')
      expect(http.get).toHaveBeenCalledWith(`/apis/protected/v8/cohorts/user/autoenrollment/${PRE}?language=hindi`)
      expect(service.enrolledBatchId(PRE)).toBe('b_new')
    })

    it('defaults the language to english', async () => {
      http.get.mockReturnValue(of(enrolled('b_new')))
      await service.enrollAssessment({ ...assessment, language: undefined })
      expect(http.get.mock.calls[0][0]).toContain('?language=english')
    })

    it('falls back to the config batchId when the response carries none', async () => {
      http.get.mockReturnValue(of(enrolled()))
      expect(await service.enrollAssessment({ ...assessment, batchId: 'b_config' })).toBe('b_config')
    })

    it('propagates API errors to the caller', async () => {
      http.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })))
      await expect(service.enrollAssessment(assessment)).rejects.toBeInstanceOf(HttpErrorResponse)
      expect(service.enrolledBatchId(PRE)).toBeUndefined()
    })

    it('API A records the enrolled batch so a later start skips enrollment', async () => {
      mockApis(courses({ status: 1, batchId: 'b_pre' }, { status: 0, batch: { batchId: 'b_post' } }))
      await resolve()
      expect(service.enrolledBatchId(PRE)).toBe('b_pre')
      expect(service.enrolledBatchId(POST)).toBe('b_post')
      expect(service.enrolledBatchId('do_unknown')).toBeUndefined()
    })
  })
})

describe('toProgressState', () => {
  it.each([
    [undefined, 'notStarted'],
    [{ status: 0, completionPercentage: 0 }, 'notStarted'],
    [{ status: 1, completionPercentage: 50 }, 'inProgress'],
    [{ status: 2, completionPercentage: 80 }, 'completed'],
    [{ status: 1, completionPercentage: 100 }, 'completed'],
    [{ status: '2' }, 'completed'],
  ])('%j → %s', (record, expected) => {
    expect(toProgressState(record as any)).toBe(expected)
  })
})

describe('isMilestoneOpenable', () => {
  it.each([
    [{}, true],
    [{ enabled: true, locked: false }, true],
    [{ locked: true }, false],
    [{ enabled: false }, false],
  ])('%j → %s', (flags, expected) => {
    expect(isMilestoneOpenable(flags as NsCampaignMilestone.IMilestone)).toBe(expected)
  })
})

describe('fallbackStates', () => {
  it('keeps locked and disabled milestones locked, the rest available', () => {
    expect(fallbackStates(withFlagsOf([{}, { locked: true }, { enabled: false }]))).toEqual(['notStarted', 'locked', 'locked'])
    expect(fallbackStates([])).toEqual([])
  })

  function withFlagsOf(flags: Partial<NsCampaignMilestone.IMilestone>[]) {
    return flags.map((f, i) => ({ order: i + 1, type: 'assessment', ...f })) as NsCampaignMilestone.IMilestone[]
  }
})
