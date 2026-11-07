import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms'
import { ContentConfig, NsCampaignMilestone, PillConfig } from '@sunbird-cb/consumption'
import dayjs from 'dayjs'

export namespace NsCampaignMicrosite {
  export interface IPageConfig {
    sectionList: ISection[]
    individualSection: IIndividualSection
    eventDetails?: IEventDetails
    /** When the page is open at all; outside it only a "not open yet" / "closed" screen is shown */
    pageAvailability?: IPageAvailability
  }

  /**
   * The window the campaign page is open in, checked against server time on load. Separate from
   * `eventDetails`, which only labels the event. Missing or invalid dates leave that side open.
   */
  export interface IPageAvailability {
    enabled?: boolean
    /** ISO date-time with offset, e.g. "2026-11-05T00:00:00+05:30" (inclusive) */
    startDateTime?: string
    /** ISO date-time with offset (exclusive) */
    endDateTime?: string
    /** Shown before startDateTime; `{{date}}` is the start date */
    notStarted?: IPageAvailabilityMessage
    /** Shown from endDateTime on; `{{date}}` is the end date */
    closed?: IPageAvailabilityMessage
  }

  export interface IPageAvailabilityMessage {
    title?: string
    description?: string
    buttonText?: string
    /** In-app path the button opens, e.g. "/page/home" */
    buttonUrl?: string
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
    contentPills?: IContentPills
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
    /**
     * ISO 8601 with offset, e.g. `2026-11-17T10:00:00+05:30`.
     * Event: decides Register / yet to start / Join / recording.
     * Assessment: unlock time. Before it the card shows "Available from ..." and cannot be opened.
     */
    startDateTime?: string
    /** Event only */
    endDateTime?: string
    /**
     * Assessment: `true` lets a completed assessment still open the player from its card.
     * Default (missing / false): a completed card only shows the green "Completed" and does nothing on click.
     */
    openWhenCompleted?: boolean
    /**
     * Assessment: `true` shows a live countdown on the disabled button until it unlocks
     * ("Opens in 5D 12H", or "Opens in 12H 30M 20S" in the last day). Missing / false: the button keeps its text.
     */
    showCountdown?: boolean
    /**
     * Survey (pledge) backed by an event (`identifier` + `batchId`): the event's duration in minutes,
     * sent in the progress update that marks the event complete after the form is submitted
     */
    eventDurationMinutes?: number
    /**
     * Survey only: character limits for free-text answers. The form read API has no such setting,
     * so they live here. e.g. `[{ "questions": [1, 3, 4], "minLength": 70, "maxLength": 300 }]`
     */
    answerLimits?: IAnswerLimit[]
    /**
     * Survey (pledge) only: open the form by itself on page load while the user has not submitted it,
     * between `startDateTime` and `endDateTime` (server time, with time and offset,
     * e.g. "2026-11-05T10:00:00+05:30"). Opens after the info popup is closed, and again on every page load
     * until submitted. Missing, `enabled: false` or an invalid date: never opens by itself.
     */
    autoOpen?: IAutoOpen
  }

  export interface IAutoOpen {
    enabled?: boolean
    startDateTime?: string
    endDateTime?: string
  }

  /**
   * Character limits and helper text for survey answers. Target questions by `questions` (1-based position
   * among answerable questions, headings and separators not counted) and/or by form field `ids`.
   * Several entries can match one question; each sets only the keys it has.
   */
  export interface IAnswerLimit {
    questions?: number[]
    ids?: string[]
    /** Counted after trimming spaces */
    minLength?: number
    /** Typing stops at this length */
    maxLength?: number
    /** Guidance shown under the question, e.g. an example answer */
    hint?: string
  }

  export interface IAnswerRule {
    minLength?: number
    maxLength?: number
    hint?: string
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
    /** Green tick text that replaces the button on a completed assessment */
    completed: string
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
    /** Assessment button text: not enrolled / enrolled but not finished / finished */
    assessment: {
      start: string
      resume: string
      view: string
      /** Countdown on the disabled button while waiting to unlock (`showCountdown`); `{{time}}` e.g. "5D 12H" */
      opensIn: string
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
      /** Pledge card button until it is submitted */
      start: string
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
      /** Counter under a limited answer; `{{count}}`, `{{max}}` */
      charCount: string
      /** Error under a limited answer that is too short; `{{min}}` */
      minChars: string
      /** Error under a required question left empty (shown once the user has been in it) */
      required: string
    }
  }

  export type IMilestoneLabelsConfig = Partial<Omit<IMilestoneLabels, 'popup' | 'assessment' | 'event' | 'survey'>> & {
    popup?: Partial<IMilestoneLabels['popup']>
    assessment?: Partial<IMilestoneLabels['assessment']>
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

  /**
   * Case studies: a heading over the new content strip (sb-uic-content-strips).
   * `contentConfig.contents` holds the content metadata itself, so the cards need no API call;
   * `contentIds` (looked up one by one) still works when no metadata is given.
   */
  export interface ICaseStudies {
    enabled: boolean
    header?: string
    contentConfig: ContentConfig
  }

  /**
   * A strip with pills, in the homepage's pills-section format (displayType "pills"), drawn by
   * sb-uic-content-strip-with-pills: each pill's cards come from its own contentConfig
   * (`contentIds`, or `contents` metadata). Shown unless `enabled: false` or
   * `visibilityMode: "hidden"`.
   */
  export interface IContentPills {
    enabled?: boolean
    sectionKey?: string
    header?: string
    translateHeader?: boolean
    displayType?: string
    visibilityMode?: string
    defaultPillKey?: string
    /** false shows the active pill as a plain label instead of the enlarged card */
    pillEnlarge?: boolean
    canShowScrollArrow?: boolean
    /** empty-state text for any pill that sets none of its own */
    noDataMessage?: string
    addToAccordian?: boolean
    hideAccordianToggel?: boolean
    pills: PillConfig[]
  }

  export interface ICampaignSurveyDialogData {
    milestone: IMilestone
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
    /** set by buildSurveyForm from the milestone's `answerLimits`; drives the counter under the question */
    answerLimit?: IAnswerRule
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

/**
 * Sankalpa answer limits used when the survey milestone has no `answerLimits` in the page JSON
 * (set `"answerLimits": []` there to turn them off)
 */
export const DEFAULT_SURVEY_ANSWER_LIMITS: NsCampaignMicrosite.IAnswerLimit[] = [
  { questions: [1, 3, 4], minLength: 70, maxLength: 300 },
  {
    questions: [3],
    hint: 'Say what you will do and by when, e.g. "I will review pending citizen grievances with my team every Monday, starting 1 December 2026."',
  },
]

/** Fallback text when the page JSON (`programmeMilestones.labels`) leaves a key out */
export const DEFAULT_MILESTONE_LABELS: NsCampaignMicrosite.IMilestoneLabels = {
  close: 'Close',
  completed: 'Completed',
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
  assessment: {
    start: 'Start Questionnaire',
    resume: 'Resume Questionnaire',
    view: 'View Questionnaire',
    opensIn: 'Opens in {{time}}',
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
    start: 'Take Sankalpa',
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
    charCount: '{{count}}/{{max}}',
    minChars: 'Minimum {{min}} characters',
    required: 'This field is required',
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
  const { popup, assessment, event, survey, ...root } = DEFAULT_MILESTONE_LABELS
  return {
    ...pick(root, config),
    popup: pick(popup, config?.popup),
    assessment: pick(assessment, config?.assessment),
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

/** "17th Nov, 10:00 AM" style date and time */
export function formatOrdinalDateTime(date: Date): string {
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${formatOrdinalDate(date)}, ${time}`
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
  const { minLength, maxLength } = field.answerLimit || {}
  if (minLength) {
    validators.push(minTrimmedLength(minLength))
  }
  if (maxLength) {
    validators.push(Validators.maxLength(maxLength))
  }
  return validators
}

/** Like Validators.minLength, but spaces at either end don't count. Empty is left to `required` */
export function minTrimmedLength(min: number): ValidatorFn {
  return control => {
    const length = typeof control.value === 'string' ? control.value.trim().length : 0
    return length > 0 && length < min ? { minlength: { requiredLength: min, actualLength: length } } : null
  }
}

/** Rules for the answerable question at `position` (1-based), merged over every matching entry; later entries win per key */
export function answerLimitFor(
  limits: NsCampaignMicrosite.IAnswerLimit[] | undefined,
  field: NsCampaignMicrosite.ISurveyField,
  position: number,
): NsCampaignMicrosite.IAnswerRule | undefined {
  let result: NsCampaignMicrosite.IAnswerRule | undefined
  for (const limit of limits || []) {
    const matches = (limit.questions || []).includes(position) || (!!field.id && (limit.ids || []).includes(field.id))
    if (!matches) {
      continue
    }
    const rule: NsCampaignMicrosite.IAnswerRule = {}
    if (Number(limit.minLength) > 0) {
      rule.minLength = Number(limit.minLength)
    }
    if (Number(limit.maxLength) > 0) {
      rule.maxLength = Number(limit.maxLength)
    }
    if (typeof limit.hint === 'string' && limit.hint.trim()) {
      rule.hint = limit.hint.trim()
    }
    if (Object.keys(rule).length) {
      result = { ...result, ...rule }
    }
  }
  return result
}

// Section questions get their own FormArray, built once: wrapping controls in a new array per render re-parents them
export function buildSurveyForm(
  fb: FormBuilder,
  sourceFields: NsCampaignMicrosite.ISurveyField[],
  answerLimits?: NsCampaignMicrosite.IAnswerLimit[],
): NsCampaignMicrosite.ISurveyFormModel {
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

    field.answerLimit = answerLimitFor(answerLimits, field, controls.length + 1)
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
    capAnswerLength(group, field.answerLimit?.maxLength)
    if (field.parentId) {
      (sections[field.parentId] ||= fb.array<FormGroup>([])).push(group)
    } else {
      looseQuestions.push(group)
    }
  }

  const form = fb.group({ questions: looseQuestions, sections: fb.group(sections) })
  return { form, controls, parentFields, childFields, sections }
}

/** Stops typing at `max` characters (the TOC textarea has no maxlength attribute to do it) */
function capAnswerLength(group: FormGroup, max: number | undefined): void {
  if (!max) {
    return
  }
  const answer = group.controls.answer
  answer.valueChanges.subscribe(value => {
    if (typeof value === 'string' && value.length > max) {
      answer.setValue(value.slice(0, max))
    }
  })
}

export function toResponse(group: FormGroup) {
  const { questionId, question, answer, fieldType, isNA } = group.getRawValue()
  let value = isNA ? 'N/A' : answer
  if (!isNA && fieldType === 'date' && value) {
    value = dayjs(value).format('YYYY-MM-DD')
  }
  return { questionId, question, answer: value, answerType: fieldType }
}
