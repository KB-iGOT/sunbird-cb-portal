import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByCompetencyModuleV2 } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, BrowseByCompetencyModuleV2],
  exports: [BrowseByCompetencyModuleV2],
})
export class RouteBrowseCompetencyModuleV2 {

}
