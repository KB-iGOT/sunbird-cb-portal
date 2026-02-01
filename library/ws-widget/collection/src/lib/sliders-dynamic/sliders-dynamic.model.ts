export interface ICarousel {
  title?: string,
  redirectUrl?: string,
  openInNewTab?: string,
  banners: IBannerUnit,
  mailTo?: string,
  queryParams?: any,
  sliderData?: any,
  type?: string,
  iconsDisplay?: boolean,
  cardClass?: string,
  height?: string
}

interface IBannerUnit {
  xs: string,
  s: string,
  m: string,
  l: string,
  xl: string
}
