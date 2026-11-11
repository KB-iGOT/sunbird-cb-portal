import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { Subject, of } from 'rxjs'
import { NsCampaignMicrosite } from '../../models/campaign-microsite.model'
import { MilestoneStatusService } from '../../services/milestone-status.service'
import { CampaignSurveyDialogComponent } from '../campaign-survey-dialog/campaign-survey-dialog.component'
import { MILESTONE_POPUP_SEEN_KEY, ProgrammeMilestonesComponent, isWithinEventWindow } from './programme-milestones.component'

const milestone = (order: number, overrides: Partial<NsCampaignMilestone.IMilestone> = {}) => ({
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
}) as NsCampaignMilestone.IMilestone

const OPEN_WINDOW: NsCampaignMicrosite.IEventDetails = { startDate: '01-01-2000', endDate: '31-12-2099' }

describe('ProgrammeMilestonesComponent', () => {
  let fixture: ComponentFixture<ProgrammeMilestonesComponent>
  let component: ProgrammeMilestonesComponent
  let el: HTMLElement
  let statusSvc: { resolveStates: jest.Mock }
  let router: { navigate: jest.Mock, navigateByUrl: jest.Mock }
  let dialog: { open: jest.Mock }
  let dialogResult: Subject<boolean | undefined>
  let snackBar: { open: jest.Mock }

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
    statusSvc = { resolveStates: jest.fn(() => of([])) }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    dialogResult = new Subject()
    dialog = { open: jest.fn(() => ({ afterClosed: () => dialogResult })) }
    snackBar = { open: jest.fn() }
    TestBed.configureTestingModule({
      imports: [ProgrammeMilestonesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MilestoneStatusService, useValue: statusSvc },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    })
    // The card is covered by its own specs in the consumption library. Through npm link it also
    // resolves a second @angular/core under Jest (the app build uses preserveSymlinks), so stub it.
    TestBed.overrideComponent(ProgrammeMilestonesComponent, {
      set: { imports: [TranslateModule], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
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
      ['outside the event window', { items: [milestone(1)] }, { startDate: '01-01-2000', endDate: '02-01-2000' }],
    ])('hidden and no API call when %s', (_name, config, window) => {
      render(config as any, window)
      expect(el.querySelector('section')).toBeNull()
      expect(statusSvc.resolveStates).not.toHaveBeenCalled()
    })

    it('sorts by order before resolving and rendering', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'locked', 'locked']))
      render({ items: [milestone(3), milestone(1), milestone(2)] })
      expect(statusSvc.resolveStates.mock.calls[0][0].map((m: any) => m.order)).toEqual([1, 2, 3])
      expect(cards().map(card => card.milestone.order)).toEqual([1, 2, 3])
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
      expect(el.querySelector('.cm-milestones__complete')?.textContent).toContain('campaignMicrosite.milestones.journeyComplete')
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
      expect(dialog.open).toHaveBeenCalledWith(CampaignSurveyDialogComponent, expect.objectContaining({ data: { milestone: survey } }))
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('re-resolves states after a submit, not after "Do it later"', () => {
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
      expect(snackBar.open).toHaveBeenCalledWith('campaignMicrosite.survey.alreadySubmitted', 'X', { duration: 5000 })
    })

    it('redirectUrl still wins over the dialog', () => {
      render({ items: [survey] })
      component.openMilestone({ ...survey, redirectUrl: '/surveys/1784131937108' })
      expect(router.navigateByUrl).toHaveBeenCalledWith('/surveys/1784131937108')
      expect(dialog.open).not.toHaveBeenCalled()
    })
  })

  describe('journey popup', () => {
    const popup = () => el.querySelector('ws-app-milestone-popup') as any
    const withPopup = { popup: { enabled: true }, items: [milestone(1), milestone(2)] }

    beforeEach(() => sessionStorage.clear())

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

    it('closes and is not shown again this session for the same milestone', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render(withPopup)
      component.closePopup()
      fixture.detectChanges()
      expect(popup()).toBeNull()
      expect(sessionStorage.getItem(MILESTONE_POPUP_SEEN_KEY)).toBe('2')
    })

    it('shows again once the user reaches the next milestone', () => {
      sessionStorage.setItem(MILESTONE_POPUP_SEEN_KEY, '1')
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'notStarted']))
      render(withPopup)
      expect(popup()).not.toBeNull()
    })

    it('tracks the first open milestone, skipping a locked one before it', () => {
      statusSvc.resolveStates.mockReturnValue(of(['locked', 'notStarted']))
      render(withPopup)
      component.closePopup()
      expect(sessionStorage.getItem(MILESTONE_POPUP_SEEN_KEY)).toBe('2')
    })

    it('stays closed when no milestone is open', () => {
      statusSvc.resolveStates.mockReturnValue(of(['completed', 'locked']))
      render(withPopup)
      expect(popup()).toBeNull()
    })

    it('start closes the popup and opens the milestone', () => {
      statusSvc.resolveStates.mockReturnValue(of(['notStarted', 'locked']))
      render(withPopup)
      component.startFromPopup(milestone(1))
      fixture.detectChanges()
      expect(popup()).toBeNull()
      expect(router.navigate).toHaveBeenCalledWith(['/app/toc', 'do_1', 'overview'], { queryParams: { batchId: 'b_1' } })
    })
  })
})

describe('isWithinEventWindow', () => {
  const window = { startDate: '05-07-2026', endDate: '28-11-2026' }

  it.each([
    [new Date(2026, 6, 5, 0, 0), true],
    [new Date(2026, 10, 28, 23, 59), true],
    [new Date(2026, 9, 30, 12, 0), true],
    [new Date(2026, 6, 4, 23, 59), false],
    [new Date(2026, 10, 29, 0, 0), false],
  ])('%s → %s (both days inclusive)', (now, expected) => {
    expect(isWithinEventWindow(window, now)).toBe(expected)
  })

  it('shows the section when the window is missing or invalid', () => {
    expect(isWithinEventWindow(undefined, new Date())).toBe(true)
    expect(isWithinEventWindow({ startDate: '2026-07-05', endDate: '' }, new Date())).toBe(true)
  })
})
