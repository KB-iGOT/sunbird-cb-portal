import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { CertificateDialogComponent, NsCampaignMilestone } from '@sunbird-cb/consumption'
import { Subject, of } from 'rxjs'
import { NsCampaignMicrosite, formatOrdinalDateTime } from '../../models/campaign-microsite.model'
import { ConfigurationsService, ServerClockService } from '@sunbird-cb/utils-v2'
import { MilestoneStatusService } from '../../services/milestone-status.service'
import { MicrositeTelemetryService } from '../../services/microsite-telemetry.service'
import { CampaignSurveyDialogComponent } from '../campaign-survey-dialog/campaign-survey-dialog.component'
import {
  ProgrammeMilestonesComponent, milestonePopupSeenKey, buildPlayerRoute, eventCta, eventPhase, formatCountdown, isInAutoOpenWindow, milestoneAction,
  withEndedEvents,
} from './programme-milestones.component'
import { DEFAULT_MILESTONE_LABELS } from '../../models/campaign-microsite.model'

const milestone = (order: number, overrides: Partial<NsCampaignMicrosite.IMilestone> = {}) => ({
  order,
  type: 'assessment',
  identifier: `do_${order}`,
  batchId: `b_${order}`,
  milestoneLabel: `Milestone ${order}`,
  theme: 'blue',
  durationLabel: '30 mins',
  categoryLabel: 'Assessment',
  name: `Milestone name ${order}`,
  tags: [],
  provider: { name: 'Karmayogi Bharat', logo: '' },
  ...overrides,
}) as NsCampaignMicrosite.IMilestone

const OPEN_WINDOW: NsCampaignMicrosite.IEventDetails = { startDate: '01-01-2000', endDate: '31-12-2099' }

describe('ProgrammeMilestonesComponent', () => {
  let fixture: ComponentFixture<ProgrammeMilestonesComponent>
  let component: ProgrammeMilestonesComponent
  let el: HTMLElement
  let statusSvc: { resolveStates: jest.Mock, enrolledBatchId: jest.Mock, enrollAssessment: jest.Mock, isEventEnrolled: jest.Mock, enrollEvent: jest.Mock,
    issuedCertificateId: jest.Mock, fetchCertificate: jest.Mock, completeEvent: jest.Mock }
  let router: { navigate: jest.Mock, navigateByUrl: jest.Mock, url: string }
  let dialog: { open: jest.Mock, openDialogs: unknown[] }
  let dialogResult: Subject<boolean | undefined>
  let snackBar: { open: jest.Mock }
  let telemetry: { click: jest.Mock, impression: jest.Mock }

  function render(
    config: Partial<NsCampaignMicrosite.IProgrammeMilestones>,
    eventDetails: NsCampaignMicrosite.IEventDetails | undefined = OPEN_WINDOW,
  ) {
    fixture.componentRef.setInput('config', { enabled: true, title: 'Programme Milestones', items: [], ...config })
    fixture.componentRef.setInput('eventDetails', eventDetails)
    fixture.detectChanges()
  }
  /** Stubbed cards expose the bound inputs as DOM properties */
  const cards = () => Array.from(el.querySelectorAll('sb-uic-milestone-card')) as any[]

  beforeEach(() => {
    statusSvc = {
      resolveStates: jest.fn(() => of([])), enrolledBatchId: jest.fn(), enrollAssessment: jest.fn(),
      isEventEnrolled: jest.fn(() => false), enrollEvent: jest.fn(),
      issuedCertificateId: jest.fn(), fetchCertificate: jest.fn(), completeEvent: jest.fn(),
    }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/app/microsites/campaign/kalp?tab=1' }
    dialogResult = new Subject()
    dialog = { open: jest.fn(() => ({ afterClosed: () => dialogResult })), openDialogs: [] }
    snackBar = { open: jest.fn() }
    telemetry = { click: jest.fn(), impression: jest.fn() }
    TestBed.configureTestingModule({
      imports: [ProgrammeMilestonesComponent],
      providers: [
        { provide: MilestoneStatusService, useValue: statusSvc },
        // the real clock reads server time from ConfigurationsService; its own spec covers that
        { provide: ServerClockService, useValue: { now: () => Date.now() } },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MicrositeTelemetryService, useValue: telemetry },
        { provide: ConfigurationsService, useValue: { userProfile: { userId: 'u1' } } },
      ],
    })
    // The card is covered by its own specs in the consumption library. Through npm link it also
    // resolves a second @angular/core under Jest (the app build uses preserveSymlinks), so stub it.
    TestBed.overrideComponent(ProgrammeMilestonesComponent, {
      set: { imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    fixture = TestBed.createComponent(ProgrammeMilestonesComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
  })

  describe('visibility (guide §7 stage 1)', () => {
    it('renders title and one card per milestone', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'locked']))
      render({ items: [milestone(1), milestone(2)] })
      expect(el.querySelector('h2')?.textContent?.trim()).toBe('Programme Milestones')
      expect(cards().length).toBe(2)
    })

    it.each([
      ['disabled', { enabled: false, items: [milestone(1)] }, OPEN_WINDOW],
      ['empty', { items: [] }, OPEN_WINDOW],
    ])('hidden and no API call when %s', (_name, config, window) => {
      render(config as any, window)
      expect(el.querySelector('section')).toBeNull()
      expect(statusSvc.resolveStates).not.toHaveBeenCalled()
    })

    it.each([
      ['before the event start date', { startDate: '17-11-2099', endDate: '28-11-2099' }],
      ['after the event end date', { startDate: '01-01-2000', endDate: '02-01-2000' }],
    ])('still shown %s (dates only drive labels)', (_name, window) => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [milestone(1)] }, window)
      expect(cards().length).toBe(1)
      expect(statusSvc.resolveStates).toHaveBeenCalled()
    })

    it('availableFrom: only lockUntilEventStart items, only before eventDetails.startDate', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted', 'notStarted', 'notStarted']))
      const items = [milestone(1), milestone(2, { lockUntilEventStart: true }), milestone(3, { lockUntilEventStart: true }), milestone(4)]
      render({ items }, { startDate: '17-11-2026', endDate: '28-11-2026' })
      component.now.set(new Date(2026, 10, 5).getTime())
      fixture.detectChanges()
      expect(component.availableFrom()).toEqual([null, 'Available from 17th Nov', 'Available from 17th Nov', null])
      component.now.set(new Date(2026, 10, 17).getTime())
      expect(component.availableFrom()).toEqual([null, null, null, null])
    })

    it('passes the "Available from" text to each waiting card', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted', 'notStarted', 'notStarted']))
      const items = [milestone(1), milestone(2, { lockUntilEventStart: true }), milestone(3, { lockUntilEventStart: true }), milestone(4)]
      render({ items }, { startDate: '17-11-2026', endDate: '28-11-2026' })
      component.now.set(new Date(2026, 10, 5).getTime())
      fixture.detectChanges()
      expect(cards().map(card => card.availableFrom)).toEqual([null, 'Available from 17th Nov', 'Available from 17th Nov', null])
    })

    it('availableFrom: an event shows its own start date and time until it begins', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      const event = milestone(2, {
        type: 'event', openBeforeStart: true,
        startDateTime: '2026-11-10T15:15:00+05:30', endDateTime: '2026-11-10T15:30:00+05:30',
      })
      render({ items: [milestone(1), event] })
      component.now.set(new Date('2026-11-10T14:53:00+05:30').getTime())
      const expected = `Available from ${formatOrdinalDateTime(new Date('2026-11-10T15:15:00+05:30'))}`
      expect(component.availableFrom()).toEqual([null, expected])
      expect(expected).toContain('10th Nov')
      component.now.set(new Date('2026-11-10T15:15:00+05:30').getTime())
      expect(component.availableFrom()).toEqual([null, null])
    })

    it('availableFrom: missing or invalid start date locks nothing', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [milestone(1, { lockUntilEventStart: true })] }, { startDate: '<START>', endDate: '' })
      expect(component.availableFrom()).toEqual([null])
    })

    it('sorts by order before resolving and rendering', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'locked', 'locked']))
      render({ items: [milestone(3), milestone(1), milestone(2)] })
      expect(statusSvc.resolveStates.mock.calls[0][0].map((m: any) => m.order)).toEqual([1, 2, 3])
      expect(cards().map(card => card.milestone.order)).toEqual([1, 2, 3])
    })

    it('hides disabled milestones and keeps each card on its own state', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'locked', 'notStarted']))
      render({ items: [milestone(1), milestone(2, { enabled: false }), milestone(3)] })
      expect(cards().map(card => [card.milestone.order, card.state])).toEqual([[1, 'completed'], [3, 'notStarted']])
    })
  })

  describe('status (guide §7 stages 2, 4)', () => {
    it('shows skeletons until states resolve, then maps states by position', () => {
      const states$ = new Subject<NsCampaignMilestone.TMilestoneState[]>()
      statusSvc.resolveStates.mockReturnValue(states$)
      render({ items: [milestone(1), milestone(2)] })
      expect(cards().map(card => card.isLoading)).toEqual([true, true])

      states$.next(['completed', 'notStarted'])
      fixture.detectChanges()
      expect(cards().map(card => card.isLoading)).toEqual([false, false])
      expect(cards().map(card => card.state)).toEqual(['completed', 'notStarted'])
      expect(component.stateAt(5)).toBe('locked')
    })

    it('shows the journey-complete banner only when every milestone is completed', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      render({ items: [milestone(1), milestone(2)] })
      expect(el.querySelector('.cm-milestones__complete')?.textContent).toContain('Journey complete!')
    })

    it('disabled milestones do not hold back the journey-complete banner', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'locked']))
      render({ items: [milestone(1), milestone(2, { enabled: false })] })
      expect(el.querySelector('.cm-milestones__complete')).toBeTruthy()
    })

    it('a config-locked milestone holds back the journey-complete banner', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'locked']))
      render({ items: [milestone(1), milestone(2, { locked: true })] })
      expect(el.querySelector('.cm-milestones__complete')).toBeNull()
    })

    it('no journey-complete banner while any milestone is open', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render({ items: [milestone(1), milestone(2)] })
      expect(el.querySelector('.cm-milestones__complete')).toBeNull()
    })
  })

  describe('assessment start: enroll then play (guide §7 stage 7)', () => {
    const PLAYER: NsCampaignMicrosite.IMilestonePlayerRoute = {
      path: '/viewer/practice/{resourceId}',
      resourceId: 'do_qs',
      queryParams: {
        primaryCategory: 'Course Assessment',
        collectionId: '{identifier}',
        batchId: '{batchId}',
        courseName: '{name}',
        ML: '{language}',
        fromAITutor: 'false',
      },
    }
    const assessment = (overrides: Partial<NsCampaignMicrosite.IMilestone> = {}) =>
      milestone(1, { batchId: '', language: 'hindi', player: PLAYER, ...overrides })
    const flush = () => new Promise(resolve => setTimeout(resolve))

    beforeEach(() => render({ items: [assessment()] }))

    it('not enrolled → calls auto-enrollment once, then opens the player with the enrolled batch', async () => {
      statusSvc.enrollAssessment.mockResolvedValue('b_enrolled')
      component.openMilestone(assessment())
      component.openMilestone(assessment()) // double click while enrolling
      expect(component.enrollingOrder()).toBe(1)
      await flush()

      expect(statusSvc.enrollAssessment).toHaveBeenCalledTimes(1)
      expect(statusSvc.enrollAssessment).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'do_1', language: 'hindi' }))
      expect(router.navigate).toHaveBeenCalledTimes(1)
      expect(router.navigate).toHaveBeenCalledWith(['/', 'viewer', 'practice', 'do_qs'], {
        queryParams: {
          primaryCategory: 'Course Assessment',
          collectionId: 'do_1',
          batchId: 'b_enrolled',
          courseName: 'Milestone name 1',
          ML: 'hindi',
          fromAITutor: 'false',
          redirectUrl: '/app/microsites/campaign/kalp?tab=1',
        },
      })
      expect(component.enrollingOrder()).toBeNull()
    })

    it('already enrolled → skips auto-enrollment and opens the player directly', async () => {
      statusSvc.enrolledBatchId.mockReturnValue('b_existing')
      component.openMilestone(assessment())
      await flush()
      expect(statusSvc.enrollAssessment).not.toHaveBeenCalled()
      expect(router.navigate.mock.calls[0][1].queryParams.batchId).toBe('b_existing')
    })

    it('enrollment failure → shows an error, stays on the page and re-enables the button', async () => {
      statusSvc.enrollAssessment.mockRejectedValue({ error: { params: { errmsg: 'Batch full' } } })
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      component.openMilestone(assessment())
      await flush()
      expect(router.navigate).not.toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith('Batch full', 'X', { duration: 5000 })
      expect(component.enrollingOrder()).toBeNull()
    })

    it('placeholder resourceId → falls back to the course overview', () => {
      component.openMilestone(assessment({ player: { ...PLAYER, resourceId: '<QUESTION_SET_ID>' } }))
      expect(statusSvc.enrollAssessment).not.toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(['/app/toc', 'do_1', 'overview'], { queryParams: {} })
    })

    it('buildPlayerRoute drops query params whose token resolves empty', () => {
      expect(buildPlayerRoute(assessment(), undefined)?.queryParams.batchId).toBeUndefined()
    })
  })

  describe('event: phase, button and register-then-play', () => {
    const START = '2026-11-17T10:00:00+05:30'
    const END = '2026-11-17T12:30:00+05:30'
    const at = (iso: string) => new Date(iso).getTime()
    const PLAYER: NsCampaignMicrosite.IMilestonePlayerRoute = {
      path: '/app/event-hub/player/{identifier}/youtube/{resourceId}',
      resourceId: 'vid_1',
      queryParams: { isEnrolled: 'true' },
    }
    const event = (overrides: Partial<NsCampaignMicrosite.IMilestone> = {}) =>
      milestone(2, { type: 'event', identifier: 'do_event', batchId: 'b_event', startDateTime: START, endDateTime: END, player: PLAYER, ...overrides })
    const flush = () => new Promise(resolve => setTimeout(resolve))
    const L = DEFAULT_MILESTONE_LABELS.event

    it.each([
      ['before start', '2026-11-17T09:59:00+05:30', 'upcoming'],
      ['at start', START, 'live'],
      ['during', '2026-11-17T11:00:00+05:30', 'live'],
      ['at end', END, 'ended'],
      ['after end', '2026-11-18T00:00:00+05:30', 'ended'],
    ])('phase %s', (_name, now, phase) => {
      expect(eventPhase(event(), at(now))).toBe(phase)
    })

    it('missing or invalid times never block the event', () => {
      expect(eventPhase(event({ startDateTime: undefined, endDateTime: undefined }), at(START))).toBe('live')
      expect(eventPhase(event({ startDateTime: 'not a date', endDateTime: '<END>' }), at(START))).toBe('live')
    })

    describe('withEndedEvents', () => {
      const AFTER = at('2026-11-18T00:00:00+05:30')

      it('an ended event stays in progress until its progress marks it completed', () => {
        expect(withEndedEvents(['inProgress'], [event()], AFTER)).toEqual(['inProgress'])
      })

      it('a registered event is not "in progress" before it starts, and is from the start time', () => {
        expect(withEndedEvents(['inProgress'], [event()], at('2026-11-17T09:59:00+05:30'))).toEqual(['notStarted'])
        expect(withEndedEvents(['inProgress'], [event()], at(START))).toEqual(['inProgress'])
      })

      it.each([
        ['while it runs', 'inProgress', event(), at('2026-11-17T11:00:00+05:30')],
        ['an assessment before the event start', 'inProgress', milestone(1, { startDateTime: END }), at('2026-11-17T09:59:00+05:30')],
        ['registered but never joined', 'notStarted', event(), AFTER],
        ['an assessment', 'inProgress', milestone(1, { endDateTime: END }), AFTER],
        ['an event without an end time', 'inProgress', event({ endDateTime: undefined }), AFTER],
      ] as const)('leaves the state alone for %s', (_name, state, item, now) => {
        expect(withEndedEvents([state], [item as NsCampaignMicrosite.IMilestone], now)).toEqual([state])
      })

      it('keeps null (still loading)', () => {
        expect(withEndedEvents(null, [event()], AFTER)).toBeNull()
      })

      it.each([
        ['before the start', '2026-11-17T09:59:00+05:30', 'inProgress'],
        ['while it runs', '2026-11-17T11:00:00+05:30', 'inProgress'],
        ['one minute before the end', '2026-11-17T12:29:00+05:30', 'inProgress'],
        ['at the end', END, 'completed'],
        ['after the end', '2026-11-18T00:00:00+05:30', 'completed'],
      ])('a completed (status 2) event shows completed only once its end time has passed: %s', (_name, now, expected) => {
        expect(withEndedEvents(['completed'], [event()], at(now))).toEqual([expected])
      })

      it.each([
        ['before the start (openBeforeStart)', '2026-11-16T20:00:00+05:30', 'inProgress'],
        ['during the event', '2026-11-17T14:00:00+05:30', 'inProgress'],
        ['one minute before the end', '2026-11-17T18:29:00+05:30', 'inProgress'],
        ['at the end', '2026-11-17T18:30:00+05:30', 'completed'],
        ['the next day', '2026-11-18T09:00:00+05:30', 'completed'],
      ])('prod "Leadership lessons for Viksit Bharat 2047" event with status 2: %s → %s', (_name, now, expected) => {
        const prodEvent = milestone(2, {
          type: 'event', identifier: 'do_11469917729384038415', batchId: '01469918406804275256', openBeforeStart: true,
          startDateTime: '2026-11-17T09:00:00+05:30', endDateTime: '2026-11-17T18:30:00+05:30',
        })
        expect(withEndedEvents(['completed'], [prodEvent], at(now))).toEqual([expected])
      })

      it('a completed event without a valid end time stays completed', () => {
        const during = at('2026-11-17T11:00:00+05:30')
        expect(withEndedEvents(['completed'], [event({ endDateTime: undefined })], during)).toEqual(['completed'])
        expect(withEndedEvents(['completed'], [event({ endDateTime: '<END>' })], during)).toEqual(['completed'])
      })

      it('only events wait for the end time: a completed assessment / pledge stays completed', () => {
        const during = at('2026-11-17T11:00:00+05:30')
        expect(withEndedEvents(['completed'], [milestone(1, { endDateTime: END })], during)).toEqual(['completed'])
        expect(withEndedEvents(['completed'], [milestone(3, { type: 'survey', endDateTime: END })], during)).toEqual(['completed'])
      })
    })

    it('card shows a workshop completed (status 2) during the event as in progress until it ends; the button is unchanged', () => {
      component.now.set(at('2026-11-17T11:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      render({ items: [milestone(1), event()] })
      expect(cards().map(card => card.state)).toEqual(['completed', 'inProgress'])
      expect(component.ctas()[1]).toEqual({ label: L.recording, disabled: false })
      expect(component.isJourneyComplete()).toBe(false)

      component.now.set(at(END))
      fixture.detectChanges()
      expect(cards().map(card => card.state)).toEqual(['completed', 'completed'])
      expect(component.ctas()[1]).toEqual({ label: L.recording, disabled: false })
      expect(component.isJourneyComplete()).toBe(true)
    })

    it('card keeps an ended workshop in progress until its progress is complete', () => {
      component.now.set(at('2026-11-18T00:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'inProgress']))
      render({ items: [milestone(1), event()] })
      expect(cards().map(card => card.state)).toEqual(['completed', 'inProgress'])
    })

    it.each([
      ['upcoming', false, L.register, false],
      ['live', false, L.register, false],
      ['upcoming', true, L.upcoming, true],
      ['live', true, L.join, false],
      ['ended', false, L.register, false],
      ['ended', true, L.recording, false],
    ] as const)('%s, enrolled=%s → %s', (phase, enrolled, label, disabled) => {
      expect(eventCta(phase, enrolled, L)).toEqual({ label, disabled })
    })

    it('openBeforeStart keeps "Event yet to start" active before the start', () => {
      expect(eventCta('upcoming', true, L, true)).toEqual({ label: L.upcoming, disabled: false })
      expect(eventCta('upcoming', false, L, true)).toEqual({ label: L.register, disabled: false })
    })

    it.each(['upcoming', 'live', 'ended'] as const)('a completed event offers the recording when %s', phase => {
      expect(eventCta(phase, true, L, false, true)).toEqual({ label: L.recording, disabled: false })
    })

    it('card: completed before the start date shows View recording, not "Event yet to start" (in progress until the end)', () => {
      component.now.set(at('2026-11-09T12:00:00+05:30'))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      statusSvc.resolveStates.mockReturnValue(of(['completed']))
      render({ items: [event({ openBeforeStart: true })] })
      expect([cards()[0].state, cards()[0].ctaLabel, cards()[0].ctaDisabled]).toEqual(['inProgress', L.recording, false])
    })

    it('binds the event button to the card; locked events keep the default', () => {
      component.now.set(at('2026-11-17T11:00:00+05:30'))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted', 'locked']))
      render({ items: [milestone(1), event(), milestone(3, { type: 'event' })] })
      expect(cards().map(card => [card.ctaLabel, card.ctaDisabled])).toEqual([['View Questionnaire', true], [L.join, false], [null, false]])
    })

    it('the button follows the clock: yet to start → Join event', () => {
      component.now.set(at('2026-11-17T09:59:00+05:30'))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [event()] })
      expect([cards()[0].ctaLabel, cards()[0].ctaDisabled]).toEqual([L.upcoming, true])
      component.now.set(at(START))
      fixture.detectChanges()
      expect([cards()[0].ctaLabel, cards()[0].ctaDisabled]).toEqual([L.join, false])
    })

    it('uses event labels from the page config', () => {
      component.now.set(at('2026-11-17T09:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [event()], labels: { event: { register: 'Sign up' } } })
      expect(cards()[0].ctaLabel).toBe('Sign up')
    })

    describe('click', () => {
      beforeEach(() => render({ items: [event()] }))
      afterEach(() => jest.restoreAllMocks())

      it('not registered, event live → registers once, refreshes states and opens the player', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-17T11:00:00+05:30'))
        statusSvc.enrollEvent.mockResolvedValue(undefined)
        const calls = statusSvc.resolveStates.mock.calls.length
        component.openMilestone(event())
        component.openMilestone(event()) // double click while registering
        await flush()
        fixture.detectChanges()
        expect(statusSvc.enrollEvent).toHaveBeenCalledTimes(1)
        expect(statusSvc.resolveStates.mock.calls.length).toBeGreaterThan(calls)
        expect(router.navigate).toHaveBeenCalledWith(['/', 'app', 'event-hub', 'player', 'do_event', 'youtube', 'vid_1'], {
          queryParams: { isEnrolled: 'true', redirectUrl: '/app/microsites/campaign/kalp?tab=1' },
        })
      })

      it('not registered, event upcoming → registers and stays with a confirmation', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-16T10:00:00+05:30'))
        statusSvc.enrollEvent.mockResolvedValue(undefined)
        component.openMilestone(event())
        await flush()
        expect(statusSvc.enrollEvent).toHaveBeenCalledTimes(1)
        expect(router.navigate).not.toHaveBeenCalled()
        expect(snackBar.open).toHaveBeenCalledWith(L.registered, 'X', { duration: 5000 })
      })

      it('registered, event upcoming → does nothing', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-16T10:00:00+05:30'))
        statusSvc.isEventEnrolled.mockReturnValue(true)
        component.openMilestone(event())
        await flush()
        expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
        expect(router.navigate).not.toHaveBeenCalled()
      })

      it('registered, event upcoming, openBeforeStart → opens the player before the start', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-16T10:00:00+05:30'))
        statusSvc.isEventEnrolled.mockReturnValue(true)
        component.openMilestone(event({ openBeforeStart: true }))
        await flush()
        expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/', 'app', 'event-hub', 'player', 'do_event', 'youtube', 'vid_1'], {
          queryParams: { isEnrolled: 'true', redirectUrl: '/app/microsites/campaign/kalp?tab=1' },
        })
      })

      it('not registered, event upcoming, openBeforeStart → registers, then opens the player', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-16T10:00:00+05:30'))
        statusSvc.enrollEvent.mockResolvedValue(undefined)
        component.openMilestone(event({ openBeforeStart: true }))
        await flush()
        expect(statusSvc.enrollEvent).toHaveBeenCalledTimes(1)
        expect(snackBar.open).not.toHaveBeenCalledWith(L.registered, 'X', { duration: 5000 })
        expect(router.navigate).toHaveBeenCalled()
      })

      it('not registered, event ended → shows Register, registers, then opens the recording', async () => {
        component.now.set(at('2026-11-20T10:00:00+05:30'))
        statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
        render({ items: [event()] })
        expect([cards()[0].ctaLabel, cards()[0].ctaDisabled]).toEqual([L.register, false])

        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-20T10:00:00+05:30'))
        statusSvc.enrollEvent.mockResolvedValue(undefined)
        component.openMilestone(event())
        await flush()
        expect(statusSvc.enrollEvent).toHaveBeenCalledTimes(1)
        expect(router.navigate.mock.calls[0][0]).toEqual(['/', 'app', 'event-hub', 'player', 'do_event', 'youtube', 'vid_1'])
      })

      it('registered, event ended → opens the recording without registering again', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-20T10:00:00+05:30'))
        statusSvc.isEventEnrolled.mockReturnValue(true)
        component.openMilestone(event())
        await flush()
        expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
        expect(router.navigate.mock.calls[0][0]).toEqual(['/', 'app', 'event-hub', 'player', 'do_event', 'youtube', 'vid_1'])
      })

      it('registration failure → shows the API message and stays', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-17T11:00:00+05:30'))
        jest.spyOn(console, 'error').mockImplementation(() => undefined)
        statusSvc.enrollEvent.mockRejectedValue({ error: { params: { errmsg: 'Batch closed' } } })
        component.openMilestone(event())
        await flush()
        expect(router.navigate).not.toHaveBeenCalled()
        expect(snackBar.open).toHaveBeenCalledWith('Batch closed', 'X', { duration: 5000 })
        expect(component.enrollingOrder()).toBeNull()
      })

      it('no player configured → falls back to the event hub page', () => {
        component.openMilestone(event({ player: undefined }))
        expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/app/event-hub/home', 'do_event'], { queryParams: { batchId: 'b_event' } })
      })
    })
  })

  describe('routing (guide §7 stage 6)', () => {
    beforeEach(() => render({ items: [milestone(1)] }))

    it('assessment → course overview with batchId', () => {
      component.openMilestone(milestone(1))
      expect(router.navigate).toHaveBeenCalledWith(['/app/toc', 'do_1', 'overview'], { queryParams: { batchId: 'b_1' } })
    })

    it('omits a placeholder batchId', () => {
      component.openMilestone(milestone(4, { batchId: '<POST_ASSESSMENT_BATCH_ID>' }))
      expect(router.navigate).toHaveBeenCalledWith(['/app/toc', 'do_4', 'overview'], { queryParams: {} })
    })

    it('event → event hub with batchId', () => {
      component.openMilestone(milestone(2, { type: 'event', identifier: 'do_event', batchId: 'b_event' }))
      expect(router.navigate).toHaveBeenCalledWith(['/app/event-hub/home', 'do_event'], { queryParams: { batchId: 'b_event' } })
    })

    it('redirectUrl wins over the default route', () => {
      component.openMilestone(milestone(3, { type: 'survey', redirectUrl: '/surveys/1766408457687' }))
      expect(router.navigateByUrl).toHaveBeenCalledWith('/surveys/1766408457687')
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('survey with a placeholder redirectUrl does not navigate', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
      component.openMilestone(milestone(3, { type: 'survey', identifier: undefined, redirectUrl: '<SURVEY_FORM_ROUTE>' }))
      expect(router.navigate).not.toHaveBeenCalled()
      expect(router.navigateByUrl).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalled()
    })
  })

  describe('survey dialog', () => {
    const survey = milestone(2, { type: 'survey', identifier: undefined, formId: '1784131937108', redirectUrl: '' })

    it('opens the survey dialog for the formId instead of navigating', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render({ items: [milestone(1), survey] })
      component.openMilestone(survey)
      expect(dialog.open).toHaveBeenCalledWith(CampaignSurveyDialogComponent, expect.objectContaining({ data: { milestone: survey, labels: component.labels() } }))
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('re-resolves states after a submit, not after "Cancel"', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render({ items: [milestone(1), survey] })
      component.openMilestone(survey)
      dialogResult.next(false)
      fixture.detectChanges()
      expect(statusSvc.resolveStates).toHaveBeenCalledTimes(1)

      component.openMilestone(survey)
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      dialogResult.next(true)
      fixture.detectChanges()
      expect(statusSvc.resolveStates).toHaveBeenCalledTimes(2)
      expect(component.stateAt(1)).toBe('completed')
    })

    it('a completed survey is not opened again', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      render({ items: [milestone(1), survey] })
      component.openMilestone(survey)
      expect(dialog.open).not.toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith('You have already submitted this form.', 'X', { duration: 5000 })
    })

    it('redirectUrl still wins over the dialog', () => {
      render({ items: [survey] })
      component.openMilestone({ ...survey, redirectUrl: '/surveys/1784131937108' })
      expect(router.navigateByUrl).toHaveBeenCalledWith('/surveys/1784131937108')
      expect(dialog.open).not.toHaveBeenCalled()
    })
  })

  describe('pledge backed by an event', () => {
    const pledge = milestone(2, {
      type: 'survey', formId: '1793801265024', identifier: 'do_pledge_event', batchId: 'b_pledge', redirectUrl: '',
    })
    const flush = () => new Promise(resolve => setTimeout(resolve))
    const S = DEFAULT_MILESTONE_LABELS.survey

    it('not registered → registers for the event, then opens the form', async () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      statusSvc.enrollEvent.mockResolvedValue(undefined)
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      expect(component.enrollingOrder()).toBe(2)
      await flush()
      expect(statusSvc.enrollEvent).toHaveBeenCalledWith(pledge)
      expect(dialog.open).toHaveBeenCalledWith(CampaignSurveyDialogComponent, expect.anything())
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('already registered → opens the form without registering again', async () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
      expect(dialog.open).toHaveBeenCalledTimes(1)
    })

    it('registration failure → message, no form', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      statusSvc.enrollEvent.mockRejectedValue({ error: { params: { errmsg: 'Batch closed' } } })
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      expect(dialog.open).not.toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith('Batch closed', 'X', { duration: 5000 })
      expect(component.enrollingOrder()).toBeNull()
    })

    it('after submit → marks the event complete, then re-reads statuses; Cancel does neither', async () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      statusSvc.completeEvent.mockResolvedValue(undefined)
      render({ items: [milestone(1), pledge] })

      component.openMilestone(pledge)
      await flush()
      dialogResult.next(false)
      await flush()
      expect(statusSvc.completeEvent).not.toHaveBeenCalled()
      expect(statusSvc.resolveStates).toHaveBeenCalledTimes(1)

      component.openMilestone(pledge)
      await flush()
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      dialogResult.next(true)
      await flush()
      fixture.detectChanges()
      expect(statusSvc.completeEvent).toHaveBeenCalledWith(pledge)
      expect(statusSvc.resolveStates).toHaveBeenCalledTimes(2)
      expect(component.stateAt(1)).toBe('completed')
    })

    it('progress update failure still re-reads statuses', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      statusSvc.completeEvent.mockRejectedValue(new Error('500'))
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      dialogResult.next(true)
      await flush()
      fixture.detectChanges()
      expect(statusSvc.resolveStates).toHaveBeenCalledTimes(2)
    })

    it('completed → card button is "Download certificate"; a completed plain pledge keeps the default', () => {
      const plain = milestone(3, { type: 'survey', formId: 'f', identifier: undefined })
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed', 'completed']))
      render({ items: [milestone(1), pledge, plain] })
      expect(cards().map(card => card.ctaLabel)).toEqual(['View Questionnaire', S.downloadCertificate, null])
    })

    it('not completed → "Take Sankalpa" from the page config', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'inProgress']))
      render({ items: [milestone(1), pledge], labels: { survey: { start: 'Take the pledge' } } })
      expect(cards()[1].ctaLabel).toBe('Take the pledge')
    })

    it('completed with a certificate → opens the certificate dialog', async () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      statusSvc.issuedCertificateId.mockReturnValue('cert_1')
      statusSvc.fetchCertificate.mockResolvedValue('data:image/svg+xml,<svg/>')
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      expect(statusSvc.fetchCertificate).toHaveBeenCalledWith('cert_1')
      expect(dialog.open).toHaveBeenCalledWith(CertificateDialogComponent, {
        width: '1200px', data: { cet: 'data:image/svg+xml,<svg/>', certId: 'cert_1' },
      })
      expect(statusSvc.enrollEvent).not.toHaveBeenCalled()
    })

    it('completed without a certificate → "be patient" message', async () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      expect(dialog.open).not.toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith(S.certificatePending, 'X', { duration: 10000 })
    })

    it('certificate download failure → error message', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      statusSvc.issuedCertificateId.mockReturnValue('cert_1')
      statusSvc.fetchCertificate.mockRejectedValue(new Error('404'))
      render({ items: [milestone(1), pledge] })
      component.openMilestone(pledge)
      await flush()
      expect(snackBar.open).toHaveBeenCalledWith(S.certificateError, 'X', { duration: 5000 })
      expect(component.enrollingOrder()).toBeNull()
    })
  })

  describe('journey popup', () => {
    const popup = () => el.querySelector('ws-app-milestone-popup') as any
    const withPopup = { popup: { enabled: true }, items: [milestone(1), milestone(2)] }

    beforeEach(() => localStorage.clear())

    it('opens once states resolve, with the sorted milestones and their states', () => {
      const states$ = new Subject<NsCampaignMilestone.TMilestoneState[]>()
      statusSvc.resolveStates.mockReturnValue(states$)
      render({ ...withPopup, items: [milestone(2), milestone(1)] })
      expect(popup()).toBeNull()

      states$.next(['completed', 'notStarted'])
      fixture.detectChanges()
      expect(popup().milestones.map((m: any) => m.order)).toEqual([1, 2])
      expect(popup().states).toEqual(['completed', 'notStarted'])
    })

    it('stays closed when not enabled in config', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'locked']))
      render({ items: [milestone(1), milestone(2)] })
      expect(popup()).toBeNull()
    })

    it('stays closed once the journey is complete', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      render(withPopup)
      expect(popup()).toBeNull()
    })

    it('closes and is remembered for this user', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render(withPopup)
      component.closePopup()
      fixture.detectChanges()
      expect(popup()).toBeNull()
      expect(localStorage.getItem(milestonePopupSeenKey('u1'))).toBe('true')
    })

    it('is not shown again once seen, even after the user moves on to the next milestone', () => {
      localStorage.setItem(milestonePopupSeenKey('u1'), 'true')
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render(withPopup)
      expect(popup()).toBeNull()
    })

    it('another user on the same browser still sees it', () => {
      localStorage.setItem(milestonePopupSeenKey('someone-else'), 'true')
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render(withPopup)
      expect(popup()).not.toBeNull()
    })

    it('stays closed when no milestone is open', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'locked']))
      render(withPopup)
      expect(popup()).toBeNull()
    })
  })

  describe('assessment button', () => {
    it('Start / Resume / View by state, text from the page config', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'inProgress', 'completed']))
      render({
        items: [milestone(1), milestone(2), milestone(3)],
        labels: { assessment: { resume: 'Continue' } },
      })
      expect(cards().map(card => card.ctaLabel)).toEqual(['Start Questionnaire', 'Continue', 'View Questionnaire'])
    })
  })

  describe('completed indicator, unlock time and certificate button', () => {
    const at = (iso: string) => new Date(iso).getTime()

    it('only a completed assessment gets the green "Completed"; event and pledge keep their buttons', () => {
      component.now.set(at('2026-11-20T10:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed', 'completed']))
      statusSvc.issuedCertificateId.mockReturnValue('cert_1')
      statusSvc.isEventEnrolled.mockReturnValue(true)
      render({ items: [
        milestone(1),
        milestone(2, { type: 'event', startDateTime: '2026-11-17T10:00:00+05:30', endDateTime: '2026-11-17T12:00:00+05:30' }),
        milestone(3, { type: 'survey', formId: 'f', identifier: 'do_p', batchId: 'b_p' }),
      ] })
      expect(cards().map(card => card.completedLabel)).toEqual(['Completed', null, null])
      expect(cards()[1].ctaLabel).toBe(DEFAULT_MILESTONE_LABELS.event.recording)
    })

    it('an ended event the user never registered for still offers Register', () => {
      component.now.set(at('2026-11-20T10:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [milestone(2, { type: 'event', startDateTime: '2026-11-17T10:00:00+05:30', endDateTime: '2026-11-17T12:00:00+05:30' })] })
      expect(cards()[0].state).toBe('notStarted')
      expect([cards()[0].ctaLabel, cards()[0].completedLabel]).toEqual([DEFAULT_MILESTONE_LABELS.event.register, null])
    })

    // wall-clock times without an offset: the label shows the viewer's local time, so this passes in any time zone (CI runs in UTC)
    it('assessment before its startDateTime: "Available from" with time, button disabled, click ignored; opens once the time passes', () => {
      const endline = milestone(3, { startDateTime: '2026-11-17T10:00:00' })
      component.now.set(at('2026-11-17T09:00:00'))
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [endline] }, undefined)
      expect(cards()[0].availableFrom).toBe('Available from 17th Nov, 10:00 AM')
      expect(cards()[0].ctaDisabled).toBe(true)

      jest.spyOn(Date, 'now').mockReturnValue(at('2026-11-17T09:00:00'))
      component.openMilestone(endline)
      expect(statusSvc.enrollAssessment).not.toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
      jest.restoreAllMocks()

      component.now.set(at('2026-11-17T10:00:00'))
      fixture.detectChanges()
      expect(cards()[0].availableFrom).toBeNull()
      expect(cards()[0].ctaDisabled).toBe(false)
    })

    it('completed assessment does not open again unless openWhenCompleted is true', () => {
      const closed = milestone(1, { player: { path: '/viewer/practice/{resourceId}', resourceId: 'do_qs' } })
      const reopenable = milestone(2, { openWhenCompleted: true, player: { path: '/viewer/practice/{resourceId}', resourceId: 'do_qs2' } })
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'completed']))
      statusSvc.enrolledBatchId.mockReturnValue('b_1')
      render({ items: [closed, reopenable] })
      expect(cards().map(card => card.ctaDisabled)).toEqual([true, false])

      component.openMilestone(closed)
      expect(router.navigate).not.toHaveBeenCalled()
      component.openMilestone(reopenable)
      return new Promise(resolve => setTimeout(resolve)).then(() => {
        expect(router.navigate.mock.calls[0][0]).toEqual(['/', 'viewer', 'practice', 'do_qs2'])
      })
    })

    it('startDateTime wins over lockUntilEventStart: once it passes, no "Available from" for the event date', () => {
      const endline = milestone(3, { lockUntilEventStart: true, startDateTime: '2026-11-05T19:10:00' })
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      component.now.set(at('2026-11-05T19:00:00'))
      render({ items: [endline] }, { startDate: '17-11-2026', endDate: '28-11-2026' })
      expect([cards()[0].availableFrom, cards()[0].ctaDisabled]).toEqual(['Available from 5th Nov, 7:10 PM', true])

      component.now.set(at('2026-11-05T19:10:00'))
      fixture.detectChanges()
      expect([cards()[0].availableFrom, cards()[0].ctaDisabled]).toEqual([null, false])
    })

    it('lockUntilEventStart assessment without startDateTime: locked until eventDetails.startDate; an event is not locked', () => {
      const endline = milestone(3, { lockUntilEventStart: true })
      const liveEvent = milestone(2, { type: 'event', lockUntilEventStart: true })
      component.now.set(new Date(2026, 10, 16, 23, 0).getTime())
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'notStarted']))
      render({ items: [liveEvent, endline] }, { startDate: '17-11-2026', endDate: '28-11-2026' })
      expect(cards().map(card => card.availableFrom)).toEqual(['Available from 17th Nov', 'Available from 17th Nov'])
      expect(cards().map(card => card.ctaDisabled)).toEqual([false, true])

      jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 10, 16, 23, 0).getTime())
      component.openMilestone(endline)
      expect(statusSvc.enrollAssessment).not.toHaveBeenCalled()
      jest.restoreAllMocks()

      component.now.set(new Date(2026, 10, 17, 0, 0).getTime())
      fixture.detectChanges()
      expect(cards()[1].ctaDisabled).toBe(false)
    })

    it.each([
      [5 * 86_400_000 + 12 * 3_600_000 + 59_000, '5D 12H'],
      [12 * 3_600_000 + 30 * 60_000 + 20_000, '12H 30M 20S'],
      [5 * 60_000 + 3_000, '5M 3S'],
      [400, '1S'],
    ])('formatCountdown(%d) → %s', (ms, text) => {
      expect(formatCountdown(ms)).toBe(text)
    })

    it('showCountdown: the disabled button counts down to the unlock time, then turns into Start', () => {
      const endline = milestone(3, { startDateTime: '2026-11-17T10:00:00+05:30', showCountdown: true })
      const quiet = milestone(4, { startDateTime: '2026-11-17T10:00:00+05:30' })
      component.now.set(at('2026-11-12T08:00:00+05:30'))
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'notStarted']))
      render({ items: [endline, quiet] }, undefined)
      expect(cards().map(card => [card.ctaLabel, card.ctaDisabled]))
        .toEqual([['Opens in 5D 2H', true], ['Start Questionnaire', true]])

      component.now.set(at('2026-11-16T21:29:40+05:30'))
      fixture.detectChanges()
      expect(cards()[0].ctaLabel).toBe('Opens in 12H 30M 20S')

      component.now.set(at('2026-11-17T10:00:00+05:30'))
      fixture.detectChanges()
      expect([cards()[0].ctaLabel, cards()[0].ctaDisabled]).toEqual(['Start Questionnaire', false])
    })

    describe('clock cost', () => {
      const endline = milestone(3, { startDateTime: '2026-11-17T10:00:00+05:30', showCountdown: true })

      it('1s ticks only in the last day before a countdown unlocks; never without a countdown', () => {
        statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
        component.now.set(at('2026-11-12T10:00:00+05:30'))
        render({ items: [endline] }, undefined)
        expect(component.needsSecondTicks()).toBe(false)
        component.now.set(at('2026-11-16T10:00:01+05:30'))
        expect(component.needsSecondTicks()).toBe(true)
        component.now.set(at('2026-11-17T10:00:00+05:30'))
        expect(component.needsSecondTicks()).toBe(false)
      })

      it('unchanged results keep their reference across ticks, so cards and popup are not re-rendered', () => {
        statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'notStarted']))
        component.now.set(at('2026-11-12T10:00:00+05:30'))
        render({ items: [milestone(1), milestone(2, { lockUntilEventStart: true })] }, { startDate: '17-11-2026', endDate: '' })
        const ctas = component.ctas()
        const availableFrom = component.availableFrom()
        component.now.set(at('2026-11-12T10:00:30+05:30'))
        expect(component.ctas()).toBe(ctas)
        expect(component.availableFrom()).toBe(availableFrom)
      })

      it('cards get the time rounded to the minute', () => {
        component.now.set(at('2026-11-12T10:00:45+05:30'))
        expect(component.cardNow()).toBe(at('2026-11-12T10:00:00+05:30'))
      })
    })

    it('leaving the page clears the clock interval', () => {
      const clear = jest.spyOn(globalThis, 'clearInterval')
      try {
        fixture.destroy()
        expect(clear).toHaveBeenCalled()
      } finally {
        clear.mockRestore()
      }
    })

    it('completed pledge without a certificate: Download certificate stays clickable, with the "be patient" tooltip', () => {
      const pledge = milestone(1, { type: 'survey', formId: 'f', identifier: 'do_p', batchId: 'b_p' })
      statusSvc.resolveStates.mockReturnValue(of(['completed']))
      render({ items: [pledge] })
      expect([cards()[0].ctaLabel, cards()[0].ctaDisabled, cards()[0].ctaTooltip])
        .toEqual(['Download certificate', false, DEFAULT_MILESTONE_LABELS.survey.certificatePending])

      statusSvc.issuedCertificateId.mockReturnValue('cert_1')
      component.now.set(Date.now() + 1)
      fixture.detectChanges()
      expect([cards()[0].ctaDisabled, cards()[0].ctaTooltip]).toEqual([false, null])
    })
  })
  describe('pledge opens by itself (autoOpen)', () => {
    const at = (iso: string) => new Date(iso).getTime()
    const window = { enabled: true, startDateTime: '2026-11-05T00:00:00+05:30', endDateTime: '2026-11-28T23:59:59+05:30' }
    const pledge = (overrides: Partial<NsCampaignMicrosite.IMilestone> = {}) =>
      milestone(4, { type: 'survey', formId: 'f_pledge', identifier: undefined, autoOpen: window, ...overrides })
    const surveyOpens = () => dialog.open.mock.calls.filter(([type]) => type === CampaignSurveyDialogComponent).length
    const load = (config: Partial<NsCampaignMicrosite.IProgrammeMilestones>, states: NsCampaignMilestone.TMilestoneState[]) => {
      statusSvc.resolveStates.mockReturnValue(of(states))
      render(config)
      TestBed.tick()
    }

    beforeEach(() => {
      localStorage.clear()
      component.now.set(at('2026-11-10T10:00:00+05:30'))
    })

    it('window check: inside only, start inclusive, end exclusive; off, invalid or not a survey never', () => {
      const p = pledge()
      expect([
        isInAutoOpenWindow(p, at('2026-11-04T23:59:59+05:30')),
        isInAutoOpenWindow(p, at('2026-11-05T00:00:00+05:30')),
        isInAutoOpenWindow(p, at('2026-11-28T23:59:59+05:30')),
        isInAutoOpenWindow(pledge({ autoOpen: { ...window, enabled: false } }), at('2026-11-10T10:00:00+05:30')),
        isInAutoOpenWindow(pledge({ autoOpen: { ...window, endDateTime: 'soon' } }), at('2026-11-10T10:00:00+05:30')),
        isInAutoOpenWindow(milestone(1, { autoOpen: window }), at('2026-11-10T10:00:00+05:30')),
      ]).toEqual([false, true, false, false, false, false])
    })

    it('not submitted and inside the window: the form opens on load, once', () => {
      load({ items: [milestone(1), pledge()] }, ['completed', 'notStarted'])
      expect(surveyOpens()).toBe(1)
      expect(dialog.open.mock.calls[0][1].data.milestone.order).toBe(4)

      // closed without submitting: stays closed until the next page load
      dialogResult.next(false)
      component.now.set(at('2026-11-10T11:00:00+05:30'))
      fixture.detectChanges()
      TestBed.tick()
      expect(surveyOpens()).toBe(1)
    })

    it('waits for the info popup to be closed, then opens the form', () => {
      load({ popup: { enabled: true }, items: [pledge()] }, ['notStarted'])
      expect(component.showPopup()).toBe(true)
      expect(surveyOpens()).toBe(0)

      component.closePopup()
      fixture.detectChanges()
      TestBed.tick()
      expect(surveyOpens()).toBe(1)
    })

    it('opens straight away on a reload once the info popup was seen', () => {
      localStorage.setItem(milestonePopupSeenKey('u1'), 'true')
      load({ popup: { enabled: true }, items: [pledge()] }, ['notStarted'])
      expect(surveyOpens()).toBe(1)
    })

    it.each([
      ['submitted', pledge(), 'completed', '2026-11-10T10:00:00+05:30'],
      ['locked', pledge(), 'locked', '2026-11-10T10:00:00+05:30'],
      ['before the window', pledge(), 'notStarted', '2026-11-04T10:00:00+05:30'],
      ['after the window', pledge(), 'notStarted', '2026-11-29T10:00:00+05:30'],
      ['autoOpen not configured', pledge({ autoOpen: undefined }), 'notStarted', '2026-11-10T10:00:00+05:30'],
    ] as const)('does not open: %s', (_case, item, state, now) => {
      component.now.set(at(now))
      load({ items: [item] }, [state])
      expect(surveyOpens()).toBe(0)
    })

    it('opens when the window starts while the page is open', () => {
      component.now.set(at('2026-11-04T23:59:00+05:30'))
      load({ items: [pledge()] }, ['notStarted'])
      expect(surveyOpens()).toBe(0)

      component.now.set(at('2026-11-05T00:00:00+05:30'))
      fixture.detectChanges()
      TestBed.tick()
      expect(surveyOpens()).toBe(1)
    })

    it('leaves a dialog the user already opened alone', () => {
      dialog.openDialogs = [{}]
      load({ items: [pledge()] }, ['notStarted'])
      expect(surveyOpens()).toBe(0)
    })
  })

  describe('telemetry', () => {
    const at = (iso: string) => new Date(iso).getTime()
    const NOW = at('2026-11-10T10:00:00+05:30')
    const ctx = { now: NOW, isEventEnrolled: false, hasCertificate: false }

    it('names the action a click takes, from state and time rather than the JSON button text', () => {
      const event = milestone(2, { type: 'event', startDateTime: '2026-11-17T10:00:00+05:30', endDateTime: '2026-11-17T12:00:00+05:30' })
      const pledge = milestone(4, { type: 'survey', formId: 'f' })
      expect([
        milestoneAction(milestone(1), 'notStarted', ctx),
        milestoneAction(milestone(1), 'inProgress', ctx),
        milestoneAction(milestone(1), 'completed', ctx),
        milestoneAction(milestone(1, { openWhenCompleted: true }), 'completed', ctx),
        milestoneAction(milestone(3, { startDateTime: '2026-11-17T10:00:00+05:30' }), 'notStarted', ctx),
        milestoneAction(milestone(1), 'locked', ctx),
        milestoneAction(event, 'notStarted', ctx),
        milestoneAction(event, 'notStarted', { ...ctx, isEventEnrolled: true }),
        milestoneAction(event, 'inProgress', { ...ctx, now: at('2026-11-17T11:00:00+05:30'), isEventEnrolled: true }),
        milestoneAction(event, 'completed', { ...ctx, now: at('2026-11-18T10:00:00+05:30'), isEventEnrolled: true }),
        milestoneAction(event, 'completed', { ...ctx, isEventEnrolled: true }),
        milestoneAction(pledge, 'notStarted', ctx),
        milestoneAction(pledge, 'completed', ctx),
        milestoneAction(pledge, 'completed', { ...ctx, hasCertificate: true }),
        milestoneAction(milestone(5, { redirectUrl: '/app/somewhere' }), 'notStarted', ctx),
      ]).toEqual([
        'start', 'resume', 'completed', 'view', 'locked', 'locked',
        'register', 'yet-to-start', 'join', 'recording', 'recording',
        'take-sankalp', 'certificate-pending', 'download-certificate', 'redirect',
      ])
    })

    it('a card click raises one INTERACT named as on mobile, with the content id, even when the click is ignored', () => {
      component.now.set(NOW)
      const locked = milestone(3, { startDateTime: '2026-11-17T10:00:00+05:30' })
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'notStarted']))
      render({ items: [milestone(1), locked] })
      jest.spyOn(Date, 'now').mockReturnValue(NOW)
      component.openMilestone(milestone(1))
      component.openMilestone(locked)
      jest.restoreAllMocks()
      expect(telemetry.click.mock.calls).toEqual([
        ['campaign-microsite-milestone-assessment', 'card-content', { id: 'do_1', type: 'assessment' }],
        ['campaign-microsite-milestone-assessment', 'card-content', { id: 'do_3', type: 'assessment' }],
      ])
    })

    it('info popup: an impression when it shows, a click when it is closed', () => {
      localStorage.clear()
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ popup: { enabled: true }, items: [milestone(1)] })
      TestBed.tick()
      expect(telemetry.impression).toHaveBeenCalledWith('milestone-popup', { id: 'milestone-popup', type: 'popup' })
      component.closePopup()
      expect(telemetry.click).toHaveBeenCalledWith('milestone-popup', 'milestone-popup-close', { id: 'milestone-popup', type: 'popup' })
    })

    it('the Sankalp form records whether it opened by itself or from a click', async () => {
      localStorage.clear()
      component.now.set(NOW)
      const pledge = milestone(4, {
        type: 'survey', formId: 'f_pledge', identifier: undefined,
        autoOpen: { enabled: true, startDateTime: '2026-11-05T00:00:00+05:30', endDateTime: '2026-11-28T23:59:59+05:30' },
      })
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [pledge] })
      TestBed.tick()
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('campaign-microsite-survey-open', undefined, { id: 'f_pledge', type: 'survey' })

      component.openMilestone(pledge)
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('campaign-microsite-survey-open', undefined, { id: 'f_pledge', type: 'survey' })
    })

    it('certificate: pending and download each raise their own INTERACT', async () => {
      const pledge = milestone(4, { type: 'survey', formId: 'f', identifier: 'do_p', batchId: 'b_p' })
      statusSvc.resolveStates.mockReturnValue(of(['completed']))
      statusSvc.isEventEnrolled.mockReturnValue(true)
      render({ items: [pledge] })
      const object = { id: 'do_p', type: 'survey' }

      component.openMilestone(pledge)
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('campaign-microsite-certificate-pending', 'download-certificate', object)
      expect(snackBar.open).toHaveBeenCalledWith(DEFAULT_MILESTONE_LABELS.survey.certificatePending, 'X', { duration: 10000 })

      statusSvc.issuedCertificateId.mockReturnValue('cert_1')
      statusSvc.fetchCertificate.mockResolvedValue('uri')
      component.openMilestone(pledge)
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('campaign-microsite-certificate-download', 'download-certificate', object)
    })

    it('survey open uses the milestone\'s content id when it has one', async () => {
      localStorage.clear()
      const pledge = milestone(4, { type: 'survey', formId: 'f_pledge', identifier: 'do_pledge' })
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      render({ items: [pledge] })
      component.openMilestone(pledge)
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('campaign-microsite-survey-open', undefined, { id: 'do_pledge', type: 'survey' })
    })

    it('registering for an event raises enroll-now with object type Event, only once it succeeds', async () => {
      const event = milestone(2, {
        type: 'event', identifier: 'do_event', batchId: 'b1',
        startDateTime: '2099-11-17T10:00:00+05:30', endDateTime: '2099-11-17T12:00:00+05:30',
        player: { path: '/app/event-hub/player/{identifier}/youtube/{resourceId}', resourceId: 'yt' },
      } as any)
      statusSvc.resolveStates.mockReturnValue(of(['notStarted']))
      statusSvc.isEventEnrolled.mockReturnValue(false)
      statusSvc.enrollEvent.mockResolvedValueOnce(undefined)
      render({ items: [event] })
      component.openMilestone(event)
      await Promise.resolve()
      await Promise.resolve()
      expect(telemetry.click).toHaveBeenCalledWith('enroll-now', undefined, { id: 'do_event', type: 'Event' })

      telemetry.click.mockClear()
      statusSvc.enrollEvent.mockRejectedValueOnce({ error: {} })
      component.openMilestone(event)
      await Promise.resolve()
      await Promise.resolve()
      expect(telemetry.click.mock.calls.map(call => call[1])).toEqual(['card-content'])
    })
  })
})
