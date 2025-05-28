import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { IResolveResponse } from '@sunbird-cb/utils-v2'
import { WidgetContentService } from '@sunbird-cb/collection/src/lib/_services/widget-content.service'

@Injectable()
export class ChannelsLabelsResolve
   {
  constructor(private contentSvc: WidgetContentService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {

    return this.contentSvc.search({
      pageNo: 0,
      pageSize: 0,
    }).pipe(
      map(data => {
        const labels = data.notToBeShownFilters.find(unit => unit.type === 'labels')
        if (labels) {
          return labels.content
        }
        return []
      }),
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
