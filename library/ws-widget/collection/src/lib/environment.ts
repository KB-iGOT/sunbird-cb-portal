export const environment = {
  production: (window as any).env?.production || false,
  apiCache: (window as any).env?.apiCache || 0,
  compentencyVersionKey: (window as any).env?.compentencyVersionKey || 'v4',
  programStripKey: (window as any).env?.programStripKey || '',
  programStripName: (window as any).env?.programStripName || '',
  programStripPrimaryCategory: (window as any).env?.programStripPrimaryCategory || '',
  contentHost: (window as any).env?.contentHost || '',
  contentBucket: (window as any).env?.contentBucket || '',
  cdnContentBucket: (window as any).env?.cdnContentBucket || '',
  missionKarmayogiPath: (window as any).env?.missionKarmayogiPath || '',
  portals: [],
  publicContentSurveyId: (window as any).env?.publicContentSurveyId || '',
}
