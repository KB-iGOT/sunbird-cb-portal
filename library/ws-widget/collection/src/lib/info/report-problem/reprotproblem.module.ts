import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { ReportproblemComponent } from './components/reportproblem.component'

import { MicroSurveyModule } from '@sunbird-cb/micro-surveys'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackNavModule } from '../../btn-page-back-nav/btn-page-back-nav.module'
import { BtnPageBackModule } from '../../btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [ReportproblemComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,

    BtnPageBackNavModule,
    HorizontalScrollerModule,
    SbUiResolverModule,
    PipeSafeSanitizerModule,
    MatMenuModule,
    MatSidenavModule,

    MatFormFieldModule,
    MatInputModule,
    MicroSurveyModule,
    BtnPageBackModule,
  ],
  exports: [ReportproblemComponent],
})
export class ReportproblemModule { }
