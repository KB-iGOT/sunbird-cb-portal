import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByCompetencyModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, BrowseByCompetencyModule],
  exports: [BrowseByCompetencyModule],
})
export class RouteBrowseCompetencyModule {

}
