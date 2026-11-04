import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { Observable, defer, firstValueFrom, from, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'

const API_END_POINTS = {
  ASSESSMENT_ENROLLMENT: (userId: string) => `/apis/proxies/v8/learner/course/v4/user/enrollment/details/${userId}`,
  EVENT_ENROLLMENT: (userId: string, eventId: string, batchId: string) =>
    `/apis/proxies/v8/user/event/read/${userId}?eventId=${eventId}&batchId=${batchId}`,
  SURVEY_APPLICATIONS: '/apis/proxies/v8/forms/v2/bulkGetApplicationsById',
}

type TProgressState = Exclude<NsCampaignMilestone.TMilestoneState, 'locked'>

interface IEnrollmentRecord {
  status?: number | string
  completionPercentage?: number | string
}

export function toProgressState(record: IEnrollmentRecord | undefined | null): TProgressState {
  if (!record) {
    return 'notStarted'
  }
  if (Number(record.completionPercentage) >= 100 || Number(record.status) === 2) {
    return 'completed'
  }
  return Number(record.status) === 1 ? 'inProgress' : 'notStarted'
}

/** Config decides availability: `enabled: false` or `locked: true` keeps a milestone locked without any API call. */
export function isMilestoneOpenable(milestone: NsCampaignMilestone.IMilestone): boolean {
  return milestone.enabled !== false && !milestone.locked
}

/** Unlocked and not yet completed */
export function isOpenState(state: NsCampaignMilestone.TMilestoneState): boolean {
  return state === 'notStarted' || state === 'inProgress'
}

/** Safe fallback on any failure: openable milestones available, everything else locked (guide §7 stage 8). */
export function fallbackStates(milestones: NsCampaignMilestone.IMilestone[]): NsCampaignMilestone.TMilestoneState[] {
  return milestones.map(milestone => (isMilestoneOpenable(milestone) ? 'notStarted' : 'locked'))
}

@Injectable({
  providedIn: 'root',
})
export class MilestoneStatusService {
  private readonly http = inject(HttpClient)
  private readonly configSvc = inject(ConfigurationsService)

  resolveStates(milestones: NsCampaignMilestone.IMilestone[]): Observable<NsCampaignMilestone.TMilestoneState[]> {
    return defer(() => from(this.resolveAll(milestones))).pipe(
      catchError(error => {
        // tslint:disable-next-line: no-console
        console.error('MilestoneStatusService: status resolution failed', error)
        return of(fallbackStates(milestones))
      }),
    )
  }

  private async resolveAll(
    milestones: NsCampaignMilestone.IMilestone[],
  ): Promise<NsCampaignMilestone.TMilestoneState[]> {
    const userId: string | undefined = this.configSvc.userProfile?.userId
    if (!userId) {
      throw new Error('userId not available')
    }

    const openable = milestones.filter(isMilestoneOpenable)
    const assessmentStates = openable.some(m => m.type === 'assessment')
      ? this.fetchAssessmentStates(userId, openable)
      : undefined

    return Promise.all(milestones.map(async (milestone): Promise<NsCampaignMilestone.TMilestoneState> => {
      if (!isMilestoneOpenable(milestone)) {
        return 'locked'
      }
      switch (milestone.type) {
        case 'assessment':
          return (await assessmentStates)?.get(milestone.identifier || '') || 'notStarted'
        case 'event':
          return this.fetchEventState(userId, milestone)
        case 'survey':
          return this.fetchSurveyState(userId, milestone)
        default:
          return 'notStarted'
      }
    }))
  }

  /** API A: one call covering every openable assessment milestone. Missing course = not enrolled. */
  private async fetchAssessmentStates(
    userId: string,
    milestones: NsCampaignMilestone.IMilestone[],
  ): Promise<Map<string, TProgressState>> {
    const courseId = milestones
      .filter(m => m.type === 'assessment' && m.identifier)
      .map(m => m.identifier as string)
    const response: any = await firstValueFrom(this.http.post(API_END_POINTS.ASSESSMENT_ENROLLMENT(userId), {
      request: { courseId, retiredCoursesEnabled: true },
    }))
    const courses: any[] = response?.result?.courses || []
    return new Map(courseId.map(id => [id, toProgressState(courses.find(c => c?.courseId === id))]))
  }

  /** API B: event enrollment for the logged-in user. Empty result or 404 = not registered. */
  private async fetchEventState(userId: string, milestone: NsCampaignMilestone.IMilestone): Promise<TProgressState> {
    if (!milestone.identifier || !milestone.batchId) {
      return 'notStarted'
    }
    try {
      const response: any = await firstValueFrom(
        this.http.get(API_END_POINTS.EVENT_ENROLLMENT(userId, milestone.identifier, milestone.batchId)),
      )
      const events: any[] = response?.result?.events || []
      return toProgressState(events.find(e => e?.contentId === milestone.identifier))
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return 'notStarted'
      }
      throw error
    }
  }

  /** API C: survey has no in-progress state; completed once a submitted application exists. */
  private async fetchSurveyState(userId: string, milestone: NsCampaignMilestone.IMilestone): Promise<TProgressState> {
    if (!milestone.formId) {
      return 'notStarted'
    }
    const response: any = await firstValueFrom(this.http.post(API_END_POINTS.SURVEY_APPLICATIONS, {
      userId,
      formContextList: [{ formId: milestone.formId, contextId: milestone.formId }],
    }))
    const applications: any[] = response?.result?.response || []
    return applications.some(application => application?.submitted === true) ? 'completed' : 'notStarted'
  }
}
