import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorResponsiveComponent } from './selector-responsive.component'
import { LayoutModule } from '@angular/cdk/layout'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

@NgModule({
    declarations: [SelectorResponsiveComponent],
    imports: [CommonModule, LayoutModule, SbUiResolverModule],
    exports: [SelectorResponsiveComponent]
})
export class SelectorResponsiveModule { }
