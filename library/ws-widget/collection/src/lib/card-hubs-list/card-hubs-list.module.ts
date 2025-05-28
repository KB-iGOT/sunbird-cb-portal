import { NgModule } from '@angular/core'
import { CardHubsListComponent } from './card-hubs-list.component'
import { BrowserModule } from '@angular/platform-browser'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { HorizontalScrollerModule, PipeNameTransformModule, PipeOrderByModule } from '@sunbird-cb/utils-v2'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ClickOutsideDirective } from './clickoutside.directive'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'

@NgModule({
    declarations: [CardHubsListComponent,
        ClickOutsideDirective],
    imports: [BrowserModule, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule,
        MatExpansionModule, MatIconModule, MatProgressSpinnerModule, AvatarPhotoModule,
        HorizontalScrollerModule, PipeNameTransformModule, PipeOrderByModule, RouterModule,
        TranslateModule.forRoot()]
})
export class CardHubsListModule {

}
