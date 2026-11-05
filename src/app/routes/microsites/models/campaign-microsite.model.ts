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

  /**
   * Player route split into path + query params. Tokens in braces are filled at click time:
   * `{resourceId}`, `{identifier}`, `{name}`, `{batchId}`, `{language}`.
   */
  export interface IMilestonePlayerRoute {
    path: string
    resourceId: string
    queryParams?: Record<string, string>
  }

  /**
   * Milestone config as read by the portal. Extends the card model with fields only the portal uses
   * (enrollment + player routing), so the portal does not depend on a newer @sunbird-cb/consumption.
   */
  export interface IMilestone extends NsCampaignMilestone.IMilestone {
    /** `true` keeps the card closed until `eventDetails.startDate` */
    lockUntilEventStart?: boolean
    /** Assessment only: sent as `?language=` to the auto-enrollment API and fills `{language}` in the player route */
    language?: string
    /**
     * Assessment: question set player opened after enrollment.
     * Event: event-hub player, e.g. `/app/event-hub/player/{identifier}/youtube/{resourceId}` with the video id as `resourceId`.
     */
    player?: IMilestonePlayerRoute
    /** Event only: ISO 8601 with offset, e.g. `2026-11-17T10:00:00+05:30`. Decides Register / yet to start / Join / recording */
    startDateTime?: string
    endDateTime?: string
    /**
     * Survey (pledge) backed by an event (`identifier` + `batchId`): the event's duration in minutes,
     * sent in the progress update that marks the event complete after the form is submitted
     */
    eventDurationMinutes?: number
  }

  export interface IProgrammeMilestones {
    enabled: boolean
    title: string
    items: IMilestone[]
    popup?: IMilestonePopup
    /** UI text; not localized because campaign copy changes often. Missing keys fall back to DEFAULT_MILESTONE_LABELS */
    labels?: IMilestoneLabelsConfig
  }

  /** `{{number}}` in popup labels is replaced with the 1-based milestone position */
  export interface IMilestoneLabels {
    close: string
    journeyComplete: string
    enrollError: string
    popup: {
      availableNow: string
      /** Shown while a `lockUntilEventStart` milestone waits for `eventDetails.startDate`; `{{date}}` e.g. "17th Nov" */
      availableFrom: string
      inProgress: string
      completed: string
      locked: string
      milestone: string
      /** Footer button; closes the popup */
      okay: string
    }
    /** Event button text by phase */
    event: {
      register: string
      upcoming: string
      join: string
      recording: string
      registered: string
      registerError: string
    }
    survey: {
      cancel: string
      submit: string
      commitment: string
      retry: string
      loadError: string
      submitted: string
      submitError: string
      alreadySubmitted: string
      /** Button on a completed event-backed pledge */
      downloadCertificate: string
      /** Shown when the pledge is completed but no certificate has been issued yet */
      certificatePending: string
      certificateError: string
    }
  }

  export type IMilestoneLabelsConfig = Partial<Omit<IMilestoneLabels, 'popup' | 'event' | 'survey'>> & {
    popup?: Partial<IMilestoneLabels['popup']>
    event?: Partial<IMilestoneLabels['event']>
    survey?: Partial<IMilestoneLabels['survey']>
  }

  export interface IMilestonePopup {
    enabled: boolean
    /** When set (and it loads), the popup shows only this image with a close button; otherwise the text below */
    image?: string
    /** Accessible description of `image`; falls back to `title` */
    imageAlt?: string
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
    labels: IMilestoneLabels
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

/** Fallback text when the page JSON (`programmeMilestones.labels`) leaves a key out */
export const DEFAULT_MILESTONE_LABELS: NsCampaignMicrosite.IMilestoneLabels = {
  close: 'Close',
  journeyComplete: 'Journey complete! You have finished every milestone of this programme.',
  enrollError: 'We couldn\'t start this assessment. Please try again.',
  popup: {
    availableNow: 'Available now',
    availableFrom: 'Available from {{date}}',
    inProgress: 'In progress',
    completed: 'Completed',
    locked: 'Locked',
    milestone: 'Milestone {{number}}',
    okay: 'Okay',
  },
  event: {
    register: 'Register',
    upcoming: 'Event yet to start',
    join: 'Join event',
    recording: 'View recording',
    registered: 'You are registered. Come back when the event starts.',
    registerError: 'We couldn\'t register you for this event. Please try again.',
  },
  survey: {
    cancel: 'Cancel',
    submit: 'Submit',
    commitment: 'I commit to strengthening my leadership practice through one meaningful change, within my own authority, for the citizens I serve.',
    retry: 'Try again',
    loadError: 'We couldn\'t load this form. Please try again.',
    submitted: 'Thank you! Your response has been submitted.',
    submitError: 'Something went wrong. Please try again.',
    alreadySubmitted: 'You have already submitted this form.',
    downloadCertificate: 'Download certificate',
    certificatePending: 'Kindly be patient. The certificate generation normally takes up to 24 hours, however, it might take longer sometimes. '
      + 'If the issue persists, please mail us at mission.karmayogi@gov.in',
    certificateError: 'We couldn\'t load your certificate. Please try again.',
  },
}

/** Config labels over the defaults; empty strings count as missing */
export function resolveMilestoneLabels(
  config: NsCampaignMicrosite.IMilestoneLabelsConfig | undefined,
): NsCampaignMicrosite.IMilestoneLabels {
  const pick = <T extends Record<string, string>>(defaults: T, overrides: Partial<T> | undefined): T => {
    const result: Record<string, string> = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const value: unknown = overrides?.[key]
      if (typeof value === 'string' && value.trim()) {
        result[key] = value
      }
    }
    return result as T
  }
  const { popup, event, survey, ...root } = DEFAULT_MILESTONE_LABELS
  return {
    ...pick(root, config),
    popup: pick(popup, config?.popup),
    event: pick(event, config?.event),
    survey: pick(survey, config?.survey),
  }
}

/** "17th Nov" style date */
export function formatOrdinalDate(date: Date): string {
  const day = date.getDate()
  const teen = day % 100 >= 11 && day % 100 <= 13
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] || 'th'
  const month = date.toLocaleString('en-GB', { month: 'short' })
  return `${day}${suffix} ${month}`
}

/** Replaces `{{name}}` placeholders, e.g. formatLabel('Milestone {{number}}', { number: 2 }) */
export function formatLabel(text: string, params: Record<string, string | number> = {}): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
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
