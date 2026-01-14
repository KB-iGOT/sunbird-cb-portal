import { of, throwError } from 'rxjs'
import { FormBuilder, Validators } from '@angular/forms'

// Mock the service module before importing the component so Jest doesn't try to
// resolve heavy external deps that AppTocService might use.
jest.mock('../../services/app-toc.service', () => ({
  AppTocService: jest.fn().mockImplementation(() => ({
    getFormByIdPublic: jest.fn(),
    submitFormPublic: jest.fn(),
  })),
}))

import { PublicSurveyFormComponent } from './public-survey-form.component'

describe('PublicSurveyFormComponent (no TestBed)', () => {
  let component: PublicSurveyFormComponent
  let fb: FormBuilder

  // lightweight mocks typed as any to avoid strict mock typing issues
  const mockSnackBar: any = { open: jest.fn() }
  const mockDialogRef: any = { close: jest.fn() }
  const mockTranslate: any = { setDefaultLang: jest.fn(), use: jest.fn() }

  const sampleFields = [
    { id: 'q1', name: 'Q1', fieldType: 'text', isRequired: true },
    { id: 'q2', name: 'Q2', fieldType: 'date', isRequired: false },
  ]

  const mockAppTocSvc: any = {
    getFormByIdPublic: jest.fn().mockReturnValue(of({
      result: {
        response: {
          title: 't',
          fields: sampleFields,
          contextType: 'form',
        }
      }
    })),
    submitFormPublic: jest.fn().mockReturnValue(of({ params: { status: 'success' } })),
  }

  const mockData: any = {
    surveyId: 'survey1',
    courseId: 'context1',
    courseName: 'Course A',
    contextOrgId: 'org1',
  }

  beforeEach(() => {
    fb = new FormBuilder()

    // ensure localStorage state doesn't break constructor in test env
    if (localStorage.getItem('websiteLanguage')) {
      localStorage.removeItem('websiteLanguage')
    }

    jest.clearAllMocks()

    component = new PublicSurveyFormComponent(
      mockSnackBar,
      mockDialogRef,
      mockData,
      fb,
      mockAppTocSvc,
      mockTranslate,
    )
  })

  it('should create the component instance', () => {
    expect(component).toBeTruthy()
  })

  it('buildForm should build surveyForm and set surveyFormIsValid to false when required field present', () => {
    component.formDetails = {
      fields: [
        { id: 'a', name: 'A', fieldType: 'text', isRequired: true }
      ]
    }
    component.buildForm()

    expect(component.surveyForm).toBeDefined()
    expect(component.questionsArray.length).toBeGreaterThan(0)
    expect(component.surveyFormIsValid).toBeFalsy()
  })

  it('dataObject getter should format date and N/A values correctly', () => {
    const date = new Date(2020, 0, 2)
    const group = fb.group({
      questionId: ['d1'],
      question: ['Date Q'],
      answer: [date],
      isNA: [false],
      fieldType: ['date']
    })

    const naGroup = fb.group({
      questionId: ['n1'],
      question: ['NA Q'],
      answer: ['something'],
      isNA: [true],
      fieldType: ['text']
    })

    component.surveyForm = fb.group({ fields: fb.array([group, naGroup]) })

    const result: any = component.dataObject
    expect(result.length).toBe(2)
    expect(result[0].answer).toBe('2020-01-02')
    expect(result[1].answer).toBe('N/A')
  })

  it('getEmailFromsurvey should return email answer when present', () => {
    const emailGroup = fb.group({
      questionId: ['e1'],
      question: ['Email'],
      answer: ['user@example.com'],
      isNA: [false],
      fieldType: ['text']
    })

    component.surveyForm = fb.group({ fields: fb.array([emailGroup]) })

    const email = component.getEmailFromsurvey()
    expect(email).toBe('user@example.com')
  })

  it('getEmailFromsurvey should return empty string when email not present', () => {
    const nameGroup = fb.group({
      questionId: ['n1'],
      question: ['Name'],
      answer: ['User'],
      isNA: [false],
      fieldType: ['text']
    })

    component.surveyForm = fb.group({ fields: fb.array([nameGroup]) })

    const email = component.getEmailFromsurvey()
    expect(email).toBe('')
  })

  it('closeDialog should close dialog with false', () => {
    component.closeDialog()
    expect(mockDialogRef.close).toHaveBeenCalledWith(false)
  })

  it('submitForm should call submitFormPublic, update localStorage and close dialog on success', () => {
    component.surveyFormIsValid = true
    component.surveyId = 'survey1'
    component.surveyForm = fb.group({ fields: fb.array([]) })

    const storageKey = `survey_${component.surveyId}_${mockData.courseId}`
    localStorage.setItem(storageKey, 'old')

    mockAppTocSvc.submitFormPublic.mockReturnValue(of({ params: { status: 'success' } }))

    component.submitForm()

    expect(mockAppTocSvc.submitFormPublic).toHaveBeenCalled()
    expect(mockSnackBar.open).toHaveBeenCalled()
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)

    const stored = localStorage.getItem(storageKey)
    expect(stored).not.toBeNull()
    expect(stored).toBe(JSON.stringify(component.dataObject))
  })

  it('submitForm should not call submitFormPublic when surveyFormIsValid is false', () => {
    component.surveyFormIsValid = false
    component.surveyForm = fb.group({ fields: fb.array([]) })

    mockAppTocSvc.submitFormPublic.mockClear()
    component.submitForm()

    expect(mockAppTocSvc.submitFormPublic).not.toHaveBeenCalled()
  })

  it('submitForm should handle submit error path', () => {
    component.surveyFormIsValid = true
    component.surveyForm = fb.group({ fields: fb.array([]) })

    mockAppTocSvc.submitFormPublic.mockReturnValue(throwError(() => ({ message: 'fail' })))

    component.submitForm()

    expect(mockSnackBar.open).toHaveBeenCalled()
    expect(mockDialogRef.close).not.toHaveBeenCalledWith(true)
  })

  it('constructor should use translate when websiteLanguage is present', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const tMock: any = { setDefaultLang: jest.fn(), use: jest.fn() }

    const instance = new PublicSurveyFormComponent(
      mockSnackBar,
      mockDialogRef,
      mockData,
      fb,
      mockAppTocSvc,
      tMock,
    )

    expect(instance).toBeTruthy()
    expect(tMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(tMock.use).toHaveBeenCalledWith('hi')
    localStorage.removeItem('websiteLanguage')
  })

  it('ngOnInit/getSurveyFormData should set formDetails on success', () => {
    mockAppTocSvc.getFormByIdPublic.mockReturnValue(of({
      result: {
        response: {
          title: 'T',
          fields: sampleFields,
          contextType: 'form',
        }
      }
    }))

    component.surveyId = 'survey1'
    component.addLoader = 0

    component.ngOnInit()

    expect(component.addLoader).toBe(0)
    expect(component.formDetails.title).toBe('T')
    expect(component.parentalFields.length + component.childFields.length).toBeGreaterThan(0)
  })

  it('getSurveyFormData should handle error without throwing', () => {
    mockAppTocSvc.getFormByIdPublic.mockReturnValue(throwError(() => new Error('network')))

    component.addLoader = 0

    expect(() => component.getSurveyFormData()).not.toThrow()
    expect(component.addLoader).toBe(0)
  })

  it('buildForm should handle phone, email, numeric validators and skip separators/headings', () => {
    component.formDetails = {
      fields: [
        { id: 's1', name: 'sep', fieldType: 'separator' },
        { id: 'h1', name: 'head', fieldType: 'heading' },
        { id: 'p1', name: 'Phone', fieldType: 'phone number', isRequired: false },
        { id: 'e1', name: 'Email', fieldType: 'email', isRequired: false },
        { id: 'n1', name: 'Num', fieldType: 'numeric', isRequired: false },
        { id: 'c1', name: 'Child', fieldType: 'text', parentId: 'sec1', isRequired: false },
        { id: 'parent1', name: 'Parent', fieldType: 'text', isRequired: false }
      ]
    }

    component.buildForm()

    expect(component.questionsArray.length).toBeGreaterThanOrEqual(4)

    const phoneField: any = component.formDetails.fields.find((f: any) => f.fieldType === 'phone number')
    expect(phoneField.validatorsArray.length).toBeGreaterThanOrEqual(3)

    const emailField: any = component.formDetails.fields.find((f: any) => f.fieldType === 'email')
    expect(emailField.validatorsArray.length).toBeGreaterThanOrEqual(1)
  })

  it('getChildQuestionsFormArray, getChildFields and getQuestionControl fallbacks', () => {
    component.surveyForm = fb.group({
      fields: fb.array([
        fb.group({ parentId: ['p'], answer: [''], questionId: ['x'], question: ['Q'], fieldType: ['text'], isNA: [false] })
      ])
    })

    const childArray = component.getChildQuestionsFormArray('p')
    expect(childArray.length).toBe(1)

    component.childFields = [{ parentId: 'p', id: 'x' }]
    expect(component.getChildFields('p').length).toBe(1)

    const ctrl = component.getQuestionControl(99)
    expect(ctrl).toBeDefined()
  })

  it('updateQuestionValues and updateSurveyFormValidity should track control validity', () => {
    const q = fb.group({ answer: ['', Validators.required], questionIndex: [0] })
    component.surveyForm = fb.group({ fields: fb.array([q]) })

    component.updateQuestionValues({ questionIndex: 0, answer: '' })

    const firstCtrl: any = component.questionsArray.controls[0]
    expect(firstCtrl.controls.answer.valid).toBeFalsy()

    firstCtrl.controls.answer.setValue('some')
    component.updateSurveyFormValidity()
    expect(firstCtrl.controls.answer.valid).toBeTruthy()
  })
})