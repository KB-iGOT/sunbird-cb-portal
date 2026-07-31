import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NetworkV2Module } from '@ws/app/src/lib/routes/network-v2/network-v2.module'

@NgModule({
  imports: [CommonModule, NetworkV2Module],
  exports: [NetworkV2Module],
})
export class RouteNetworkV2Module {

}
