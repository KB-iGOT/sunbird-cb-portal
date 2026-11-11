import { Type } from '@angular/core'
import { SafeStyle } from '@angular/platform-browser'
import { Omit } from 'lodash'
type TUrl = undefined | 'none' | 'back' | string
export namespace NsWidgetResolver {
  export type UnitPermissionPrimitive = undefined | null | string
  export interface IUnitPermissionObject {
    all: UnitPermissionPrimitive | string[]
    none: UnitPermissionPrimitive | string[]
    some: UnitPermissionPrimitive | string[]
  }
  export type UnitPermission =
    | UnitPermissionPrimitive
    | string[]
    | IUnitPermissionObject
    | Pick<IUnitPermissionObject, 'all'>
    | Pick<IUnitPermissionObject, 'none'>
    | Pick<IUnitPermissionObject, 'some'>
    | Exclude<IUnitPermissionObject, 'all'>
    | Exclude<IUnitPermissionObject, 'none'>
    | Exclude<IUnitPermissionObject, 'some'>
  export interface IPermissions {
    enabled: boolean
    available: boolean
    roles?: UnitPermission
    features?: UnitPermission
    groups?: UnitPermission
  }

  export interface IBaseConfig {
    widgetType: string
    widgetSubType: string
  }

  /**
   * What a lazy widget loader resolves to. `ngModule` is the NgModule that declares the
   * component: the resolver instantiates it so the providers of everything it imports
   * (MatDialog, MatSnackBar, ...) are available to the widget, exactly as they were when the
   * module was imported eagerly. Omit it only for a standalone component.
   */
  export interface ILazyWidget {
    component: Type<IWidgetData<any>>
    ngModule?: Type<any>
  }

  /**
   * Register a widget with either `component` (bundled with whoever imports the config) or
   * `loadComponent` (bundled in its own chunk, fetched the first time the widget renders).
   * Use `loadComponent` for widgets that pull in heavy libraries - pdf.js, video.js, charts -
   * so those libraries stay out of the initial bundle.
   */
  export interface IRegistrationConfig extends IBaseConfig {
    component?: Type<IWidgetData<any>>
    loadComponent?: () => Promise<ILazyWidget>
  }

  export interface IRegistrationsPermissionConfig extends IBaseConfig {
    widgetPermission?: IPermissions
  }

  export interface IRenderConfigWithTypedData<T> extends IRegistrationsPermissionConfig {
    widgetData: T
    widgetInstanceId?: string
    widgetHostClass?: string
    widgetHostStyle?: { [key: string]: string }
  }
  export type IRenderConfigWithAnyData = IRenderConfigWithTypedData<any>
  export interface IWidgetData<T>
    extends Omit<IRenderConfigWithTypedData<T>, 'widgetPermission' | 'widgetHostStyle'> {
    widgetSafeStyle?: SafeStyle
    updateBaseComponent: (
      widgetType: string,
      widgetSubType: string,
      widgetInstanceId?: string,
      widgetHostClass?: string,
      widgetSafeStyle?: SafeStyle,
    ) => void
  }
  export interface ITitle {
    title: string,
    url: TUrl,
    icon?: string
  }
}
