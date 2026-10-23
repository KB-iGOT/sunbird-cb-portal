import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

// the channel analytics model this was written against is not in the repo, so the
// response shape is left open
export type IChannelAnalyticsData = Record<string, unknown>

// TODO: move this in some common place
const PROXY_SLAG_V8 = '/LA1'
// const PROXY_SLAG_V8 = `http://kmserver11:6004`

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  constructor(private http: HttpClient) { }
  getContentAnalyticsClient(channelId: string, type: string): Observable<IChannelAnalyticsData> {
    const url = `${PROXY_SLAG_V8}/api/la/contentanalytics?content_id=${channelId}&type=${type}`
    return this.http.get<IChannelAnalyticsData>(url)
  }
}
