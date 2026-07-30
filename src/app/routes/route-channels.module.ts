import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChannelsModule } from '@ws/app/src/lib/routes/channels/channels.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, ChannelsModule],
  exports: [ChannelsModule],
})
export class RouteChannelsModule { }
