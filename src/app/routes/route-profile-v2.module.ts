import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileV2Module } from '@ws/app/src/lib/routes/profile-v2/profile-v2.module'

@NgModule({
  imports: [CommonModule, ProfileV2Module],
  exports: [ProfileV2Module],
})
export class RouteProfileV2Module {

}
