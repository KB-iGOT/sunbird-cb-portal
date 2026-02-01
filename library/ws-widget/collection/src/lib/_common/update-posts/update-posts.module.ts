import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SkeletonLoaderModule } from './../skeleton-loader/skeleton-loader.module'

import { UpdatePostsComponent } from './update-posts.component'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { HttpLoaderFactory } from './../../_services/http-loader.factory'

@NgModule({
    declarations: [UpdatePostsComponent],
    imports: [
        CommonModule,
        SkeletonLoaderModule,
        MatIconModule,
        RouterModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    exports: [
        UpdatePostsComponent,
    ]
})

export class UpdatePostsModule { }
