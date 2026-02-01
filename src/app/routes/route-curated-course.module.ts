import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CuratedCoursesModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, CuratedCoursesModule],
  exports: [CuratedCoursesModule],
})
export class RouteCuratedCourseModule {

}
