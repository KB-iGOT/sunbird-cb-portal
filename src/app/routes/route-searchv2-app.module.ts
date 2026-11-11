import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Searchv2Module } from '@ws/app/src/lib/routes/search-v2/searchv2.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    Searchv2Module,
  ],
  exports: [
    Searchv2Module,
  ],
})
export class RouteSearchV2AppModule { }
