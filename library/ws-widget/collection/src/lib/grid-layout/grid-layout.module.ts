import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GridLayoutComponent } from './grid-layout.component'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { FormsModule } from '@angular/forms'
import { NPSGridService } from './nps-grid.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'

@NgModule({
    declarations: [GridLayoutComponent],
    imports: [CommonModule, SbUiResolverModule, MatFormFieldModule,
        MatButtonModule, MatIconModule, FormsModule, TranslateModule, MatSnackBarModule],
    exports: [GridLayoutComponent],
    providers: [
        NPSGridService,
    ]
})
export class GridLayoutModule { }
