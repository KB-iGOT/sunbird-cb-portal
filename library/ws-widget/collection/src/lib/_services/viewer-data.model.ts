import { NsContent } from '../_services/widget-content.model'
import { Params } from '@angular/router'

export interface IViewerTocCard {
  identifier: string
  viewerUrl: string
  thumbnailUrl: string
  title: string
  duration: number
  type: string
  mimeType: NsContent.EMimeTypes
  complexity: string
  children: null | IViewerTocCard[]
  primaryCategory: NsContent.EPrimaryCategory
  collectionId: string | null
  collectionType: string,
  batchId: string | number,
  viewMode: string,
  optionalReading: boolean,
  channelId: string
}

export type TCollectionCardType = 'content' | 'playlist' | 'goals'

export interface ICollectionCard {
  type: TCollectionCardType | null
  id: string
  title: string
  thumbnail: string
  subText1: string
  subText2: string
  duration: number
  redirectUrl: string | null
  queryParams: Params
}

export interface IViewerTocChangeEvent {
  tocAvailable: boolean
  nextResource: IViewerTocCard | null
  prevResource: IViewerTocCard | null
  queryMLParams: any
}

export interface IViewerResourceOptions {
  page?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
  zoom?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
}

export type TStatus = 'pending' | 'done' | 'error' | 'none'
