import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AppTocService } from '@sunbird-cb/toc'
import { of, throwError } from 'rxjs'
import { NsCampaignMicrosite, buildSurveyForm, toFormDetails, toResponse } from '../../models/campaign-microsite.model'
import { CampaignSurveyDialogComponent } from './campaign-survey-dialog.component'

const FIELDS: NsCampaignMicrosite.ISurveyField[] = [
  { id: 'q1', name: 'Your name', fieldType: 'text', isRequired: true },
  { fieldType: 'separator' },
  { fieldType: 'heading', sectionId: 's1', values: [{ heading: 'Pledge' }] },
  { id: 'q2', name: 'Date', fieldType: 'date', parentId: 's1' },
  { id: 'q3', name: 'Email', fieldType: 'email', parentId: 's1' },
]

const FORM_RESPONSE = { result: { response: { title: 'Leadership Pledge', fields: FIELDS, contextType: 'survey', version: 3 } } }

const milestone = {
  order: 3,
  type: 'survey',
  formId: '1784131937108',
  // no limits here; the default Sankalpa limits have their own test
  answerLimits: [] as NsCampaignMicrosite.IAnswerLimit[],
  name: 'Leadership Pledge: Commit to Serve Citizens',
} as NsCampaignMicrosite.IMilestone

describe('campaign survey form helpers', () => {
  const fb = new FormBuilder()

  it('toFormDetails reads the form-read response, with defaults', () => {
    expect(toFormDetails(FORM_RESPONSE)).toEqual({ title: 'Leadership Pledge', fields: FIELDS, contextType: 'survey', version: 3 })
    expect(toFormDetails({})).toEqual({ title: '', fields: [], contextType: 'form', version: 1 })
  })

  it('buildSurveyForm: one group per question, sections get their own array, source fields untouched', () => {
    const model = buildSurveyForm(fb, FIELDS)
    expect(model.controls.length).toBe(3)
    expect(model.parentFields.map(f => f.fieldType)).toEqual(['text', 'separator', 'heading'])
    expect(model.childFields.s1.map(f => f.controlIndex)).toEqual([1, 2])
    expect(model.sections.s1.length).toBe(2)
    expect(model.parentFields[0].controlIndex).toBe(0)
    expect(FIELDS[0].controlIndex).toBeUndefined()
  })

  it('buildSurveyForm: required and pattern validators drive form validity', () => {
    const model = buildSurveyForm(fb, FIELDS)
    expect(model.form.valid).toBe(false)
    model.controls[0].controls.answer.setValue('Asha')
    expect(model.form.valid).toBe(true)
    model.controls[2].controls.answer.setValue('not-an-email')
    expect(model.form.valid).toBe(false)
  })

  it('toResponse formats dates and N/A answers like the TOC survey', () => {
    const model = buildSurveyForm(fb, FIELDS)
    model.controls[1].controls.answer.setValue(new Date(2026, 10, 3))
    expect(toResponse(model.controls[1])).toEqual({ questionId: 'q2', question: 'Date', answer: '2026-11-03', answerType: 'date' })
    model.controls[0].controls.isNA.setValue(true)
    expect(toResponse(model.controls[0]).answer).toBe('N/A')
  })
})

describe('CampaignSurveyDialogComponent', () => {
  let fixture: ComponentFixture<CampaignSurveyDialogComponent>
  let component: CampaignSurveyDialogComponent
  let el: HTMLElement
  let tocSvc: { getFormById: jest.Mock, submitForm: jest.Mock }
  let dialogRef: { close: jest.Mock }
  let snackBar: { open: jest.Mock }

  function create(data = { milestone }) {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data })
    fixture = TestBed.createComponent(CampaignSurveyDialogComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
    fixture.detectChanges()
  }
  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')
  const commitBox = () => el.querySelector<HTMLInputElement>('input[type="checkbox"]')
  const fillValid = () => {
    component.model()?.controls[0].controls.answer.setValue('Asha')
    component.isCommitted.set(true)
  }

  beforeEach(() => {
    tocSvc = { getFormById: jest.fn(() => of(FORM_RESPONSE)), submitForm: jest.fn(() => of({ params: { status: 'success' } })) }
    dialogRef = { close: jest.fn() }
    snackBar = { open: jest.fn() }
    TestBed.configureTestingModule({
      imports: [CampaignSurveyDialogComponent],
      providers: [
        { provide: AppTocService, useValue: tocSvc },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MAT_DIALOG_DATA, useValue: { milestone } },
      ],
    })
    // The TOC question components are covered by the toc library; stub them here
    TestBed.overrideComponent(CampaignSurveyDialogComponent, {
      set: { imports: [NgTemplateOutlet, ReactiveFormsModule], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
  })

  it('loads the form by formId and renders its title and fields', () => {
    create()
    expect(tocSvc.getFormById).toHaveBeenCalledWith('1784131937108')
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Leadership Pledge')
    // q1 on its own, q2 + q3 inside the "Pledge" section
    expect(el.querySelectorAll('ws-app-survey-form-question').length).toBe(3)
    expect(el.querySelectorAll('.csd__section .csd__section-title')[0]?.textContent?.trim()).toBe('Pledge')
    expect(el.querySelectorAll('.csd__section ws-app-survey-form-question').length).toBe(2)
  })

  it('submit stays disabled until required answers are valid and the commitment is checked', () => {
    create()
    expect(submitButton()?.disabled).toBe(true)
    component.model()?.controls[0].controls.answer.setValue('Asha')
    fixture.detectChanges()
    expect(submitButton()?.disabled).toBe(true)
    commitBox()?.click()
    fixture.detectChanges()
    expect(component.isCommitted()).toBe(true)
    expect(submitButton()?.disabled).toBe(false)
    commitBox()?.click()
    fixture.detectChanges()
    expect(submitButton()?.disabled).toBe(true)
  })

  it('does not submit valid answers without the commitment', () => {
    create()
    component.model()?.controls[0].controls.answer.setValue('Asha')
    component.submit()
    expect(tocSvc.submitForm).not.toHaveBeenCalled()
  })

  it('submits the TOC body and closes with true on success', () => {
    create()
    fillValid()
    component.submit()
    expect(tocSvc.submitForm).toHaveBeenCalledWith({
      formId: '1784131937108',
      version: 3,
      status: 'SUBMITTED',
      responses: [
        { questionId: 'q1', question: 'Your name', answer: 'Asha', answerType: 'text' },
        { questionId: 'q2', question: 'Date', answer: '', answerType: 'date' },
        { questionId: 'q3', question: 'Email', answer: '', answerType: 'email' },
      ],
      contextType: 'survey',
      contextId: '1784131937108',
      contextName: milestone.name,
      contextOrgId: '',
    })
    expect(dialogRef.close).toHaveBeenCalledWith(true)
    expect(snackBar.open).toHaveBeenCalledWith('Thank you! Your response has been submitted.', 'X', { duration: 5000 })
  })

  it('does not submit an invalid form', () => {
    create()
    component.submit()
    expect(tocSvc.submitForm).not.toHaveBeenCalled()
  })

  it.each([
    ['a failed status', of({ params: { status: 'failed' }, errorMessage: 'Already submitted' }), 'Already submitted'],
    ['an HTTP error', throwError(() => new Error('500')), 'Something went wrong. Please try again.'],
  ])('stays open and shows a message on %s', (_name, result, message) => {
    tocSvc.submitForm.mockReturnValue(result)
    create()
    fillValid()
    component.submit()
    expect(dialogRef.close).not.toHaveBeenCalled()
    expect(snackBar.open).toHaveBeenCalledWith(message, 'X', { duration: 5000 })
    expect(component.isSubmitting()).toBe(false)
  })

  it('shows a retry when the form fails to load', () => {
    tocSvc.getFormById.mockReturnValueOnce(throwError(() => new Error('404')))
    create()
    expect(el.querySelector('[role="alert"]')).toBeTruthy()
    expect(submitButton()).toBeNull()
    el.querySelector<HTMLButtonElement>('[role="alert"] button')?.click()
    fixture.detectChanges()
    expect(tocSvc.getFormById).toHaveBeenCalledTimes(2)
    expect(el.querySelector('[role="alert"]')).toBeNull()
  })

  it('applies the default Sankalpa limits when the milestone has none and shows the counter', () => {
    const { answerLimits, ...noLimits } = milestone
    create({ milestone: noLimits } as any)
    const answer = component.model()!.controls[0].controls.answer
    answer.setValue('Asha')
    answer.markAsTouched()
    fixture.detectChanges()
    expect(answer.hasError('minlength')).toBe(true)
    const hint = el.querySelector('.csd__limit')
    expect(hint?.querySelector('.csd__limit-error')?.textContent).toContain('Minimum 70 characters')
    expect(hint?.textContent).toContain('4/300')
  })

  it('a required question left empty after focus says so; nothing before it is touched, and the minimum once typed', () => {
    const { answerLimits, ...defaultLimits } = milestone
    create({ milestone: defaultLimits } as any)
    const answer = component.model()!.controls[0].controls.answer
    const error = () => el.querySelector('.csd__limit-error')?.textContent?.trim() ?? null
    expect(error()).toBeNull()

    answer.markAsTouched()
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck()
    fixture.detectChanges()
    expect(error()).toBe('This field is required')

    answer.setValue('Asha')
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck()
    fixture.detectChanges()
    expect(error()).toBe('Minimum 70 characters')
  })

  it('a required question without length limits still gets the message', () => {
    create({ milestone: { ...milestone, answerLimits: [] } })
    component.model()!.controls[0].controls.answer.markAsTouched()
    fixture.detectChanges()
    expect(el.querySelector('.csd__limit-error')?.textContent?.trim()).toBe('This field is required')
  })

  it('shows the length hint for questions inside a section too', () => {
    create({ milestone: { ...milestone, answerLimits: [{ ids: ['q3'], minLength: 5, maxLength: 20 }] } })
    const answer = component.model()!.controls[2].controls.answer
    answer.setValue('abc')
    answer.markAsTouched()
    fixture.detectChanges()
    const hints = el.querySelectorAll('.csd__section .csd__limit')
    expect(hints.length).toBe(1)
    expect(hints[0].textContent).toContain('Minimum 5 characters')
    expect(hints[0].textContent).toContain('3/20')
  })

  it('shows nothing under a limited answer until it is typed in or too short; the hint always shows', () => {
    create({ milestone: { ...milestone, answerLimits: [
      { ids: ['q3'], minLength: 5, maxLength: 20 },
      { ids: ['q3'], hint: 'Say what and by when' },
    ] } })
    expect(el.querySelector('.csd__limit')).toBeNull()
    expect(el.querySelector('.csd__hint')?.textContent).toContain('Say what and by when')

    const answer = component.model()!.controls[2].controls.answer
    // typing in the TOC textarea re-renders this OnPush dialog; setting the value directly needs a nudge
    const rerender = () => {
      fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck()
      fixture.detectChanges()
    }
    answer.setValue('abc')
    rerender()
    // typing shows the counter; the minimum waits until the field is left
    expect(el.querySelector('.csd__limit')?.textContent).toContain('3/20')
    expect(el.querySelector('.csd__limit')?.textContent).not.toContain('Minimum')
    answer.setValue('abcdef')
    answer.markAsTouched()
    rerender()
    expect(el.querySelector('.csd__limit')?.textContent).not.toContain('Minimum')
  })

  it('fails without a formId and makes no call', () => {
    create({ milestone: { ...milestone, formId: '' } })
    expect(tocSvc.getFormById).not.toHaveBeenCalled()
    expect(component.loadFailed()).toBe(true)
  })

  it('Cancel closes with false', () => {
    create()
    el.querySelector<HTMLButtonElement>('.csd__btn--secondary')?.click()
    expect(dialogRef.close).toHaveBeenCalledWith(false)
  })
})
