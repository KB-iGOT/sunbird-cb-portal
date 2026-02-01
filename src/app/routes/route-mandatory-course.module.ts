import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MandatoryCourseModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, MandatoryCourseModule],
  exports: [MandatoryCourseModule],
})
export class RouteMandatoryCourseModule {

}
