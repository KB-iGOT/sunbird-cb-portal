import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

const API_END_POINTS = {
  INSIGHTS: `apis/proxies/v8/read/user/insights`,
  DISCUSSIONS: `apis/proxies/v8/discussion/user/`,
  NETWORK: `apis/protected/v8/connections/v2/connections/recommended`,
  ADD_CONNECTION: `apis/protected/v8/connections/v2/add/connection`,
  UPDATE_CONNECTION: `apis/protected/v8/connections/v2/update/connection`,
  CONN_REQUESTED: `apis/protected/v8/connections/v2/connections/requests/received`,
  TRENDING_DISCUSSION: `apis/proxies/v8/discussion/popular`,  
}

@Injectable({
  providedIn: 'root'
})

export class HomePageService {
  
  constructor(private http: HttpClient) { }

  getInsightsData(payload:any){
    const result = this.http.post(API_END_POINTS.INSIGHTS, payload)
    return result
  }

  getDiscussionsData(username: string): Observable<any> {
    return this.http.get(API_END_POINTS.DISCUSSIONS+username);
  }

  getNetworkRecommendations(payload: any): Observable<any> {
    return this.http.post(API_END_POINTS.NETWORK, payload);
  }

  connectToNetwork(payload: any): Observable<any> {
    return this.http.post(API_END_POINTS.ADD_CONNECTION, payload);
  }

  updateConnection(payload: any): Observable<any> {
    return this.http.post(API_END_POINTS.UPDATE_CONNECTION, payload);
  }

  getRecentRequests(): Observable<any> {
    return this.http.get(API_END_POINTS.CONN_REQUESTED);
  }

  getTrendingDiscussions(): Observable<any> {
    return this.http.get(API_END_POINTS.TRENDING_DISCUSSION);
  }
}
