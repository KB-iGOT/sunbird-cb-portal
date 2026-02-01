import { NsContent } from '@sunbird-cb/utils-v2'

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
  collectionType: string
  batchId: string | number
  viewMode: string
  optionalReading: boolean
  channelId: string
}

export interface IViewerTocChangeEvent {
  tocAvailable: boolean
  nextResource: IViewerTocCard | null
  prevResource: IViewerTocCard | null
  queryMLParams: any
}