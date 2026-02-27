import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MfeWrapperComponent } from './mfe-wrapper.component'

/**
 * MfeModule — Shared module providing the MFE wrapper infrastructure.
 *
 * CUSTOM_ELEMENTS_SCHEMA is required so Angular doesn't complain about
 * unknown element tags (igot-mfe-home, igot-mfe-search, etc.) that are
 * registered at runtime by the remote Web Components.
 */
@NgModule({
  declarations: [MfeWrapperComponent],
  imports: [CommonModule, RouterModule],
  exports: [MfeWrapperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MfeModule {}
