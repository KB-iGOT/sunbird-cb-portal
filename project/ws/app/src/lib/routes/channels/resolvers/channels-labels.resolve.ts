import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { WidgetContentService } from '@sunbird-cb/collection'
import { IResolveResponse } from '@sunbird-cb/utils-v2'

@Injectable()
export class ChannelsLabelsResolve {
  constructor(private contentSvc: WidgetContentService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {

    return this.contentSvc.search({
      pageNo: 0,
      pageSize: 0,
    }).pipe(
      map((data: any) => {
        const labels = data.notToBeShownFilters.find((unit: any) => unit.type === 'labels')
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
