import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms'
import { NsCampaignMilestone, NsContentStripWithTabs } from '@sunbird-cb/consumption'
import dayjs from 'dayjs'

export namespace NsCampaignMicrosite {
  export interface IPageConfig {
    sectionList: ISection[]
    individualSection: IIndividualSection
    eventDetails?: IEventDetails
  }

  export interface ISection {
    enabled: boolean
    key: string
    title?: string
    order?: number
    wrapperClass?: string
    column: IColumn[]
  }

  export interface IColumn {
    enabled: boolean
    key: string
    title?: string
    colspan?: number
    data: any
  }

  export interface IIndividualSection {
    programmeMilestones?: IProgrammeMilestones
    caseStudies?: ICaseStudies
  }

  export type TIndividualSectionKey = keyof IIndividualSection

  export interface IMainContent {
    containerClass?: string
    mobileKeys?: TIndividualSectionKey[]
    deskTopKeys?: {
      leftContent?: IContentArea
      rightContent?: IContentArea
    }
  }

  export interface IContentArea {
    colspan?: number
    data: TIndividualSectionKey[]
  }

  export interface IEventDetails {
    startDate: string
    endDate: string
  }

  export interface IProgrammeMilestones {
    enabled: boolean
    title: string
    items: NsCampaignMilestone.IMilestone[]
    popup?: IMilestonePopup
  }

  export interface IMilestonePopup {
    enabled: boolean
    eyebrow?: string
    title?: string
    description?: string
    note?: string
    helpText?: string
    steps?: IMilestonePopupStep[]
  }

  export type TMilestonePopupIcon = 'assessment' | 'event' | 'progress' | 'pledge'
  export type TMilestonePopupColor = 'navy' | 'green' | 'teal' | 'orange'

  export interface IMilestonePopupStep {
    order: number
    title?: string
    description?: string
    icon?: TMilestonePopupIcon
    color?: TMilestonePopupColor
  }

  export interface ICaseStudies {
    enabled: boolean
    contentStrip: NsContentStripWithTabs.IContentStripMultiple
  }

  export interface ICampaignSurveyDialogData {
    milestone: NsCampaignMilestone.IMilestone
  }

  export interface ISurveyField {
    id?: string
    name?: string
    fieldType: string
    isRequired?: boolean
    parentId?: string
    sectionId?: string
    values?: any[]
    // set by buildSurveyForm; read by the TOC question/section components
    controlIndex?: number
    validatorsArray?: ValidatorFn[]
  }

  export interface ISurveyFormDetails {
    title: string
    fields: ISurveyField[]
    contextType: string
    version: number
  }

  export interface ISurveyFormModel {
    form: FormGroup
    controls: FormGroup[]
    parentFields: ISurveyField[]
    childFields: Record<string, ISurveyField[]>
    sections: Record<string, FormArray>
  }
}

export const EMAIL_PATTERN = /^[a-zA-Z0-9]+[a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+([-a-zA-Z0-9]*[a-zA-Z0-9]+)?(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,4}$/
export const MOBILE_PATTERN = /^[0]?[6789]\d{9}$/
export const LAYOUT_TYPES = ['heading', 'separator']

export const SURVEY_LABELS = {
  close: 'campaignMicrosite.close',
  cancel: 'campaignMicrosite.survey.cancel',
  submit: 'campaignMicrosite.survey.submit',
  commitment: 'campaignMicrosite.survey.commitment',
  retry: 'campaignMicrosite.survey.retry',
  loadError: 'campaignMicrosite.survey.loadError',
  submitted: 'campaignMicrosite.survey.submitted',
  submitError: 'campaignMicrosite.survey.submitError',
}

export function toFormDetails(response: any): NsCampaignMicrosite.ISurveyFormDetails {
  const form = response?.result?.response || {}
  return {
    title: form.title || '',
    fields: Array.isArray(form.fields) ? form.fields : [],
    contextType: form.contextType || 'form',
    version: Number(form.version) || 1,
  }
}

export function validatorsFor(field: NsCampaignMicrosite.ISurveyField): ValidatorFn[] {
  const validators: ValidatorFn[] = field.isRequired ? [Validators.required] : []
  if (field.fieldType === 'phone number') {
    validators.push(Validators.pattern(MOBILE_PATTERN), Validators.minLength(10), Validators.maxLength(10))
  } else if (field.fieldType === 'email') {
    validators.push(Validators.pattern(EMAIL_PATTERN))
  }
  return validators
}

// Section questions get their own FormArray, built once: wrapping controls in a new array per render re-parents them
export function buildSurveyForm(fb: FormBuilder, sourceFields: NsCampaignMicrosite.ISurveyField[]): NsCampaignMicrosite.ISurveyFormModel {
  const controls: FormGroup[] = []
  const parentFields: NsCampaignMicrosite.ISurveyField[] = []
  const childFields: Record<string, NsCampaignMicrosite.ISurveyField[]> = {}
  const sections: Record<string, FormArray> = {}
  const looseQuestions = fb.array<FormGroup>([])

  for (const field of sourceFields.map(f => ({ ...f }))) {
    if (field.parentId) {
      (childFields[field.parentId] ||= []).push(field)
    } else {
      parentFields.push(field)
    }
    if (LAYOUT_TYPES.includes(field.fieldType)) {
      continue
    }

    const validators = validatorsFor(field)
    const group = fb.group({
      question: [field.name],
      parentId: [field.parentId],
      questionIndex: [controls.length],
      fieldType: [field.fieldType],
      answer: ['', validators],
      isNA: [false],
      questionId: [field.id],
    })
    field.controlIndex = controls.length
    field.validatorsArray = validators
    controls.push(group)
    if (field.parentId) {
      (sections[field.parentId] ||= fb.array<FormGroup>([])).push(group)
    } else {
      looseQuestions.push(group)
    }
  }

  const form = fb.group({ questions: looseQuestions, sections: fb.group(sections) })
  return { form, controls, parentFields, childFields, sections }
}

export function toResponse(group: FormGroup) {
  const { questionId, question, answer, fieldType, isNA } = group.getRawValue()
  let value = isNA ? 'N/A' : answer
  if (!isNA && fieldType === 'date' && value) {
    value = dayjs(value).format('YYYY-MM-DD')
  }
  return { questionId, question, answer: value, answerType: fieldType }
}
