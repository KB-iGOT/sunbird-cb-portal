import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlaylistModule } from '@ws/app/src/lib/routes/playlist/playlist.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PlaylistModule,
  ],
  exports: [
    PlaylistModule,
  ],
})
export class RoutePlaylistAppModule { }
