import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MyLearningModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [CommonModule, MyLearningModule],
  exports: [MyLearningModule],
})
export class RouteMyLearningModule { }
