import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DiscussModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, DiscussModule],
  exports: [DiscussModule],
})
export class RouteDiscussModule {

}
