import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'

import { DefaultLayoutComponent } from './default-layout/default-layout.component'
import { TenantLayoutV1Component } from './tenant-layout-v1/tenant-layout-v1.component'
import { TenantLayoutLoaderComponent } from './tenant-layout-loader/tenant-layout-loader.component'

import { HeaderModule } from '../header/header.module'
import { AppChatbotModule } from '../component/app-chatbot/app-chatbot.module'
import { FooterModule } from '../component/app-footer/footer.module'

/**
 * LayoutsModule
 *
 * Encapsulates all layout components used by the multi-tenant system.
 * Import this module in AppModule and use <app-tenant-layout-loader>
 * in the root component template.
 */
@NgModule({
  declarations: [
    DefaultLayoutComponent,
    TenantLayoutV1Component,
    TenantLayoutLoaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    HeaderModule,
    AppChatbotModule,
    FooterModule,
  ],
  exports: [
    TenantLayoutLoaderComponent,
    DefaultLayoutComponent,
    TenantLayoutV1Component,
  ],
})
export class LayoutsModule {}
