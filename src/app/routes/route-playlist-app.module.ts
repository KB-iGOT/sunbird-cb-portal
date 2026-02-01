import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlaylistModule } from '@sunbird-cb/collection'

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
