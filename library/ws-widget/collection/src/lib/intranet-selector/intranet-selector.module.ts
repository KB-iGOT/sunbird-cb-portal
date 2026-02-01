import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IntranetSelectorComponent } from './intranet-selector.component'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

@NgModule({
    declarations: [IntranetSelectorComponent],
    imports: [
        CommonModule,
        SbUiResolverModule,
    ]
})
export class IntranetSelectorModule { }
