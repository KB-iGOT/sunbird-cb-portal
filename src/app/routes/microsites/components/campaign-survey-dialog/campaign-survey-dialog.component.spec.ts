import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateModule } from '@ngx-translate/core'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
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
  name: 'Leadership Pledge: Commit to Serve Citizens',
} as NsCampaignMilestone.IMilestone

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
      imports: [CampaignSurveyDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AppTocService, useValue: tocSvc },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MAT_DIALOG_DATA, useValue: { milestone } },
      ],
    })
    // The TOC question components are covered by the toc library; stub them here
    TestBed.overrideComponent(CampaignSurveyDialogComponent, {
      set: { imports: [ReactiveFormsModule, TranslateModule], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
  })

  it('loads the form by formId and renders its title and fields', () => {
    create()
    expect(tocSvc.getFormById).toHaveBeenCalledWith('1784131937108')
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Leadership Pledge')
    expect(el.querySelectorAll('ws-app-survey-form-question').length).toBe(1)
    expect(el.querySelectorAll('ws-app-survey-form-section').length).toBe(1)
    expect(el.querySelectorAll('hr').length).toBe(1)
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
    expect(snackBar.open).toHaveBeenCalledWith('campaignMicrosite.survey.submitted', 'X', { duration: 5000 })
  })

  it('does not submit an invalid form', () => {
    create()
    component.submit()
    expect(tocSvc.submitForm).not.toHaveBeenCalled()
  })

  it.each([
    ['a failed status', of({ params: { status: 'failed' }, errorMessage: 'Already submitted' }), 'Already submitted'],
    ['an HTTP error', throwError(() => new Error('500')), 'campaignMicrosite.survey.submitError'],
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
