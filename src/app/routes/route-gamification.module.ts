import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GamificationModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GamificationModule
    ,
  ],
  exports: [
    GamificationModule,
  ],
})
export class RouteGamificationModule { }
