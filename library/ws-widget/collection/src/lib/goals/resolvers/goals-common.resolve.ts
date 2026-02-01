import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { IResolveResponse } from '@sunbird-cb/utils-v2'
import { BtnGoalsService } from '../../btn-goals/btn-goals.service'
import { NsGoal } from '../../btn-goals/btn-goals.model'

@Injectable()
export class GoalsCommonResolve {
  constructor(private goalSvc: BtnGoalsService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsGoal.IGoalsGroup[]>> {
    return this.goalSvc.getCommonGoals().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
