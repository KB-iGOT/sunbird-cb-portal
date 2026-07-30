import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CareerHubModule } from '@ws/app/src/lib/routes/career-hub/career-hub.module'

@NgModule({
  imports: [CommonModule, CareerHubModule],
  exports: [CareerHubModule],
})
export class RouteCareerHubModule {

}
