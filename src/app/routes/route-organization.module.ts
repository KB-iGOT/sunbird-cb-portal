import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrganizationModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, OrganizationModule],
  exports: [OrganizationModule],
})
export class RouteOrganizationModule {

}
