import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { SearchV3Module } from '../../../project/ws/app/src/lib/routes/search-v3/search-v3.module'
import { SearchListingModule } from '@sunbird-cb/search-listing'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SearchListingModule,
  ],
  exports: [
    SearchListingModule,
  ],
})
export class RouteSearchV3AppModule { }
