import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MandatoryCourseComponent } from './routes/mandatory-course/mandatory-course.component'
import { MandatoryCourseRoutingModule } from './manadatory-course-routing.module'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MandatoryCourseStatsComponent } from './components/mandatory-course-stats/mandatory-course-stats.component'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { CardContentModule } from '../card-content/card-content.module'
import { CardContentV2Module } from '../card-content-v2/card-content-v2.module'

@NgModule({
  declarations: [MandatoryCourseComponent, MandatoryCourseStatsComponent],
  imports: [
    CommonModule,
    MandatoryCourseRoutingModule,
    SbUiResolverModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    BtnPageBackModule,
    CardContentModule,
    CardContentV2Module,
    MatCardModule,
  ],
})
export class MandatoryCourseModule { }
