import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProfileModule,
  ],
  exports: [
    ProfileModule,
  ],
})
export class RouteProfileAppModule { }
