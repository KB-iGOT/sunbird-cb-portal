import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutLinearComponent } from './layout-linear.component'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
@NgModule({
    declarations: [LayoutLinearComponent],
    imports: [CommonModule, SbUiResolverModule]
})
export class LayoutLinearModule { }
