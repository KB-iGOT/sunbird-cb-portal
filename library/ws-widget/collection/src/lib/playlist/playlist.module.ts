import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'


import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@sunbird-cb/utils-v2'
import { PlaylistCardComponent } from './components/playlist-card/playlist-card.component'
import { PlaylistContentDeleteDialogComponent } from './components/playlist-content-delete-dialog/playlist-content-delete-dialog.component'
import { PlaylistContentDeleteErrorDialogComponent } from './components/playlist-content-delete-error-dialog/playlist-content-delete-error-dialog.component'
import { PlaylistDeleteDialogComponent } from './components/playlist-delete-dialog/playlist-delete-dialog.component'
import { PlaylistShareDialogComponent } from './components/playlist-share-dialog/playlist-share-dialog.component'
import { FilterPlaylistPipe } from './pipes/filter-playlist.pipe'
import { PlaylistRoutingModule } from './playlist-routing.module'
import { PlaylistCreateComponent } from './routes/playlist-create/playlist-create.component'
import { PlaylistDetailComponent } from './routes/playlist-detail/playlist-detail.component'
import { PlaylistEditComponent } from './routes/playlist-edit/playlist-edit.component'
import { PlaylistHomeComponent } from './routes/playlist-home/playlist-home.component'
import { PlaylistNotificationComponent } from './routes/playlist-notification/playlist-notification.component'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatRippleModule } from '@angular/material/core'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { BtnPlaylistModule } from '../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { PickerContentModule } from '../picker-content/picker-content.module'
import { TreeCatalogModule } from '../tree-catalog/tree-catalog.module'
import { DisplayContentsModule } from '../_common/display-contents/display-contents.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { UserAutocompleteModule } from '../_common/user-autocomplete/user-autocomplete.module'
import { TourModule } from '../_common/tour-guide/tour-guide.module'
import { ContentPickerV2Module } from '../_common/content-picker-v2/content-picker-v2.module'
import { BtnLinkedinShareModule } from '../btn-linkedin-share/btn-linkedin-share.module'
import { BtnFacebookShareModule } from '../btn-facebook-share/btn-facebook-share.module'
import { BtnTwitterShareModule } from '../btn-twitter-share/btn-twitter-share.module'
@NgModule({
    declarations: [
        PlaylistCardComponent,
        PlaylistContentDeleteDialogComponent,
        PlaylistDeleteDialogComponent,
        PlaylistHomeComponent,
        PlaylistEditComponent,
        PlaylistNotificationComponent,
        PlaylistDetailComponent,
        FilterPlaylistPipe,
        PlaylistCreateComponent,
        PlaylistShareDialogComponent,
        PlaylistContentDeleteErrorDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PlaylistRoutingModule,
        BtnPlaylistModule,
        BtnPageBackModule,
        SbUiResolverModule,
        DisplayContentTypeModule,
        PickerContentModule,
        PipeDurationTransformModule,
        DragDropModule,
        // EmailInputModule,
        TreeCatalogModule,
        DefaultThumbnailModule,
        DisplayContentsModule,
        UserImageModule,
        UserAutocompleteModule,
        TourModule,
        ContentPickerV2Module,
        // material imports
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatRippleModule,
        MatButtonModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDialogModule,
        MatCardModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTooltipModule,
        MatProgressBarModule,
        BtnLinkedinShareModule,
        BtnFacebookShareModule,
        BtnTwitterShareModule,
    ]
})
export class PlaylistModule { }
