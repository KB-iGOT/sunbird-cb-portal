import { Injectable } from '@angular/core'
import { Subject, Observable, Subscription, BehaviorSubject, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { NsContent } from './widget-content.model'

export { NsAppToc, NsCohorts } from './app-toc.model'
import { NsAppToc, NsCohorts } from './app-toc.model'
import { TFetchStatus, ConfigurationsService } from '@sunbird-cb/utils-v2'
// tslint:disable-next-line
import * as _ from 'lodash'


const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const PROXY_SLAG_V8 = '/apis/proxies/v8'

const API_END_POINTS = {
  BATCH_CREATE: `${PROXY_SLAG_V8}/learner/course/v1/batch/create`,
  CONTENT_PARENTS: `${PROTECTED_SLAG_V8}/content/parents`,
  CONTENT_NEXT: `${PROTECTED_SLAG_V8}/content/next`,
  CONTENT_HISTORYV2: `/apis/proxies/v8/read/content-progres`,
  CONTENT_PARENT: (contentId: string) => `${PROTECTED_SLAG_V8}/content/${contentId}/parent`,
  CONTENT_AUTH_PARENT: (contentId: string, rootOrg: string, org: string) =>
    `/apis/authApi/action/content/parent/hierarchy/${contentId}?rootOrg=${rootOrg}&org=${org}`,
  COHORTS: (cohortType: NsCohorts.ECohortTypes, contentId: string) =>
    `${PROTECTED_SLAG_V8}/cohorts/${cohortType}/${contentId}`,
  EXTERNAL_CONTENT: (contentId: string) =>
    `${PROTECTED_SLAG_V8}/content/external-access/${contentId}`,
  COHORTS_GROUP_USER: (groupId: number) => `${PROTECTED_SLAG_V8}/cohorts/${groupId}`,
  RELATED_RESOURCE: (contentId: string, contentType: string) =>
    `${PROTECTED_SLAG_V8}/khub/fetchRelatedResources/${contentId}/${contentType}`,
  POST_ASSESSMENT: (contentId: string) =>
    `${PROTECTED_SLAG_V8}/user/evaluate/post-assessment/${contentId}`,
  GET_CONTENT: (contentId: string) =>
    `${PROXY_SLAG_V8}/action/content/v3/read/${contentId}`,
  CERT_DOWNLOAD: (certId: any) => `${PROTECTED_SLAG_V8}/cohorts/course/batch/cert/download/${certId}`,
  SERVER_DATE: 'apis/public/v8/systemDate',
  SHARE_CONTENT: '/apis/proxies/v8/user/v1/content/recommend',
  GET_FORM_BYID: (formId: string) => `apis/proxies/v8/forms/v2/getFormById?formId=${formId}`,
  SUBMIT_FORM: `apis/proxies/v8/forms/v2/saveFormSubmit`,
  GET_FORM_BYID_PUBLIC: (formId: string) => `apis/public/v8/public/forms/v2/getFormById?formId=${formId}`,
  SUBMIT_FORM_PUBLIC: `apis/public/v8/public/forms/v2/saveFormSubmit`,
  GET_APPLICATIONS_BY_ID: (formId: string, contextId: string) => `/apis/proxies/v8/forms/v2/getApplicationsById?formId=${formId}&contextId=${contextId}`,
  AI_RESOURCE_VTT_FILE: `${PROXY_SLAG_V8}/chatbot/v3/transcoder/stats`,
  PRE_ENROLLMENT_STATE_READ: `/apis/proxies/v8/content/v2/state/read`,
  CREATE_RESOURCE: `apis/proxies/v8/action/content/v3/create`,
  READ_RESOURCE: `apis/proxies/v8/action/content/v3/`,
  UPLOAD_FILE: `apis/proxies/v8/upload/action/content/v3/`,
  UPDATE_RESOURCE: `apis/proxies/v8/action/content/v3/update`,
  SEARCH: `apis/proxies/v8/assignment/v1/search`,
  SUBMIT_DRAFT_ASSIGNMENT: `apis/proxies/v8/assignment/v1/submitDraft`,
  SUBMIT_ASSIGNMENT: `apis/proxies/v8/assignment/v1/submit`,
  ASSIGNMENT_STATUS: `apis/proxies/v8/forms/v2/submissions/search`,
  UPLOAD_ASSIGNMENT: `apis/proxies/v8/storage/v1/bp/assignment/answer`,
  READ_ASSIGNMENT: `apis/proxies/v8/storage/v1/bp/assignment/answer/read/file`,
  NOTIFY_ASSIGNMENT_SUBMISSION: `apis/proxies/v8/v1/notifyAssignment/submit`,
}

@Injectable({
  providedIn: 'root',
})
export class AppTocService {
  analyticsReplaySubject: Subject<any> = new Subject()
  analyticsFetchStatus: TFetchStatus = 'none'
  batchReplaySubject: Subject<any> = new Subject()
  setBatchDataSubject: Subject<any> = new Subject()
  getSelectedBatch: Subject<any> = new Subject()
  setWFDataSubject: Subject<any> = new Subject()
  resumeData: Subject<NsContent.IContinueLearningData | null> = new Subject<any>()
  private showSubtitleOnBanners = false
  private canShowDescription = false
  resumeDataSubscription: Subscription | null = null
  primaryCategory = NsContent.EPrimaryCategory
  private updateReviews = new BehaviorSubject(false)
  updateReviewsObservable = this.updateReviews.asObservable()
  public serverDate = new BehaviorSubject('')
  currentServerDate = this.serverDate.asObservable()
  public contentLoader = new BehaviorSubject(false)
  contentLoader$ = this.contentLoader.asObservable()
  public getPageScroll = new BehaviorSubject(true)
  updatePageScroll = this.getPageScroll.asObservable()
  public hashmap: any = {}
  private transriptionDataSubject = new BehaviorSubject<any>(null); // Start with null
  transcriptionData$ = this.transriptionDataSubject.asObservable();
  public transriptionActiveLanguageDataObject = new BehaviorSubject<any>(null);
  public transriptionActiveLanguageDataObject$ = this.transriptionActiveLanguageDataObject.asObservable();
  public transriptionIdentifier = new Subject(); // Start with null
  changeTranscriptionLanguageEvent = new Subject()
  playTranscriptionVideo = new Subject()
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) {
    this.resumeDataSubscription = this.resumeData.subscribe(
      (_dataResult: any) => {
      })
  }

  get subtitleOnBanners(): boolean {
    return this.showSubtitleOnBanners
  }
  set subtitleOnBanners(val: boolean) {
    this.showSubtitleOnBanners = val
  }
  get showDescription(): boolean {
    return this.canShowDescription
  }
  set showDescription(val: boolean) {
    this.canShowDescription = val
  }

  updateBatchData() {
    this.batchReplaySubject.next({})
  }

  setBatchData(data: NsContent.IBatchListResponse) {
    this.setBatchDataSubject.next(data)
  }

  setWFData(data: any) {
    this.setWFDataSubject.next(data)
  }

  updateResumaData(data: any) {
    this.resumeData.next(data)
  }

  changeUpdateReviews(state: boolean) {
    this.updateReviews.next(state)
  }
  getSelectedBatchData(data: any) {
    this.getSelectedBatch.next(data)
  }

  changeServerDate(state: any) {
    this.serverDate.next(state)
  }

  mapSessionCompletionPercentage(batchData: any, resumeDataPass?: any) {
    if (resumeDataPass && resumeDataPass.length) {
      if (resumeDataPass && resumeDataPass.length && batchData.content && batchData.content.length) {
        this.sessionCompletionPercentage(batchData, resumeDataPass)
      }
    } else {
      this.resumeDataSubscription = this.resumeData.subscribe(
        (dataResult: any) => {
          if (dataResult && dataResult.length && batchData.content && batchData.content.length) {
            this.sessionCompletionPercentage(batchData, dataResult)
          }
        },
        () => {
          console.log('error on resumeDataSubscription')
          this.contentLoader.next(false)
        })
    }
  }

  sessionCompletionPercentage(batchData: any, resumeDataPass: any) {
    if (resumeDataPass && resumeDataPass.length) {
      if (batchData && batchData.content[0] &&
        batchData.content[0].batchAttributes &&
        batchData.content[0].batchAttributes.sessionDetails_v2
      ) {
        batchData.content[0].batchAttributes.sessionDetails_v2.map((sd: any) => {
          const foundContent = resumeDataPass.find((el: any) => el.contentId === sd.sessionId)
          if (foundContent) {
            sd.completionPercentage = foundContent.completionPercentage
            sd.completionStatus = foundContent.status
            sd.lastCompletedTime = foundContent.lastCompletedTime
          }
        })
        this.contentLoader.next(false)
      }
    }
  }

  showStartButton(content: NsContent.IContent | null): { show: boolean; msg: string } {
    const status = {
      show: false,
      msg: '',
    }
    if (content) {
      if (
        content.artifactUrl && content.artifactUrl.match(/youtu(.)?be/gi) &&
        this.configSvc.userProfile &&
        this.configSvc.userProfile.country === 'China'
      ) {
        status.show = false
        status.msg = 'youtubeForbidden'
        return status
      }
      if (content.resourceType !== 'Certification') {
        status.show = true
        return status
      }
    }
    return status
  }

  initData(data: any, needResumeData: boolean = false): NsAppToc.IWsTocResponse {
    let content: NsContent.IContent | null = null
    let errorCode: NsAppToc.EWsTocErrorCode | null = null
    this.contentLoader.next(true)
    if (data.content && data.content.data && data.content.data.identifier) {
      content = data.content.data
      if (needResumeData) {
        this.resumeDataSubscription = this.resumeData.subscribe(
          (dataResult: any) => {
            if (dataResult && dataResult.length) {
              this.contentLoader.next(true)
              this.mapCompletionPercentage(content, dataResult)
            }
          },
          () => {
            console.log('error on resumeDataSubscription')
          },
        )
      } else {
        this.contentLoader.next(false)
      }
    } else {
      this.contentLoader.next(false)
      if (data.error) {
        errorCode = NsAppToc.EWsTocErrorCode.API_FAILURE
      } else {
        errorCode = NsAppToc.EWsTocErrorCode.NO_DATA
      }
    }
    return {
      content,
      errorCode,
    }
  }

  mapCompletionPercentage(content: NsContent.IContent | null, dataResult: any) {
    if (content && content.children) {
      content.children.map(child => {
        const foundContent = dataResult.find((el: any) => el.contentId === child.identifier)
        if (foundContent) {
          child.completionPercentage = foundContent.completionPercentage || foundContent.progress
          child.completionStatus = foundContent.status
        } else {
          this.mapCompletionPercentage(child, dataResult)
        }
      })
      this.contentLoader.next(false)
    } else {
      this.contentLoader.next(false)
    }
  }

  mapModuleCount(content: NsContent.IContent) {
    if (content && content.children) {
      content.children.map(child => {
        if (child.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
          content['moduleCount'] = content['moduleCount'] ? content['moduleCount'] + 1 : 1
        }
        if (child.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
          this.mapModuleCount(child)
        }
      })
    }
  }

  getMimeType(content: NsContent.IContent, identifier: string): NsContent.EMimeTypes {
    if (content.identifier === identifier) {
      return content.mimeType
    }
    if (content && content.children) {
      if (content.children.length === 0) {
        return content.mimeType
      }
      const flatList: any[] = []
      const getAllItemsPerChildren: any = (item: NsContent.IContent) => {
        flatList.push(item)
        if (item.children) {
          return item.children.map((i: NsContent.IContent) => getAllItemsPerChildren(i))
        }
        return
      }
      getAllItemsPerChildren(content)
      const chld = _.first(_.filter(flatList, { identifier }))
      return (chld && chld.mimeType) || ''
    }
    return NsContent.EMimeTypes.UNKNOWN
  }

  getTocStructure(
    content: NsContent.IContent,
    tocStructure: NsAppToc.ITocStructure,
  ): NsAppToc.ITocStructure {
    if (
      content &&
      !(content.primaryCategory === this.primaryCategory.RESOURCE
        || content.primaryCategory === this.primaryCategory.PRACTICE_RESOURCE
        || content.primaryCategory === this.primaryCategory.FINAL_ASSESSMENT
        || content.primaryCategory === this.primaryCategory.OFFLINE_SESSION
      )) {
      if (content.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
        tocStructure.course += 1
      } else if (content.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
        tocStructure.learningModule += 1
      }
      _.each(content.children, child => {
        tocStructure = this.getTocStructure(child, tocStructure)
      })
    } else if (
      content &&
      (
        content.primaryCategory === NsContent.EPrimaryCategory.RESOURCE
        || content.primaryCategory === NsContent.EPrimaryCategory.PRACTICE_RESOURCE
        || content.primaryCategory === NsContent.EPrimaryCategory.FINAL_ASSESSMENT
        || content.primaryCategory === NsContent.EPrimaryCategory.OFFLINE_SESSION)
    ) {
      switch (content.mimeType) {
        case NsContent.EMimeTypes.MP3:
          tocStructure.podcast += 1
          break
        case NsContent.EMimeTypes.MP4:
        case NsContent.EMimeTypes.M3U8:
        case NsContent.EMimeTypes.YOUTUBE:
          tocStructure.video += 1
          break
        case NsContent.EMimeTypes.PDF:
          tocStructure.pdf += 1
          break
        case NsContent.EMimeTypes.TEXT_WEB:
          tocStructure.webPage += 1
          break
        case NsContent.EMimeTypes.SURVEY:
          tocStructure.survey += 1
          break
        case NsContent.EMimeTypes.QUIZ:
        case NsContent.EMimeTypes.APPLICATION_JSON:
          tocStructure.assessment += 1
          break
        case NsContent.EMimeTypes.OFFLINE_SESSION:
          tocStructure.offlineSession += 1
          break
        case NsContent.EMimeTypes.PRACTICE_RESOURCE:
          if (content.primaryCategory === this.primaryCategory.PRACTICE_RESOURCE) {
            tocStructure.practiceTest += 1
          } else if (content.primaryCategory === this.primaryCategory.FINAL_ASSESSMENT) {
            tocStructure.finalTest += 1
          }
          break
        case NsContent.EMimeTypes.ZIP2:
        case NsContent.EMimeTypes.ZIP:
          tocStructure.interactivecontent += 1
          break
        default:
          tocStructure.other += 1
          break
      }
      return tocStructure
    }
    return tocStructure
  }

  fetchContentHistoryV2(req: any): Observable<any> {
    return this.http.post(API_END_POINTS.CONTENT_HISTORYV2, req)
  }

  findEnrolmentByCollectionId(enrolmentList: any, collectionId: string) {
    return _.find(enrolmentList, { collectionId })
  }

  async mapCompletionChildPercentageProgram(content: NsContent.IContent) {
    if (content.children) {
      content.children.forEach(async child => {
        child.completionPercentage = 100
        child.completionStatus = 2
        await this.mapCompletionChildPercentageProgram(child)
      })
    }
  }

  callHirarchyProgressHashmap(content: NsContent.IContent) {
    if (content.identifier) {
      this.hashmap[content.identifier] = content.completionPercentage
    }
    if (content.children) {
      content.children.forEach(child => {
        this.callHirarchyProgressHashmap(child)
      })
    }
  }

  checkModuleWiseData(content: NsContent.IContent) {
    if (content.children) {
      content.children.forEach(child => {
        if (child.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
          child.completionPercentage = this.hashmap[child.identifier]
        }
        this.checkModuleWiseData(child)
      })
    }
  }

  fetchGetContentData(contentId: string) {
    let url = ''
    const forPreview = window.location.href.includes('/public/') || window.location.href.includes('&preview=true')
    if (!forPreview) {
      return this.http.get<{ result: any }>(
        API_END_POINTS.GET_CONTENT(contentId),
      )
    }
    if (window.location.href.includes('editMode=true') && window.location.href.includes('_rc')) {
      url = `/apis/proxies/v8/action/content/v3/read/${contentId}`
    } else {
      url = `/api/content/v1/read/${contentId}`
    }
    return this.http.get<{ result: any }>(url)
  }

  setTranscriptionData(data: any) {
    this.transriptionDataSubject.next(data)
  }

  setActiveSubtitleLanguage(language: string) {
    this.changeTranscriptionLanguageEvent.next(language)
  }

  aiGetResourceVttFile(identifier: string): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.AI_RESOURCE_VTT_FILE}?resource_id=${identifier}`)
  }

  searchAssignments(request: any): Observable<any> {
    return this.http.post(API_END_POINTS.SEARCH, request)
  }

  submitDraftAssignment(request: any): Observable<any> {
    return this.http.put(API_END_POINTS.SUBMIT_DRAFT_ASSIGNMENT, request)
  }

  submitAssignment(request: any): Observable<any> {
    return this.http.post(API_END_POINTS.SUBMIT_ASSIGNMENT, request)
  }

  notifyAssignmentSubmission(payload: any): Observable<any> {
    return this.http.post(API_END_POINTS.NOTIFY_ASSIGNMENT_SUBMISSION, payload)
  }

  getAssignmentStatus(request: any): Observable<any> {
    return this.http.post(`${API_END_POINTS.ASSIGNMENT_STATUS}`, request)
  }

  uploadAssignmentAnswer(contentId: string, batchId: string, assignmentId: string, file: File): Observable<any> {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return this.http.post(`${API_END_POINTS.UPLOAD_ASSIGNMENT}/${contentId}/${batchId}/${assignmentId}`, formData)
  }

  readAssignmentFile(contentId: string, batchId: string, assignmentId: string, fileName: string): Observable<any> {
    // Properly encode the parameters to avoid malformed request errors
    const encodedParams = new URLSearchParams({
      contentId: contentId || '',
      batchId: batchId || '',
      formId: assignmentId || '',
      fileName: fileName || ''
    })

    return this.http.get(`${API_END_POINTS.READ_ASSIGNMENT}?${encodedParams.toString()}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    }).pipe(
      catchError((error: any) => {
        return throwError(() => error)
      })
    )
  }
}
