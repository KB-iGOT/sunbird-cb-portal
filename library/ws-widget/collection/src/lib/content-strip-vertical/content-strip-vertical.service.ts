import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { getStringifiedQueryParams } from '@sunbird-cb/utils-v2'
import { NsContentStripVertical } from './content-strip-vertical.model'

@Injectable({
  providedIn: 'root',
})
export class ContentStripVerticalService {

  constructor(
    private http: HttpClient,
  ) { }

  getContentStripResponseApi(request: NsContentStripVertical.IStripRequestApi, filters?: { [key: string]: string | undefined }):
    Observable<NsContentStripVertical.IContentStripResponseApi> {
    let stringifiedQueryParams = ''
    stringifiedQueryParams = getStringifiedQueryParams({
      pageNo: request.queryParams ? request.queryParams.pageNo : undefined,
      pageSize: request.queryParams ? request.queryParams.pageSize : undefined,
      pageState: request.queryParams ? request.queryParams.pageState : undefined,
      sourceFields: request.queryParams ? request.queryParams.sourceFields : undefined,
      filters: filters ? encodeURIComponent(JSON.stringify(filters)) : undefined,
    })
    let url = request.path
    url += stringifiedQueryParams ? `?${stringifiedQueryParams}` : ''
    return this.http.get<NsContentStripVertical.IContentStripResponseApi>(url)
  }

  transformSearchV6Filters(v6filters: any[]) {
    const filters: any = {}
    v6filters.forEach((f => {
      if (f.andFilters) {
        f.andFilters.forEach((andFilter: any) => {
          Object.keys(andFilter).forEach(key => {
            filters[key] = andFilter[key]
          })

        })
      }
    }))
    return filters
  }
}
