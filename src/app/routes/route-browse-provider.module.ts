import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowseByProviderModule } from '@ws/app/src/lib/routes/browse-by-provider/browse-by-provider.module'

@NgModule({
  imports: [CommonModule, BrowseByProviderModule],
  exports: [BrowseByProviderModule],
})
export class RouteBrowseProviderModule { }
