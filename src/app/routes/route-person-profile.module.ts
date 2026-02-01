import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PersonProfileModule } from '@sunbird-cb/collection'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        PersonProfileModule,
    ],
    exports: [
        PersonProfileModule,
    ]
})
export class RoutePersonProfileModule { }
