import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IRemoveSubsetResponse, ISearchConfig } from './picker-content.model'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

@Injectable({
  providedIn: 'root',
})
export class PickerContentService {

  private baseUrl = ''
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
  ) {
    this.baseUrl = this.configSvc.sitePath
  }

  removeSubset(contentIds: string[]) {
    return this.http.post<IRemoveSubsetResponse>('/apis/protected/v8/content/removeSubset', { contentIds })
  }

  getSearchConfigs(): Promise<any> {
    return this.http.get<ISearchConfig>(`${this.baseUrl}/feature/search.json`).toPromise()
  }
}
