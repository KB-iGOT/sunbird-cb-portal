import { NgModule } from '@angular/core'
import { CardActivityComponent } from './card-activity.component'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { CommonModule } from '@angular/common'

import { MatTooltipModule } from '@angular/material/tooltip'
import { MatGridListModule } from '@angular/material/grid-list'
import { HorizontalScrollerModule } from '@sunbird-cb/utils-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@NgModule({
    declarations: [CardActivityComponent],
    imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatGridListModule,
        MatExpansionModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatFormFieldModule,
        MatTooltipModule, HorizontalScrollerModule]
})
export class CardActivityModule {

}
