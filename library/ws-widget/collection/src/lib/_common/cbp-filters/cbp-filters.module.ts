import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { CbpFiltersComponent } from './cbp-filters.component'
import { FilterSearchPipe } from '../../_pipes/filter-search.pipe'
import { TranslateModule } from '@ngx-translate/core'
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { MatTabsModule } from '@angular/material/tabs'

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
        TranslateModule,
    ],
    exports: [
        CbpFiltersComponent,
        FilterSearchPipe,
    ],
    declarations: [
        CbpFiltersComponent,
        FilterSearchPipe,
    ],
    providers: [],
})

export class CbpFiltersModule { }
