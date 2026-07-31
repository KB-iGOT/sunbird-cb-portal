import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MDOChannelsModule } from '@ws/app/src/lib/routes/mdo-channels/mdo-channels.module'

@NgModule({
  imports: [CommonModule, MDOChannelsModule],
  exports: [MDOChannelsModule],
})
export class RouteMdoChannelsModule { }
