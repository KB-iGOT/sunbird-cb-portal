import { NgModule } from '@angular/core'
import { CardHubsListComponent } from './card-hubs-list.component'
import { CommonModule } from '@angular/common'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { HorizontalScrollerModule, PipeNameTransformModule, PipeOrderByModule } from '@sunbird-cb/utils-v2'
import { RouterModule } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { HttpLoaderFactory } from '../collection-utils'
import { ClickOutsideDirective } from './clickoutside.directive'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@NgModule({
    declarations: [CardHubsListComponent,
        ClickOutsideDirective],
    imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule,
        MatExpansionModule, MatIconModule, MatProgressSpinnerModule, AvatarPhotoModule,
        HorizontalScrollerModule, PipeNameTransformModule, PipeOrderByModule, RouterModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        })]
})
export class CardHubsListModule {

}
