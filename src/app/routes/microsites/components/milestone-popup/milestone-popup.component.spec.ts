import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { NsCampaignMicrosite, resolveMilestoneLabels } from '../../models/campaign-microsite.model'
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

/** Default text (no `labels` input set) */
const KEY = {
  availableNow: 'Available now',
  inProgress: 'In progress',
  completed: 'Completed',
  locked: 'Locked',
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
  const okay = () => el.querySelector<HTMLButtonElement>('.mp-cta')

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MilestonePopupComponent] })
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

  it('without a milestoneLabel the step label is "Milestone N"', () => {
    fixture.componentRef.setInput('milestones', MILESTONES.map(m => ({ ...m, milestoneLabel: '' })))
    fixture.componentRef.setInput('states', ['notStarted', 'locked', 'locked', 'locked'])
    fixture.detectChanges()
    const labels = Array.from(el.querySelectorAll('.mp-step__label')).map(l => l.textContent?.trim())
    expect(labels).toEqual(['Milestone 1', 'Milestone 2', 'Milestone 3', 'Milestone 4'])
  })

  it('labels the close button', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(el.querySelector('.mp-close')?.getAttribute('aria-label')).toBe('Close')
  })

  it('uses text from the page config labels, with {{number}} filled in', () => {
    fixture.componentRef.setInput('labels', resolveMilestoneLabels({
      close: 'Dismiss',
      popup: { availableNow: 'Open', locked: 'Not yet', okay: 'Got it', milestone: 'Step {{number}}' },
    }))
    fixture.componentRef.setInput('config', CONFIG)
    fixture.componentRef.setInput('milestones', MILESTONES.map(m => ({ ...m, milestoneLabel: '' })))
    fixture.componentRef.setInput('states', ['notStarted', 'locked', 'locked', 'locked'])
    fixture.detectChanges()
    expect(statuses()).toEqual(['Open', 'Not yet', 'Not yet', 'Not yet'])
    expect(okay()?.textContent?.trim()).toBe('Got it')
    expect(el.querySelector('.mp-step__label')?.textContent?.trim()).toBe('Step 1')
    expect(el.querySelector('.mp-close')?.getAttribute('aria-label')).toBe('Dismiss')
  })

  it('milestones waiting for the event date show the "Available from" text', () => {
    fixture.componentRef.setInput('availableFrom', [null, 'Available from 17th Nov', 'Available from 17th Nov', null])
    render(['completed', 'notStarted', 'notStarted', 'notStarted'])
    expect(statuses()).toEqual([KEY.completed, 'Available from 17th Nov', 'Available from 17th Nov', KEY.availableNow])
    expect(component.steps()[1].tone).toBe('muted')
  })

  it('a completed milestone shows Completed even while the date lock applies', () => {
    fixture.componentRef.setInput('availableFrom', [null, 'Available from 17th Nov', null, null])
    render(['completed', 'completed', 'notStarted', 'locked'])
    expect(statuses()[1]).toBe(KEY.completed)
  })

  describe('image-only popup', () => {
    const IMAGE = 'https://example.org/welcome.png'
    const withImage = { ...CONFIG, image: IMAGE, imageAlt: 'Welcome banner' }

    it('shows only the image and the close button when an image is configured', () => {
      render(['notStarted', 'locked', 'locked', 'locked'], withImage)
      const img = el.querySelector<HTMLImageElement>('.mp-image')
      expect(img?.getAttribute('src')).toBe(IMAGE)
      expect(img?.getAttribute('alt')).toBe('Welcome banner')
      expect(el.querySelector('.mp-close')).not.toBeNull()
      expect(el.querySelector('#mp-title')).toBeNull()
      expect(okay()).toBeNull()
      expect(el.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Welcome banner')
    })

    it('close button closes it', () => {
      render(['notStarted', 'locked', 'locked', 'locked'], withImage)
      const closed = jest.fn()
      component.closed.subscribe(closed)
      el.querySelector<HTMLElement>('.mp-close')?.click()
      expect(closed).toHaveBeenCalledTimes(1)
    })

    it('falls back to the text popup when the image fails to load', () => {
      render(['notStarted', 'locked', 'locked', 'locked'], withImage)
      el.querySelector('.mp-image')?.dispatchEvent(new Event('error'))
      fixture.detectChanges()
      expect(el.querySelector('.mp-image')).toBeNull()
      expect(el.querySelector('#mp-title')?.textContent).toContain('one step at a time')
    })

    it.each([['empty', ''], ['placeholder', '<WELCOME_IMAGE_URL>']])('uses the text popup for an %s image', (_name, image) => {
      render(['notStarted', 'locked', 'locked', 'locked'], { ...CONFIG, image })
      expect(el.querySelector('.mp-image')).toBeNull()
      expect(el.querySelector('#mp-title')).not.toBeNull()
    })

    it('alt text falls back to the title', () => {
      render(['notStarted', 'locked', 'locked', 'locked'], { ...CONFIG, image: IMAGE })
      expect(el.querySelector('.mp-image')?.getAttribute('alt')).toBe(CONFIG.title)
    })
  })

  it('draws a connector after every step but the last', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(el.querySelectorAll('.mp-step__line').length).toBe(3)
  })

  it('new journey: first available, the rest locked', () => {
    render(['notStarted', 'locked', 'locked', 'locked'])
    expect(statuses()).toEqual([KEY.availableNow, KEY.locked, KEY.locked, KEY.locked])
  })

  it('mid journey: completed steps and one in progress', () => {
    render(['completed', 'inProgress', 'locked', 'locked'])
    expect(statuses()).toEqual([KEY.completed, KEY.inProgress, KEY.locked, KEY.locked])
  })

  it('a disabled milestone shows as locked whatever its state', () => {
    fixture.componentRef.setInput('milestones', MILESTONES.map(m => (m.order === 2 ? { ...m, enabled: false } : m)))
    fixture.componentRef.setInput('states', ['notStarted', 'completed', 'locked', 'locked'])
    fixture.detectChanges()
    expect(statuses()[1]).toBe(KEY.locked)
  })

  it('the Okay button only closes the popup', () => {
    render(['completed', 'notStarted', 'locked', 'locked'])
    const closed = jest.fn()
    component.closed.subscribe(closed)
    expect(okay()?.textContent?.trim()).toBe('Okay')
    okay()?.click()
    expect(closed).toHaveBeenCalledTimes(1)
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
