import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DownloadAppComponent } from '../component/download-app/download-app.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'


@NgModule({
  declarations: [DownloadAppComponent],
  imports: [
    CommonModule,
    TranslateModule.forChild({}),
  ],
  exports: [
    DownloadAppComponent,
  ],
})
export class SharedModule {
  constructor(protected translate: TranslateService,
    private langtranslations: MultilingualTranslationsService) {
    if (localStorage.getItem('websiteLanguage')) {
      this.translate.setDefaultLang('en')
      const lang = localStorage.getItem('websiteLanguage')!
      this.translate.use(lang)
    }
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   console.log('onLangChange', event)
    // })

    this.langtranslations.languageSelectedObservable.subscribe(() => {
      if (localStorage.getItem('websiteLanguage')) {
        this.translate.setDefaultLang('en')
        const lang = localStorage.getItem('websiteLanguage')!
        this.translate.use(lang)
      }
    })
  }
}
