import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileModule } from '@ws/app/src/lib/routes/profile/profile.module'

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
