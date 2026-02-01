import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'

export namespace NsWidgetLayoutTab {
  export interface ILayout {
    tabs: ITabDetails[]
  }
  export interface ITabDetails {
    tabKey: string
    tabTitle: string
    tabContent: NsWidgetResolver.IRenderConfigWithAnyData
  }
}
