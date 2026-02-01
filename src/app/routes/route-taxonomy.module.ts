import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TaxonomyModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, TaxonomyModule],
  exports: [TaxonomyModule],
})
export class RouteTaxonomyModule {

}
