import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import _ from 'lodash'
import { Observable, firstValueFrom } from 'rxjs'
import { shareReplay } from 'rxjs/operators'
import { IFormCatalog, IFormCatalogEntry, IFormUserContext, matchForm } from './match-form'

const API_END_POINTS = {
  FORM_CATALOG: '/apis/proxies/v8/formsConfig/v1/readFormDetails',
  FORM_READ_BY_ID: '/apis/proxies/v8/formsConfig/v1/read',
  USER_READ: '/apis/proxies/v8/api/user/v2/read',
}

/**
 * Loads the form catalogue once per session and resolves (subType, clientVersion) → form id on the
 * client, so a page needs one cheap read-by-id instead of a profile-resolved read on the backend.
 *
 * load() also performs the user read (the catalogue is evaluated against the profile, and at boot
 * the form reads run before InitService fetches the profile); InitService consumes that response via
 * takeUserRead() so the user is still read exactly once.
 *
 * When the catalogue is unavailable, read() returns null and callers fall back to the direct
 * formsConfig/v1/read API, which is the pre-catalogue behaviour.
 */
@Injectable({
  providedIn: 'root',
})
export class FormCatalogService {
  private catalog: IFormCatalog | null = null
  private user: IFormUserContext | null = null
  private userRead: any = null
  private readonly formById = new Map<number, Observable<any>>()

  constructor(private http: HttpClient) { }

  get loaded(): boolean {
    return !!this.catalog && !!this.user
  }

  async load(): Promise<boolean> {
    try {
      const [catalogRes, userRes] = await Promise.all([
        firstValueFrom(this.http.get<any>(API_END_POINTS.FORM_CATALOG)),
        firstValueFrom(this.http.get<any>(API_END_POINTS.USER_READ)),
      ])
      const catalog = _.get(catalogRes, 'result')
      const profile = _.get(userRes, 'result.response')
      if (!catalog || !catalog.forms || !profile) {
        throw new Error('FormCatalogService: empty catalogue or profile')
      }
      this.catalog = catalog
      this.user = { roles: profile.roles || [], profile }
      this.userRead = userRes
      return true
    } catch (e) {
      console.error('FormCatalogService: catalogue unavailable, falling back to formsConfig/v1/read', e)
      this.catalog = null
      this.user = null
      return false
    }
  }

  /** The raw user/v2/read response fetched by load(); handed over once so InitService doesn't repeat the call. */
  takeUserRead(): any {
    const res = this.userRead
    this.userRead = null
    return res
  }

  resolve(subType: string, clientVersion: number | string, portal = 'portal', type = 'page'): IFormCatalogEntry | null {
    return matchForm(this.catalog, this.user, subType, clientVersion, portal, type)
  }

  /**
   * Resolve a formsConfig/v1/read request body against the catalogue and read the chosen form by id.
   * Returns null when the catalogue is not loaded or no form matches, so the caller can fall back.
   * The observable has the same shape as formsConfig/v1/read (result.data etc.).
   */
  read(request: any): Observable<any> | null {
    const req = _.get(request, 'request') || {}
    if (!req.subType) {
      return null
    }
    const entry = this.resolve(req.subType, req.clientVersion || 1, req.portal || 'portal', req.type || 'page')
    return entry ? this.readById(entry.id) : null
  }

  readById(id: number): Observable<any> {
    const cached = this.formById.get(id)
    if (cached) {
      return cached
    }
    const obs = this.http.get<any>(`${API_END_POINTS.FORM_READ_BY_ID}/${id}`).pipe(shareReplay(1))
    this.formById.set(id, obs)
    return obs
  }
}
