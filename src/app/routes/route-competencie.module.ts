import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CompetencieModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, CompetencieModule],
  exports: [CompetencieModule],
})
export class RouteCompetenciesModule {

}
