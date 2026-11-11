import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WsLearningHubRootModule } from '@ws/learning-hub/src/lib/ws-learning-hub.module'
@NgModule({
  declarations: [],
  imports: [CommonModule, WsLearningHubRootModule],
  exports: [WsLearningHubRootModule],
})
export class LearningHubAppModule { }
