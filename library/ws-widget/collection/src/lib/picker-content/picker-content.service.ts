import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IRemoveSubsetResponse, ISearchConfig } from './picker-content.model'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

@Injectable({
  providedIn: 'root',
})
export class PickerContentService {

  private baseUrl = this.configSvc.sitePath

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
  ) { }

  removeSubset(contentIds: string[]) {
    return this.http.post<IRemoveSubsetResponse>('/apis/protected/v8/content/removeSubset', { contentIds })
  }

  // served from global-config (searchData); search.json is only the fallback
  getSearchConfigs(): Promise<ISearchConfig | any> {
    const fromGlobalConfig = this.configSvc.globalConfig?.searchData
    if (fromGlobalConfig) {
      return Promise.resolve(fromGlobalConfig)
    }
    return this.http.get<ISearchConfig>(`${this.baseUrl}/feature/search.json`).toPromise()
  }
}
