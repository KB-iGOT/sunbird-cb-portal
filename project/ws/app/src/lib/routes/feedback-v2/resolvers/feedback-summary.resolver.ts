import { Injectable } from '@angular/core'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { FeedbackService } from '@sunbird-cb/collection/src/lib/btn-content-feedback-v2/services/feedback.service'
import { IFeedbackSummary } from '@sunbird-cb/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { IResolveResponse } from '@sunbird-cb/utils-v2'

@Injectable()
export class FeedbackSummaryResolver  {
  constructor(private feedbackApi: FeedbackService) {}

  resolve(): Observable<IResolveResponse<IFeedbackSummary>> {
    try {
      return this.feedbackApi.getFeedbackSummary().pipe(
        map(summary => {
          return {
            data: summary,
            error: null,
          }
        }),
        catchError(() => {
          const result: IResolveResponse<IFeedbackSummary> = {
            data: null,
            error: 'FEEDBACK_SUMMARY_API_ERROR',
          }

          return of(result)
        }),
      )
    } catch (err) {
      const result: IResolveResponse<IFeedbackSummary> = {
        data: null,
        error: 'FEEDBACK_SUMMARY_RESOLVER_ERROR',
      }
      return of(result)
    }
  }
}
