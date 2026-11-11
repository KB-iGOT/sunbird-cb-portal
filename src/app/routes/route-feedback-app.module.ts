import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackModule } from '@ws/app/src/lib/routes/feedback/feedback.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, FeedbackModule],
  exports: [FeedbackModule],
})
export class RouteFeedbackAppModule {}
