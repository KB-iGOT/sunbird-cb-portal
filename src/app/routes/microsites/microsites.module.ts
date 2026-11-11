import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MicrosotesComponent } from './microsotes.component'
import { ContentStripWithTabsModule } from '@sunbird-cb/collection/src/lib/content-strip-with-tabs/content-strip-with-tabs.module'
import { SlidersModule } from '@sunbird-cb/collection/src/lib/sliders/sliders.module'
import { CardsModule, CommonMethodsService, CompetencyPassbookModule, ContentStripWithTabsLibModule, DataPointsModule, SlidersLibModule } from '@sunbird-cb/consumption'
import { MicrositeService } from './microsites.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', component: MicrosotesComponent },
]

@NgModule({
  declarations: [MicrosotesComponent],
  imports: [
    CommonModule,
    MatIconModule,
    SlidersModule,
    ContentStripWithTabsModule,
    ContentStripWithTabsLibModule,
    DataPointsModule,
    SlidersLibModule,
    CompetencyPassbookModule,
    MatFormFieldModule,
    MatInputModule,
    CardsModule,
    RouterModule.forChild(routes),
  ],
  providers: [MicrositeService, CommonMethodsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MicrositesModule { }
