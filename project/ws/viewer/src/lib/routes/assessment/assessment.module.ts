import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { QumlLibraryModule } from '@project-sunbird/sunbird-quml-player'
// import { CarouselModule } from 'ngx-bootstrap/carousel' // Commented out - not Angular 20 compatible and not used
import { AssessmentComponent } from './assessment.component'
import { AssessmentRoutingModule } from './assessment-routing.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [AssessmentComponent],
  imports: [
    CommonModule,
    AssessmentRoutingModule,
    // QumlLibraryModule,
    // CarouselModule.forRoot(), // Commented out - not Angular 20 compatible and not used
    TranslateModule.forChild(),
  ],
})
export class AssessmentModule { }
