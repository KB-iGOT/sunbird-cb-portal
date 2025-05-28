import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'

import { PipeDurationTransformModule } from '@sunbird-cb/utils-v2'

import { TocKpiValuesComponent } from './toc-kpi-values.component'

@NgModule({
  declarations: [TocKpiValuesComponent],
  imports: [
    CommonModule,
    MatIconModule,
    PipeDurationTransformModule,
    TranslateModule,
    TranslateModule.forRoot({
    }),
  ],
  exports: [
    TocKpiValuesComponent,
  ],
})
export class TocKpiValuesModule { }
