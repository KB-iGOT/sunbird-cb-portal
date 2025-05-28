import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { WidgetResolverModule } from '@sunbird-cb/resolver/src/lib/widget-resolver.module'
import { QuickTourComponent } from './quick-tour.component'

@NgModule({
  declarations: [QuickTourComponent],
  imports: [
    CommonModule,
    WidgetResolverModule,
  ],
  exports: [QuickTourComponent],
})
export class QuickTourModule { }
