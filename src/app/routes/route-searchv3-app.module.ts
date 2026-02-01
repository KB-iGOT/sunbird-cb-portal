import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchV3Module } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SearchV3Module,
  ],
  exports: [
    SearchV3Module,
  ],
})
export class RouteSearchV3AppModule { }
