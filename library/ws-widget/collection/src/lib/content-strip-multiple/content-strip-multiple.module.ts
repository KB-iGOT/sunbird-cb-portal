import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ContentStripMultipleComponent } from './content-strip-multiple.component'
import { HorizontalScrollerModule } from '@sunbird-cb/utils-v2'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
    declarations: [ContentStripMultipleComponent],
    imports: [
        CommonModule,
        RouterModule,
        HorizontalScrollerModule,
        WidgetResolverModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatCardModule,
        TranslateModule.forChild(),
    ],
    exports: [ContentStripMultipleComponent]
})
export class ContentStripMultipleModule { }
