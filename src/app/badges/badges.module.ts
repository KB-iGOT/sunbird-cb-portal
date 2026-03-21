import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BadgesRoutingModule } from './badges-routing.module'
import { BadgeDetailsComponent } from './badge-details/badge-details.component'
import { BadgeModalComponent, CardsModule } from '@sunbird-cb/consumption'
import { BtnPageBackModule } from '../../../library/ws-widget/collection/src/public-api'
import { PipePublicURLModule } from '@sunbird-cb/utils-v2'

@NgModule({
  declarations: [
    BadgeDetailsComponent,
    BadgeModalComponent,
  ],
  imports: [
    CommonModule,
    BadgesRoutingModule,
    BtnPageBackModule,
    PipePublicURLModule,
    CardsModule
  ],
  exports: [
    BadgeDetailsComponent
  ]
})
export class BadgesModule { }