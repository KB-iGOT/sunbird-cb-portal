import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileV2Module } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, ProfileV2Module],
  exports: [ProfileV2Module],
})
export class RouteProfileV2Module {

}
