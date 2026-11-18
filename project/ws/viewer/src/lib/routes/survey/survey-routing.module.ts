import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ViewerResolve } from '../../viewer.resolve'
import { SurveyComponent } from './survey.component'
import { ltiSearchResolver } from '../../resolvers/lti-search.resolver'
const routes: Routes = [
  // 'viewer/lti-course' - lazy loaded. Must stay above ':resourceId', which would otherwise
  // match 'lti-course' and render the survey component.
  {
    path: 'lti-course',
    loadComponent: () =>
      import('../ext-course-view/ext-course-view.component').then(c => c.ExtCourseViewComponent),
    resolve: {
      pageData: ltiSearchResolver,
    },
    // Resolver reads ?id & ?partnerId, so re-run it when those change.
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: ':resourceId',
    component: SurveyComponent,
    resolve: {
      content: ViewerResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewerResolve],
})
export class SurveyRoutingModule { }
