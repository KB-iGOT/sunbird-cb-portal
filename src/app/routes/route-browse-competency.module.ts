import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByCompetencyModule } from '@ws/app/src/lib/routes/browse-by-competency/browse-by-competency.module'

@NgModule({
  imports: [CommonModule, BrowseByCompetencyModule],
  exports: [BrowseByCompetencyModule],
})
export class RouteBrowseCompetencyModule {

}
