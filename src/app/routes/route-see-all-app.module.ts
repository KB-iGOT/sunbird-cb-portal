import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SeeAllModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SeeAllModule,
  ],
  exports: [
    SeeAllModule,
  ],
})
export class RouteSeeAllAppModule { }
