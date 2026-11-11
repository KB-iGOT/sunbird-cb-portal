import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ContentAssignmentModule } from '@ws/app/src/lib/routes/content-assignment/content-assignment.module'

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
