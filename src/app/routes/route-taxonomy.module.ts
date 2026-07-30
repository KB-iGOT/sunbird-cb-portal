import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TaxonomyModule } from '@ws/app/src/lib/routes/taxonomy/taxonomy.module'

@NgModule({
  imports: [CommonModule, TaxonomyModule],
  exports: [TaxonomyModule],
})
export class RouteTaxonomyModule {

}
