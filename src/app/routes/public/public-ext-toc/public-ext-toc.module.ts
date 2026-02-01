import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicExtTocComponent } from './public-ext-toc.component'
import { RouterModule } from '@angular/router'
import { AppTocService, BtnPageBackNavModule, AppTocModule } from '@sunbird-cb/collection'

@NgModule({
    declarations: [PublicExtTocComponent],
    imports: [
        CommonModule,
        RouterModule,
        AppTocModule,
        BtnPageBackNavModule,
    ],
    exports: [PublicExtTocComponent],
    providers: [AppTocService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PublicExtTocModule { }
