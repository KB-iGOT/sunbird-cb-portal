import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { TreeCatalogService } from '@sunbird-cb/collection'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ITopic, ITopicRecommended } from '../interface/interest'

const PROTECTED_SLAG_V8 = `/apis/protected/v8`
const API_END_POINTS = {
  userTopics: `${PROTECTED_SLAG_V8}/user/topics`,
  addMultiple: `${PROTECTED_SLAG_V8}/user/topics/addMultiple`,
  recommendedTopics: `${PROTECTED_SLAG_V8}/user/topics/suggested`,
  autocompleteTopics: `${PROTECTED_SLAG_V8}/user/topics/autocomplete`,
  competencyTopics: `${PROTECTED_SLAG_V8}/competency/searchCompetency`,
  addCompetency: `${PROTECTED_SLAG_V8}/competency/addCompetency`,
}

@Injectable({
  providedIn: 'root',
})
export class InterestService {
  constructor(private http: HttpClient, private treeCatalogSvc: TreeCatalogService) { }

  fetchUserInterests(): Observable<string[]> {
    return this.http
      .get<ITopic[]>(`${API_END_POINTS.userTopics}?ts=${new Date().getTime()}`)
      .pipe(map(u => u.map((topic: ITopic) => topic.name)))
  }

  fetchSuggestedInterests(): Observable<string[]> {
    return this.http
      .get<ITopicRecommended[]>(`${API_END_POINTS.recommendedTopics}`)
      .pipe(map(u => u.map((topic: ITopicRecommended) => topic.name)))
  }

  modifyUserInterests(topics: string[]) {
    return this.http.post(API_END_POINTS.userTopics, { topics })
  }

  fetchAutocompleteInterests(): Observable<string[]> {
    return this.treeCatalogSvc.getFullCatalog().pipe(
      map((catalogDataTree: any) => {
        const leafNodes: any[] = []
        catalogDataTree.forEach((catalogUnit: any) => {
          leafNodes.push(...this.getLeafNodes(catalogUnit, []))
        })
        return leafNodes.map(unitItem => unitItem.displayName)
      }),
    )
  }
  getLeafNodes(node: any, nodes: any[]): any[] {
    if ((node.children || []).length === 0) {
      nodes.push(node)
    } else {
      if (node.children) {
        node.children.forEach((child: any) => {
          this.getLeafNodes(child, nodes)
        })
      }
    }
    return nodes
  }

  // V2 Interest code
  fetchUserInterestsV2(): Observable<string[]> {
    return this.http.get<string[]>(`${API_END_POINTS.userTopics}/v2?ts=${new Date().getTime()}`)
  }

  addUserInterest(interestVal: string) {
    return this.http.patch(`${API_END_POINTS.userTopics}`, { interest: interestVal })
  }

  addUserMultipleInterest(interestVal: string[]) {
    return this.http.patch(`${API_END_POINTS.addMultiple}`, { interest: interestVal })
  }

  removeUserInterest(interestVal: string) {
    return this.http.request('delete', `${API_END_POINTS.userTopics}`, { body: { interest: interestVal } })
  }

  fetchSuggestedInterestV2(): Observable<string[]> {
    return this.http.get<string[]>(`${API_END_POINTS.recommendedTopics}`)
  }

  fetchAutocompleteInterestsV2(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${API_END_POINTS.autocompleteTopics}?query=${query}`)
  }
  fetchAutocompleteCompetencyV2(query: string): Observable<any[]> {
    const comp = 'COMPETENCY'
    const arrayData = []

    const firstRequest = {
      type: comp,
      field: 'name',
      keyword: query,
    }
    const secondObj = {
      type: comp,
      field: 'status',
      keyword: 'VERIFIED',
    }
    arrayData.push(firstRequest)
    arrayData.push(secondObj)
    const finalObj = { searches: arrayData }
    return this.http
      .post<any>(`${API_END_POINTS.competencyTopics}`, finalObj)
      .pipe(
        map(data => data.responseData.map((item: { name: any }) => item))
      )
  }

  createPost(data: any) {
    return this.http.post(`${API_END_POINTS.addCompetency}`, data)
  }

}
