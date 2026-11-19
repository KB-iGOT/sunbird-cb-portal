import { RouterModule } from '@angular/router'

import { SurveyRoutingModule } from './survey-routing.module'
import { ViewerResolve } from '../../viewer.resolve'
import { SurveyComponent } from './survey.component'
import { ltiSearchResolver } from '../../resolvers/lti-search.resolver'
import { ExtCourseViewComponent } from '../ext-course-view/ext-course-view.component'

jest.mock('@angular/router', () => {
  const actual = jest.requireActual('@angular/router')
  return {
    ...actual,
    RouterModule: {
      forChild: jest.fn().mockReturnValue({ ngModule: class MockRouterChildModule { }, providers: [] }),
    },
  }
})

jest.mock('../../viewer.resolve', () => ({
  ViewerResolve: class ViewerResolve { },
}))

jest.mock('./survey.component', () => ({
  SurveyComponent: class SurveyComponent { },
}))

jest.mock('../../resolvers/lti-search.resolver', () => ({
  ltiSearchResolver: jest.fn(),
}))

jest.mock('../ext-course-view/ext-course-view.component', () => ({
  ExtCourseViewComponent: class ExtCourseViewComponent { },
}))

describe('SurveyRoutingModule', () => {
  const mockForChild: any = RouterModule.forChild
  const routes: any[] = mockForChild.mock.calls[0][0]

  it('should create the module', () => {
    expect(new SurveyRoutingModule()).toBeTruthy()
  })

  it('should register the child routes once', () => {
    expect(mockForChild).toHaveBeenCalledTimes(1)
    expect(routes.length).toBe(2)
  })

  it('should keep the lti-course route above the :resourceId route', () => {
    expect(routes[0].path).toBe('lti-course')
    expect(routes[1].path).toBe(':resourceId')
  })

  it('should configure the lti-course route with the lti search resolver', () => {
    const ltiRoute: any = routes[0]
    expect(ltiRoute.resolve).toEqual({ pageData: ltiSearchResolver })
    expect(ltiRoute.runGuardsAndResolvers).toBe('paramsOrQueryParamsChange')
  })

  it('should lazy load the ExtCourseViewComponent for the lti-course route', async () => {
    const loaded: any = await routes[0].loadComponent()
    expect(loaded).toBe(ExtCourseViewComponent)
  })

  it('should configure the :resourceId route with the survey component and viewer resolver', () => {
    const resourceRoute: any = routes[1]
    expect(resourceRoute.component).toBe(SurveyComponent)
    expect(resourceRoute.resolve).toEqual({ content: ViewerResolve })
  })
})
