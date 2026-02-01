import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeFilterModule, PipeFilterV2Module, PipeHtmlTagRemovalModule, PipeOrderByModule, PipeRelativeTimeModule } from '@sunbird-cb/utils-v2'
import { CompetenceComponent } from './routes/competence-home/competence.component'
import { CompetencieRoutingModule } from './competence.rounting.module'
import { CompetenceCardComponent } from './components/competencies-card/competencies-card.component'
import { CompetenceViewComponent } from './components/competencies-view/competencies-view.component'
import { CompetenceProficiencyCardComponent } from './components/competencies-proficency-card/competencies-proficency-card.component'
import { CompetencyLevelCardComponent } from './components/competency-level-card/competency-level-card.component'
import { LeftMenuComponent } from './components/left-menu/left-menu.component'
import { RightMenuComponent } from './components/right-menu/right-menu.component'
// import { BasicCKEditorComponent } from './components/basic-ckeditor/basic-ckeditor.component'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { MatCardModule } from '@angular/material/card'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
/*CkEditorModule, CKEditorService,*/
import { InitResolver } from './resolvers/init-resolve.service'
import { CompetenceAllComponent } from './routes/competence-all/competence-all.component'
import { CompetenceSysComponent } from './routes/competence-sys/competence-sys.component'
import { CompetencyDetailedViewComponent } from './routes/competency-detailed-view/competency-detailed-view.component'
import { CompetencyAllWrapperComponent } from './routes/competency-all-wrapper/competency-all-wrapper.component'

import { CompetenciesAssessmentComponent } from './components/competencies-assessment/competencies-assessment.component'

import { CompetencyTestComponent } from './routes/competence-test/competence-test.component'
import { CompetenceAssessmentService } from './services/comp-assessment.service'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { PracticePlModule } from '../plugins/practice/practice.module'
import { ViewerTopBarModule } from '../viewer-top-bar/viewer-top-bar.module'
import { LoaderService } from '../services/loader.service'
import { EditorSharedModule } from '../routing/modules/editor/shared/shared.module'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { HttpLoaderFactory } from './../_services/http-loader.factory'

@NgModule({
    declarations: [
        CompetenceCardComponent,
        CompetenceProficiencyCardComponent,
        CompetencyLevelCardComponent,
        CompetenceComponent,
        LeftMenuComponent,
        RightMenuComponent,
        CompetenceAllComponent,
        CompetenceSysComponent,
        CompetencyDetailedViewComponent,
        CompetencyAllWrapperComponent,
        CompetenceViewComponent,
        CompetenciesAssessmentComponent,
        CompetencyTestComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        CompetencieRoutingModule,
        MatGridListModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatDividerModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatListModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressBarModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        PipeFilterModule,
        PipeHtmlTagRemovalModule,
        PipeRelativeTimeModule,
        AvatarPhotoModule,
        EditorSharedModule,
        PipeFilterV2Module,
        PracticePlModule,
        // CkEditorModule,
        PipeOrderByModule,
        BtnPageBackModule,
        SbUiResolverModule,
        ViewerTopBarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    providers: [
        // CKEditorService,
        LoaderService,
        InitResolver,
        CompetenceAssessmentService,
    ],
    exports: []
})
export class CompetencieModule {

}
