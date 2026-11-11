import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NetworkV3Module } from '@ws/app/src/lib/routes/network-v3/network-v3.module'

@NgModule({
  imports: [CommonModule, NetworkV3Module],
  exports: [NetworkV3Module],
})
export class RouteNetworkV3Module {

}
