import { CommonModule, DatePipe } from '@angular/common'
import { NgModule } from '@angular/core'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BtnPageBackModule, PageModule } from '@sunbird-cb/collection'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { ClientAnalyticsComponent } from './components/client-analytics/client-analytics.component'
import { ContentComponent } from './components/content/content.component'
import { HomeComponent } from './components/home/home.component'
import { QuarterFiltersComponent } from './components/quarter-filters/quarter-filters.component'
import { LearningAnalyticsRoutingModule } from './learning-analytics-routing.module'
import { AnalyticsComponent } from './routes/analytics/analytics.component'
import { AnalyticsDirective } from './routes/analytics/analytics.directive'
import { ContentCardComponent } from './components/content-card/content-card.component'
import { ProgressRadialComponent } from './components/progress-radial/progress-radial.component'
import { AnalyticsTileComponent } from './components/analytics-tile/analytics-tile.component'
import { QuarterServiceService } from './services/quarter-filter.service'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatStepperModule } from '@angular/material/stepper'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
    declarations: [
        AnalyticsComponent,
        ClientAnalyticsComponent,
        AnalyticsDirective,
        QuarterFiltersComponent,
        HomeComponent,
        ContentComponent,
        ContentCardComponent,
        ProgressRadialComponent,
        AnalyticsTileComponent,
    ],
    imports: [
        CommonModule,
        LearningAnalyticsRoutingModule,
        WidgetResolverModule,
        PageModule,
        BtnPageBackModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatListModule,
        MatRippleModule,
        MatSidenavModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatGridListModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatStepperModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatMenuModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatRadioModule,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
    ],
    providers: [DatePipe, QuarterServiceService]
})
export class LearningAnalyticsModule { }
