import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByProviderModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, BrowseByProviderModule],
  exports: [BrowseByProviderModule],
})
export class RouteBrowseProviderModule { }
