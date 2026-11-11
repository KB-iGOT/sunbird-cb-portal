import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ChannelsRoutingModule } from './channels-routing.module'
import { ChannelsHomeComponent } from './routes/channels-home/channels-home.component'
import { CardChannelModule } from '@sunbird-cb/collection/src/lib/card-channel/card-channel.module'
import { CardChannelModuleV2 } from '@sunbird-cb/collection/src/lib/card-channel-v2/card-channel-v2.module'
import { CardContentModule } from '@sunbird-cb/collection/src/lib/card-content/card-content.module'
import { BtnPageBackModule } from '@sunbird-cb/collection/src/lib/btn-page-back/btn-page-back.module'
import { CardContentV2Module } from '@sunbird-cb/collection/src/lib/card-content-v2/card-content-v2.module'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatToolbarModule } from '@angular/material/toolbar'
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
