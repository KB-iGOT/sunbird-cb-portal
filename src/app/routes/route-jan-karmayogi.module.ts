import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { JanKarmayogiModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [
    CommonModule, JanKarmayogiModule],
  exports: [JanKarmayogiModule],
})
export class RouteJanKarmayogiModule { }
