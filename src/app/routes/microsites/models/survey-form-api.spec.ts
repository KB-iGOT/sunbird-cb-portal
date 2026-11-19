import { DEFAULT_SURVEY_FORM_APIS, surveyFormApi } from './campaign-microsite.model'

describe('surveyFormApi', () => {
  it('defaults to the standard form APIs, with the form id filled in', () => {
    const milestone = { formId: '1794210526956' }
    expect(surveyFormApi(milestone, 'read')).toBe('/apis/proxies/v8/forms/v2/getFormById?formId=1794210526956')
    expect(surveyFormApi(milestone, 'status')).toBe(DEFAULT_SURVEY_FORM_APIS.status)
    expect(surveyFormApi(milestone, 'submit')).toBe(DEFAULT_SURVEY_FORM_APIS.submit)
  })

  it('uses the configured URL per key, keeping the default for the rest', () => {
    const milestone = { formId: 'f1', formApis: { read: '/apis/x/read?id={formId}&ctx={formId}', submit: '/apis/x/submit' } }
    expect(surveyFormApi(milestone, 'read')).toBe('/apis/x/read?id=f1&ctx=f1')
    expect(surveyFormApi(milestone, 'submit')).toBe('/apis/x/submit')
    expect(surveyFormApi(milestone, 'status')).toBe(DEFAULT_SURVEY_FORM_APIS.status)
  })

  it.each([[''], ['   '], ['<FORM_READ_URL>']])('treats %j as not configured', value => {
    expect(surveyFormApi({ formId: 'f1', formApis: { read: value } }, 'read')).toBe('/apis/proxies/v8/forms/v2/getFormById?formId=f1')
  })
})
