import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppTocModule } from '@ws/app/src/lib/routes/app-toc/app-toc.module'
import { MatDialogModule } from '@angular/material/dialog'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AppTocModule,
    MatDialogModule,
  ],
})
export class RouteAppTocModule { }
