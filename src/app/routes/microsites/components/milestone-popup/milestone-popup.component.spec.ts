import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { NsCampaignMicrosite } from '../../models/campaign-microsite.model'
import { MilestonePopupComponent } from './milestone-popup.component'

const milestone = (order: number, type: NsCampaignMilestone.TMilestoneType = 'assessment') => ({
  order,
  type,
  milestoneLabel: `Milestone ${order}`,
  name: `Milestone name ${order}`,
}) as NsCampaignMilestone.IMilestone

const MILESTONES = [milestone(1), milestone(2, 'event'), milestone(3, 'survey'), milestone(4)]

const CONFIG: NsCampaignMicrosite.IMilestonePopup = {
  enabled: true,
  eyebrow: 'Welcome to your learning journey',
  title: 'Four milestones, completed\none step at a time',
  description: 'Each milestone unlocks the next.',
  note: 'Milestones open <strong>in order</strong>.',
  helpText: 'Stuck on any step?',
  steps: [
    { order: 1, title: 'Baseline Assessment', description: 'Know where you stand.', icon: 'assessment', color: 'navy' },
    { order: 2, title: 'Live Event', icon: 'event', color: 'green' },
  ],
}

const KEY = {
  availableNow: 'campaignMicrosite.milestonePopup.availableNow',
  inProgress: 'campaignMicrosite.milestonePopup.inProgress',
  completed: 'campaignMicrosite.milestonePopup.completed',
  locked: 'campaignMicrosite.milestoneCard.locked',
  start: 'campaignMicrosite.milestonePopup.start',
  resume: 'campaignMicrosite.milestonePopup.resume',
}

describe('MilestonePopupComponent', () => {
  let fixture: ComponentFixture<MilestonePopupComponent>
  let component: MilestonePopupComponent
  let el: HTMLElement

  function render(states: NsCampaignMilestone.TMilestoneState[], config: NsCampaignMicrosite.IMilestonePopup = CONFIG) {
    fixture.componentRef.setInput('config', config)
    fixture.componentRef.setInput('milestones', MILESTONES)
    fixture.componentRef.setInput('states', states)
    fixture.detectChanges()
  }
  const statuses = () => Array.from(el.querySelectorAll('.mp-step__status')).map(s => s.textContent?.trim())
  const cta = () => el.querySelector<HTMLButtonElement>('.mp-cta')

  beforeEach(() => {
    // No translations loaded, so the translate pipe renders the keys
    TestBed.configureTestingModule({ imports: [MilestonePopupComponent, TranslateModule.forRoot()] })
    fixture = TestBed.createComponent(MilestonePopupComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
  })

  it('renders the config copy, with the note as sanitised HTML', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(el.querySelector('#mp-title')?.textContent).toContain('one step at a time')
    expect(el.querySelector('.mp-note strong')?.textContent).toBe('in order')
    expect(el.querySelector('.mp-help')?.textContent).toContain('Stuck on any step?')
  })

  it('one step per milestone; config steps matched by order, others fall back to the milestone', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    const steps = component.steps()
    expect(steps.map(s => s.title)).toEqual(['Baseline Assessment', 'Live Event', 'Milestone name 3', 'Milestone name 4'])
    expect(steps.map(s => s.label)).toEqual(['Milestone 1', 'Milestone 2', 'Milestone 3', 'Milestone 4'])
    expect(steps.map(s => s.number)).toEqual([1, 2, 3, 4])
    // missing icon / colour: by type, then by position
    expect(steps[2].icon).toBe('pledge')
    expect(steps[3].icon).toBe('assessment')
    expect(steps.map(s => s.color)).toEqual(['navy', 'green', 'teal', 'orange'])
  })

  it('without a milestoneLabel the step label is the "Milestone N" key', () => {
    fixture.componentRef.setInput('milestones', MILESTONES.map(m => ({ ...m, milestoneLabel: '' })))
    fixture.componentRef.setInput('states', ['notStarted', 'locked', 'locked', 'locked'])
    fixture.detectChanges()
    const labels = Array.from(el.querySelectorAll('.mp-step__label')).map(l => l.textContent?.trim())
    expect(labels).toEqual(Array(4).fill('campaignMicrosite.milestonePopup.milestone'))
  })

  it('translates the close button label', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(el.querySelector('.mp-close')?.getAttribute('aria-label')).toBe('campaignMicrosite.close')
  })

  it('draws a connector after every step but the last', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(el.querySelectorAll('.mp-step__line').length).toBe(3)
  })

  it('new journey: first available, the rest locked', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(statuses()).toEqual([KEY.availableNow, KEY.locked, KEY.locked, KEY.locked])
    expect(cta()?.textContent).toContain(KEY.start)
    expect(component.cta()).toEqual({ label: KEY.start, number: 1 })
  })

  it('mid journey: completed steps, and Resume for one in progress', () => {
    render(['completed', 'inProgress', 'locked', 'locked'])
    expect(statuses()).toEqual([KEY.completed, KEY.inProgress, KEY.locked, KEY.locked])
    expect(component.cta()).toEqual({ label: KEY.resume, number: 2 })
  })

  it('CTA targets the first open milestone, skipping a locked one before it', () => {
    render(['locked', 'completed', 'notStarted', 'locked'])
    expect(component.cta()).toEqual({ label: KEY.start, number: 3 })
  })

  it('a disabled milestone shows as locked whatever its state', () => {
    fixture.componentRef.setInput('milestones', MILESTONES.map(m => (m.order === 2 ? { ...m, enabled: false } : m)))
    fixture.componentRef.setInput('states', ['notStarted', 'completed', 'locked', 'locked'])
    fixture.detectChanges()
    expect(statuses()[1]).toBe(KEY.locked)
  })

  it('no CTA when nothing is open', () => {
    render(['completed', 'locked', 'locked', 'locked'])
    expect(cta()).toBeNull()
  })

  it('no CTA once the journey is complete', () => {
    render(['completed', 'completed', 'completed', 'completed'])
    expect(cta()).toBeNull()
  })

  it('CTA emits the current milestone', () => {
    render(['completed', 'notStarted', 'locked', 'locked'])
    const started = jest.fn()
    component.start.subscribe(started)
    cta()?.click()
    expect(started).toHaveBeenCalledWith(MILESTONES[1])
  })

  it('emits closed from the close button, the backdrop and Escape, not from inside the dialog', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    const closed = jest.fn()
    component.closed.subscribe(closed)

    el.querySelector<HTMLElement>('.mp-dialog')?.click()
    expect(closed).not.toHaveBeenCalled()

    el.querySelector<HTMLElement>('.mp-close')?.click()
    el.querySelector<HTMLElement>('.mp-backdrop')?.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(closed).toHaveBeenCalledTimes(3)
  })
})
