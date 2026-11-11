import {
  Injectable,
  Inject,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  Type,
  EnvironmentInjector,
  ErrorHandler,
  createNgModule,
} from '@angular/core'
import {
  WIDGET_RESOLVER_GLOBAL_CONFIG,
  WIDGET_RESOLVER_SCOPED_CONFIG,
} from './widget-resolver.constant'
// import { LoggerService } from '@sunbird-cb/utils-v2'
import { NsWidgetResolver } from './widget-resolver.model'
import { hasPermissions } from './widget-resolver.permissions'
import { RestrictedComponent } from './restricted/restricted.component'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'
import { DomSanitizer } from '@angular/platform-browser'

@Injectable({
  providedIn: 'root',
})
export class WidgetResolverService {
  private roles: Set<string> | null = null
  private groups: Set<string> | null = null
  private restrictedFeatures: Set<string> | null = null
  isInitialized = false
  constructor(
    private domSanitizer: DomSanitizer,
    private componentFactoryResolver: ComponentFactoryResolver,
    private errorHandler: ErrorHandler,
    // private loggerSvc: LoggerService,
    @Inject(WIDGET_RESOLVER_GLOBAL_CONFIG)
    private globalConfig: null | NsWidgetResolver.IRegistrationConfig[],
    @Inject(WIDGET_RESOLVER_SCOPED_CONFIG)
    private scopedConfig: null | NsWidgetResolver.IRegistrationConfig[],
  ) { }
  private availableRegisteredWidgets: Map<
    string,
    NsWidgetResolver.IRegistrationConfig
    > | null = null
  private restrictedWidgetKeys: Set<string> | null = null
  static getWidgetKey(config: NsWidgetResolver.IBaseConfig) {
    return `widget:${config.widgetType}::${config.widgetSubType}`
  }

  initialize(
    restrictedWidgetKeys: Set<string> | null,
    roles: Set<string> | null,
    groups: Set<string> | null,
    restrictedFeatures: Set<string> | null,
  ) {
    this.roles = roles

    this.groups = groups
    this.restrictedFeatures = restrictedFeatures
    const restrictedWidgetKeysSet: Set<string> = restrictedWidgetKeys
      ? restrictedWidgetKeys
      : new Set<string>()
    const registrationConfig: Map<string, NsWidgetResolver.IRegistrationConfig> = new Map()
    const allWidgetsConfigurations: NsWidgetResolver.IRegistrationConfig[] = []
    if (this.globalConfig && Array.isArray(this.globalConfig)) {
      allWidgetsConfigurations.push(...this.globalConfig)
    }
    if (this.scopedConfig && Array.isArray(this.scopedConfig)) {
      allWidgetsConfigurations.push(...this.scopedConfig)
    }
    allWidgetsConfigurations.forEach(u => {
      const key = WidgetResolverService.getWidgetKey(u)
      if (!restrictedWidgetKeysSet.has(key)) {
        registrationConfig.set(key, u)
      }
    })
    this.restrictedWidgetKeys = restrictedWidgetKeysSet
    this.availableRegisteredWidgets = registrationConfig
    this.isInitialized = true
    // this.loggerSvc.log(
    //   `Widget Configurations`,
    //   this.globalConfig,
    //   this.scopedConfig,
    //   this.availableRegisteredWidgets,
    // )
  }

  /** One load per lazy widget type, shared by every instance and every caller. */
  private lazyWidgets = new Map<string, Promise<NsWidgetResolver.ILazyWidget>>()
  /** The lazy widget's NgModule, instantiated once per environment injector it is rendered in. */
  private lazyModuleInjectors = new WeakMap<EnvironmentInjector, Map<Type<any>, EnvironmentInjector>>()

  /**
   * Renders the widget into `containerRef` and returns its ComponentRef. A widget registered
   * with `loadComponent` cannot render synchronously: the container is cleared, null is
   * returned, and the widget is rendered once its chunk has loaded - see resolveLazyWidget.
   */
  resolveWidget(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
    containerRef: ViewContainerRef,
  ): ComponentRef<any> | null {
    const target = this.lookup(receivedConfig)
    if ('loadComponent' in target) {
      containerRef.clear()
      this.resolveLazyWidget(receivedConfig, containerRef)
      return null
    }
    return this.widgetResolved(containerRef, receivedConfig, target.component)
  }

  /** True when the widget is registered with `loadComponent`, i.e. renders asynchronously. */
  isLazyWidget(receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData): boolean {
    return 'loadComponent' in this.lookup(receivedConfig)
  }

  /**
   * Loads a `loadComponent` widget and renders it into `containerRef`. `isCurrent` is checked
   * after the load: when the caller has moved on (new config, or destroyed) nothing is
   * rendered and the promise resolves to null. A load failure - typically a chunk of a
   * build that is no longer deployed - goes to the app ErrorHandler, which recovers from a
   * stale build by reloading.
   */
  resolveLazyWidget(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
    containerRef: ViewContainerRef,
    isCurrent: () => boolean = () => true,
  ): Promise<ComponentRef<any> | null> {
    const target = this.lookup(receivedConfig)
    if (!('loadComponent' in target)) {
      return Promise.resolve(this.widgetResolved(containerRef, receivedConfig, target.component))
    }
    const key = WidgetResolverService.getWidgetKey(receivedConfig)
    let pending = this.lazyWidgets.get(key)
    if (!pending) {
      pending = target.loadComponent()
      this.lazyWidgets.set(key, pending)
      // a failed load is not cached, so the next render retries
      pending.catch(() => this.lazyWidgets.delete(key))
    }
    return pending.then(
      lazy => {
        if (!isCurrent()) {
          return null
        }
        const parent = containerRef.injector.get(EnvironmentInjector)
        const environmentInjector = lazy.ngModule ? this.lazyModuleInjector(lazy.ngModule, parent) : parent
        return this.widgetResolved(containerRef, receivedConfig, lazy.component, environmentInjector)
      },
      error => {
        this.errorHandler.handleError(error)
        return null
      },
    )
  }

  /** What to render for a config: a component now, or a loader for one. */
  private lookup(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
  ): { component: Type<NsWidgetResolver.IWidgetData<any>> } |
    { loadComponent: () => Promise<NsWidgetResolver.ILazyWidget> } {
    const key = WidgetResolverService.getWidgetKey(receivedConfig)
    if (this.restrictedWidgetKeys && this.restrictedWidgetKeys.has(key)) {
      // Restricted
      return { component: RestrictedComponent }
    }
    if (this.availableRegisteredWidgets && this.availableRegisteredWidgets.has(key)) {
      if (
        hasPermissions(
          receivedConfig.widgetPermission,
          this.roles,
          this.groups,
          this.restrictedFeatures,
        )
      ) {
        const config = this.availableRegisteredWidgets.get(key)
        if (config && config.component) {
          return { component: config.component }
        }
        if (config && config.loadComponent) {
          return { loadComponent: config.loadComponent }
        }
        // Not properly registered
        return { component: InvalidRegistrationComponent }
      }
      // No Permission
      return { component: InvalidPermissionComponent }
    }
    // Not Resolved
    return { component: UnresolvedComponent }
  }

  private lazyModuleInjector(ngModule: Type<any>, parent: EnvironmentInjector): EnvironmentInjector {
    let byModule = this.lazyModuleInjectors.get(parent)
    if (!byModule) {
      byModule = new Map()
      this.lazyModuleInjectors.set(parent, byModule)
    }
    let injector = byModule.get(ngModule)
    if (!injector) {
      injector = createNgModule(ngModule, parent).injector
      byModule.set(ngModule, injector)
    }
    return injector
  }

  private widgetResolved(
    containerRef: ViewContainerRef,
    compData: NsWidgetResolver.IRenderConfigWithAnyData,
    component: Type<NsWidgetResolver.IWidgetData<any>>,
    environmentInjector?: EnvironmentInjector,
  ): ComponentRef<NsWidgetResolver.IWidgetData<any>> {
    containerRef.clear()
    const compRef: ComponentRef<NsWidgetResolver.IWidgetData<any>> = environmentInjector
      ? containerRef.createComponent(component, { environmentInjector })
      : containerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(component))
    compRef.instance.widgetData = compData.widgetData
    if (compRef.instance.updateBaseComponent) {
      const widgetSafeStyle = compData.widgetHostStyle
        ? this.domSanitizer.bypassSecurityTrustStyle(
          Object.entries(compData.widgetHostStyle).reduce((s, [k, v]) => `${s}${k}:${v};`, ''),
        )
        : undefined
      compRef.instance.updateBaseComponent(
        compData.widgetType,
        compData.widgetSubType,
        compData.widgetInstanceId,
        compData.widgetHostClass,
        widgetSafeStyle,
      )
    }
    return compRef
  }
}
