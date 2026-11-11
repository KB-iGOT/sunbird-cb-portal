import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { BtnGoalsService } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.service'
import { NsGoal } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.model'
import { IResolveResponse } from '@sunbird-cb/utils-v2'

@Injectable()
export class GoalsUserResolve
   {
  constructor(private goalSvc: BtnGoalsService) {}

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsGoal.IUserGoals>> {
    return this.goalSvc.getUserGoals(NsGoal.EGoalTypes.USER, 'isInIntranet').pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
