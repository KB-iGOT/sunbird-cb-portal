import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { AppFooterComponent } from './app-footer.component'
import { FooterSectionComponent } from './footer-section/footer-section.component'

import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { TranslateModule } from '@ngx-translate/core'
import { PipeOrderByModule } from '@sunbird-cb/utils-v2'

/**
 * FooterModule
 *
 * Encapsulates the app footer and its sub-components so they can be
 * shared across AppModule and LayoutsModule.
 */
@NgModule({
  declarations: [
    AppFooterComponent,
    FooterSectionComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    TranslateModule,
    PipeOrderByModule,
  ],
  exports: [
    AppFooterComponent,
    FooterSectionComponent,
  ],
})
export class FooterModule {}
