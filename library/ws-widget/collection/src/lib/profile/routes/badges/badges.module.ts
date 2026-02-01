import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BadgesComponent } from './badges.component'

import { BadgesCardComponent } from './components/badges-card/badges-card.component'
import { BadgesShareDialogComponent } from './components/badges-share-dialog/badges-share-dialog.component'
import { BadgesNotEarnedComponent } from './components/badges-not-earned/badges-not-earned.component'
import { HorizontalScrollerModule, DefaultThumbnailModule } from '@sunbird-cb/utils-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BtnLinkedinShareModule } from '../../../btn-linkedin-share/btn-linkedin-share.module'
import { BtnFacebookShareModule } from '../../../btn-facebook-share/btn-facebook-share.module'
import { BtnTwitterShareModule } from '../../../btn-twitter-share/btn-twitter-share.module'

@NgModule({
    declarations: [BadgesComponent, BadgesCardComponent, BadgesNotEarnedComponent, BadgesShareDialogComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatProgressBarModule,
        HorizontalScrollerModule,
        DefaultThumbnailModule,
        MatMenuModule,
        BtnLinkedinShareModule,
        BtnFacebookShareModule,
        BtnTwitterShareModule,
    ]
})
export class BadgesModule { }
