import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { JanKarmayogiRoutingModule } from './jan-karmayogi-routing.module'
import { JanKarmayogiHomeComponent } from './components/jan-karmayogi-home/jan-karmayogi-home.component'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { TranslateModule } from '@ngx-translate/core'
import { CardContentV2Module } from '../card-content-v2/card-content-v2.module'

@NgModule({
  declarations: [JanKarmayogiHomeComponent],
  imports: [
    CommonModule,
    JanKarmayogiRoutingModule,
    SbUiResolverModule,
    CardContentV2Module,
    TranslateModule,
  ],
})
export class JanKarmayogiModule { }
