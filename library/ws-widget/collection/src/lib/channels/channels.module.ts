import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ChannelsRoutingModule } from './channels-routing.module'
import { ChannelsHomeComponent } from './routes/channels-home/channels-home.component'

import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CardChannelModule } from '../card-channel/card-channel.module'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { CardChannelModuleV2 } from '../card-channel-v2/card-channel-v2.module'
import { CardContentModule } from '../card-content/card-content.module'
import { CardContentV2Module } from '../card-content-v2/card-content-v2.module'
@NgModule({
  declarations: [ChannelsHomeComponent],
  imports: [
    CommonModule,
    ChannelsRoutingModule,
    CardChannelModule,
    MatToolbarModule,
    BtnPageBackModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    CardChannelModuleV2,
    CardContentModule,
    CardContentV2Module,
  ],
})
export class ChannelsModule { }
