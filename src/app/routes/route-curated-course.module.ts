import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CuratedCoursesModule } from '@ws/app/src/lib/routes/curated-courses/curated-courses.module'

@NgModule({
  imports: [CommonModule, CuratedCoursesModule],
  exports: [CuratedCoursesModule],
})
export class RouteCuratedCourseModule {

}
