import { Injectable } from '@angular/core'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { IResolveResponse } from '@sunbird-cb/utils-v2'
import { FeedbackService } from '../../btn-content-feedback-v2/services/feedback.service'
import { IFeedbackConfig } from '../../btn-content-feedback-v2/models/feedback.model'

@Injectable()
export class FeedbackConfigResolver {
  constructor(private feedbackApi: FeedbackService) { }

  resolve(): Observable<IResolveResponse<IFeedbackConfig>> {
    try {
      return this.feedbackApi.getFeedbackConfig().pipe(
        map(config => {
          return {
            data: config,
            error: null,
          }
        }),
        catchError(() => {
          const result: IResolveResponse<IFeedbackConfig> = {
            data: null,
            error: 'FEEDBACK_CONFIG_API_ERROR',
          }

          return of(result)
        }),
      )
    } catch (err) {
      const result: IResolveResponse<IFeedbackConfig> = {
        data: null,
        error: 'FEEDBACK_CONFIG_RESOLVER_ERROR',
      }
      return of(result)
    }
  }
}
