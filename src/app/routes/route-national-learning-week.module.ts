import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NationalLearningWeekModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, NationalLearningWeekModule],
  exports: [NationalLearningWeekModule],
})
export class RouteNationalLearningWeekModule { }
