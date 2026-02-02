import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardNotifyComponent } from './card-notify.component'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
    declarations: [CardNotifyComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        TranslateModule,
    ],
    exports: [CardNotifyComponent]
})
export class CardNotifyModule { }
