import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

// ─── State shape ─────────────────────────────────────────────────────────────

export interface ILayoutState {
  // Navigation
  navBarRequired: boolean
  showNavbar: boolean
  showFooter: boolean
  showBottomNav: boolean
  showHubs: boolean
  // Header/Footer config
  headerFooterConfigData: any
  // Page state
  hideHeaderAndFooter: boolean
  isSetupPage: boolean
  customHeight: boolean
  disableHeightOnTop: boolean
  routeChangeInProgress: boolean
  // Mobile
  mobileTopHeaderVisibilityStatus: boolean
  viewerPage: boolean
  // Feature state
  iGOTAIConfigLoaded: boolean
  loggedinUser: boolean
  showTour: boolean
  rootOrgId: string
}

const DEFAULT_STATE: ILayoutState = {
  navBarRequired: true,
  showNavbar: true,
  showFooter: false,
  showBottomNav: true,
  showHubs: true,
  headerFooterConfigData: null,
  hideHeaderAndFooter: false,
  isSetupPage: false,
  customHeight: false,
  disableHeightOnTop: false,
  routeChangeInProgress: false,
  mobileTopHeaderVisibilityStatus: true,
  viewerPage: false,
  iGOTAIConfigLoaded: false,
  loggedinUser: false,
  showTour: false,
  rootOrgId: '',
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * LayoutStateService
 *
 * Single-BehaviorSubject state store shared between RootComponent (writer)
 * and layout components (readers). Uses one stream instead of N streams —
 * dramatically reduces subscription count and memory overhead.
 *
 * Layout components subscribe to `state$` once and destructure in ngOnDestroy:
 *   this.subs.push(this.layoutState.state$.subscribe(s => Object.assign(this, s)))
 *
 * For fine-grained reactivity use select():
 *   this.layoutState.select('showNavbar').subscribe(...)
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutStateService {

  private _state$ = new BehaviorSubject<ILayoutState>(DEFAULT_STATE)

  /** Full state observable – subscribe once and destructure in the component */
  get state$(): Observable<ILayoutState> { return this._state$.asObservable() }

  /** Emits only when the selected key's value changes (distinctUntilChanged) */
  select<K extends keyof ILayoutState>(key: K): Observable<ILayoutState[K]> {
    return this._state$.pipe(map(s => s[key]), distinctUntilChanged())
  }

  /** Read current value synchronously */
  get<K extends keyof ILayoutState>(key: K): ILayoutState[K] {
    return this._state$.value[key]
  }

  /**
   * Update one or more state keys at once — single emission for N changes.
   * RootComponent should prefer this over individual setters when updating
   * multiple fields together.
   */
  setState(partial: Partial<ILayoutState>): void {
    this._state$.next({ ...this._state$.value, ...partial })
  }

  // ── Individual convenience getters (synchronous) ──────────────────────────
  get navBarRequired(): boolean { return this.get('navBarRequired') }
  get showNavbar(): boolean { return this.get('showNavbar') }
  get showFooter(): boolean { return this.get('showFooter') }
  get showBottomNav(): boolean { return this.get('showBottomNav') }
  get showHubs(): boolean { return this.get('showHubs') }
  get headerFooterConfigData(): any { return this.get('headerFooterConfigData') }
  get hideHeaderAndFooter(): boolean { return this.get('hideHeaderAndFooter') }
  get isSetupPage(): boolean { return this.get('isSetupPage') }
  get customHeight(): boolean { return this.get('customHeight') }
  get disableHeightOnTop(): boolean { return this.get('disableHeightOnTop') }
  get routeChangeInProgress(): boolean { return this.get('routeChangeInProgress') }
  get mobileTopHeaderVisibilityStatus(): boolean { return this.get('mobileTopHeaderVisibilityStatus') }
  get viewerPage(): boolean { return this.get('viewerPage') }
  get iGOTAIConfigLoaded(): boolean { return this.get('iGOTAIConfigLoaded') }
  get loggedinUser(): boolean { return this.get('loggedinUser') }
  get showTour(): boolean { return this.get('showTour') }
  get rootOrgId(): string { return this.get('rootOrgId') }

  // ── Individual observable getters (for backward compat with select()) ─────
  get navBarRequired$(): Observable<boolean> { return this.select('navBarRequired') }
  get showNavbar$(): Observable<boolean> { return this.select('showNavbar') }
  get showFooter$(): Observable<boolean> { return this.select('showFooter') }
  get showBottomNav$(): Observable<boolean> { return this.select('showBottomNav') }
  get showHubs$(): Observable<boolean> { return this.select('showHubs') }
  get headerFooterConfigData$(): Observable<any> { return this.select('headerFooterConfigData') }
  get hideHeaderAndFooter$(): Observable<boolean> { return this.select('hideHeaderAndFooter') }
  get isSetupPage$(): Observable<boolean> { return this.select('isSetupPage') }
  get customHeight$(): Observable<boolean> { return this.select('customHeight') }
  get disableHeightOnTop$(): Observable<boolean> { return this.select('disableHeightOnTop') }
  get routeChangeInProgress$(): Observable<boolean> { return this.select('routeChangeInProgress') }
  get mobileTopHeaderVisibilityStatus$(): Observable<boolean> { return this.select('mobileTopHeaderVisibilityStatus') }
  get viewerPage$(): Observable<boolean> { return this.select('viewerPage') }
  get iGOTAIConfigLoaded$(): Observable<boolean> { return this.select('iGOTAIConfigLoaded') }
  get loggedinUser$(): Observable<boolean> { return this.select('loggedinUser') }
  get showTour$(): Observable<boolean> { return this.select('showTour') }
  get rootOrgId$(): Observable<string> { return this.select('rootOrgId') }

  // ── Individual setters (backward compat – delegate to setState) ───────────
  setNavBarRequired(v: boolean): void { this.setState({ navBarRequired: v }) }
  setShowNavbar(v: boolean): void { this.setState({ showNavbar: v }) }
  setShowFooter(v: boolean): void { this.setState({ showFooter: v }) }
  setShowBottomNav(v: boolean): void { this.setState({ showBottomNav: v }) }
  setShowHubs(v: boolean): void { this.setState({ showHubs: v }) }
  setHeaderFooterConfigData(v: any): void { this.setState({ headerFooterConfigData: v }) }
  setHideHeaderAndFooter(v: boolean): void { this.setState({ hideHeaderAndFooter: v }) }
  setIsSetupPage(v: boolean): void { this.setState({ isSetupPage: v }) }
  setCustomHeight(v: boolean): void { this.setState({ customHeight: v }) }
  setDisableHeightOnTop(v: boolean): void { this.setState({ disableHeightOnTop: v }) }
  setRouteChangeInProgress(v: boolean): void { this.setState({ routeChangeInProgress: v }) }
  setMobileTopHeaderVisibilityStatus(v: boolean): void { this.setState({ mobileTopHeaderVisibilityStatus: v }) }
  setViewerPage(v: boolean): void { this.setState({ viewerPage: v }) }
  setIGOTAIConfigLoaded(v: boolean): void { this.setState({ iGOTAIConfigLoaded: v }) }
  setLoggedinUser(v: boolean): void { this.setState({ loggedinUser: v }) }
  setShowTour(v: boolean): void { this.setState({ showTour: v }) }
  setRootOrgId(v: string): void { this.setState({ rootOrgId: v }) }
}
