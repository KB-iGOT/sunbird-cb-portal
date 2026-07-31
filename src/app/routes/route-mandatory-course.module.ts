import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MandatoryCourseModule } from '@ws/app/src/lib/routes/mandatory-course/mandatory-course.module'

@NgModule({
  imports: [CommonModule, MandatoryCourseModule],
  exports: [MandatoryCourseModule],
})
export class RouteMandatoryCourseModule {

}
