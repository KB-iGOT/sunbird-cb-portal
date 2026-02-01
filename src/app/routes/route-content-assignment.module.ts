import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ContentAssignmentModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContentAssignmentModule,
  ],
  exports: [
    ContentAssignmentModule,
  ],
})
export class RouteContentAssignmentModule { }
