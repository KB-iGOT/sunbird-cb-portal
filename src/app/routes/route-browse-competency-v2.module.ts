import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByCompetencyModuleV2 } from '@ws/app/src/lib/routes/browse-by-competency-v2/browse-by-competency.module-v2'

@NgModule({
  imports: [CommonModule, BrowseByCompetencyModuleV2],
  exports: [BrowseByCompetencyModuleV2],
})
export class RouteBrowseCompetencyModuleV2 {

}
