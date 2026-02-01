import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { QuizRoutingModule } from './quiz-routing.module'

import { QuizStoreService } from './services/store.service'
import { OpenPlainCkEditorComponent } from './shared/components/open-plain-ck-editor/open-plain-ck-editor.component'
import { QuizQusetionsComponent } from './components/quiz/quiz-questions/quiz-questions.component'
import { SharedModule } from '../../../../../../modules/shared/shared.module'
import { AuthViewerModule } from '../../../../../../modules/viewer/viewer.module'
import { EditorSharedModule } from '../../../shared/shared.module'
import { QuizComponent } from './components/quiz/quiz.component'
import { QuestionEditorComponent } from './components/question-editor/question-editor.component'
import { MatchTheFollowingComponent } from './components/match-the-following/match-the-following.component'
import { MultipleChoiceQuestionComponent } from './components/multiple-choice-question/multiple-choice-question.component'
import { FillUpsEditorComponent } from './components/fill-ups-editor/fill-ups-editor.component'
import { QuestionEditorSidenavComponent } from './../../../../editor/routing/modules/quiz/shared/components/question-editor-sidenav/question-editor-sidenav.component'
import { RomanConvertPipe } from './../../../../editor/routing/modules/quiz/shared/roman-convert.pipe'
@NgModule({
    declarations: [
        QuizComponent,
        QuizQusetionsComponent,
        QuestionEditorComponent,
        MatchTheFollowingComponent,
        MultipleChoiceQuestionComponent,
        FillUpsEditorComponent,
        QuestionEditorSidenavComponent,
        OpenPlainCkEditorComponent,
        RomanConvertPipe,
    ],
    imports: [
        CommonModule,
        SharedModule,
        EditorSharedModule,
        DragDropModule,
        QuizRoutingModule,
        AuthViewerModule,
    ],
    providers: [QuizStoreService],
    exports: [QuizComponent, QuizQusetionsComponent]
})
export class QuizModule { }
