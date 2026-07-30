import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CompetencieModule } from '@ws/app/src/lib/routes/competencies/competence.module'

@NgModule({
  imports: [CommonModule, CompetencieModule],
  exports: [CompetencieModule],
})
export class RouteCompetenciesModule {

}
