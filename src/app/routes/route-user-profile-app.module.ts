import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserProfileModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [CommonModule, UserProfileModule],
  exports: [UserProfileModule],
})
export class RouteUserProfileAppModule { }
