import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CareerHubModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, CareerHubModule],
  exports: [CareerHubModule],
})
export class RouteCareerHubModule {

}
