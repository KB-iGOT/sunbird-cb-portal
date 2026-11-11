import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MyLearningModule } from '@ws/app/src/lib/routes/my-learning/my-learning.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, MyLearningModule],
  exports: [MyLearningModule],
})
export class RouteMyLearningModule {}
