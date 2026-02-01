import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MDOChannelsModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, MDOChannelsModule],
  exports: [MDOChannelsModule],
})
export class RouteMdoChannelsModule { }
