import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SearchModule,
  ],
  exports: [
    SearchModule,
  ],
})
export class RouteSearchAppModule { }
