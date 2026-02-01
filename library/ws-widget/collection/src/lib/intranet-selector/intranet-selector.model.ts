import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'
export interface IIntranetSelector {
  url?: string
  isIntranet?: IIntranetSelectorUnit
  isNotIntranet?: IIntranetSelectorUnit
}

export interface IIntranetSelectorUnit {
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}
