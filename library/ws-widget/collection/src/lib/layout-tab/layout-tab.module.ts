import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutTabComponent } from './layout-tab.component'
import { MatTabsModule } from '@angular/material/tabs'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
@NgModule({
    declarations: [LayoutTabComponent],
    imports: [CommonModule, MatTabsModule, SbUiResolverModule]
})
export class LayoutTabModule { }
