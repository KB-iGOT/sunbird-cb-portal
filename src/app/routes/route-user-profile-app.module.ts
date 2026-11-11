import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserProfileModule } from '@ws/app/src/lib/routes/user-profile/user-profile.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, UserProfileModule],
  exports: [UserProfileModule],
})
export class RouteUserProfileAppModule { }
