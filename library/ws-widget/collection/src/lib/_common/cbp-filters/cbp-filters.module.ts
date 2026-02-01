import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { CbpFiltersComponent } from './cbp-filters.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { MatTabsModule } from '@angular/material/tabs'
import { FilterSearchPipeModule } from '../../_pipes/filter-search.module'

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatTabsModule,
        MatBottomSheetModule,
        MatMenuModule,
        MatRadioModule,
        FilterSearchPipeModule,
        TranslateModule,
    ],
    exports: [
        CbpFiltersComponent,
    ],
    declarations: [
        CbpFiltersComponent,
    ],
    providers: [],
})

export class CbpFiltersModule { }
