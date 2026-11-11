import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutVideoComponent } from './about-video.component'
import { LocaleTranslatorModule } from '@sunbird-cb/collection/src/lib/_common/locale-translator/locale-translator.module'
import { BtnPageBackModule } from '@sunbird-cb/collection/src/lib/btn-page-back/btn-page-back.module'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatRadioModule } from '@angular/material/radio'
import { MatToolbarModule } from '@angular/material/toolbar'

@NgModule({
  declarations: [AboutVideoComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    RouterModule,
    WidgetResolverModule,
    LocaleTranslatorModule,
    MatButtonModule,
    BtnPageBackModule,
    MatToolbarModule,
  ],
  exports: [AboutVideoComponent],
})
export class AboutVideoModule { }
