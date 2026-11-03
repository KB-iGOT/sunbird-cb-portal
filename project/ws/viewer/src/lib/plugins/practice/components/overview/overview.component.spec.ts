import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MultilingualTranslationsService, NsContent } from '@sunbird-cb/utils-v2'
import { TranslateModule } from '@ngx-translate/core'
import { PipeDurationTransformModule, PipeLimitToModule } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

import { OverviewComponent } from './overview.component'
import { ViewerHeaderSideBarToggleService } from './../../../../viewer-header-side-bar-toggle.service'

describe('OverviewComponent', () => {
  let component: OverviewComponent
  let fixture: ComponentFixture<OverviewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      imports: [TranslateModule.forRoot(), PipeLimitToModule, PipeDurationTransformModule],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({}) } },
        { provide: MatDialog, useValue: { open: jest.fn(() => ({ afterClosed: () => of(null) })) } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: ViewerHeaderSideBarToggleService, useValue: { visibilityStatus: { next: jest.fn() } } },
        { provide: MultilingualTranslationsService, useValue: { translateLabel: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(OverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // checkForAssessmentSubmitAlready() used to fire its own canAttend/canAttendV5 request
  // here, duplicating the one practice.component.ts already makes and passes down via the
  // canAttempt input. It relied on PracticeService, which this component no longer injects.
  it('should no longer depend on PracticeService to resolve canAttempt', () => {
    expect((component as any).quizSvc).toBeUndefined()
  })

  it('should show the max-attempts popup from the canAttempt input alone, without fetching anything itself', () => {
    const dialog = TestBed.inject(MatDialog)
    component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
    component.selectedAssessmentCompatibilityLevel = 7
    component.canAttempt = { attemptsMade: 1, attemptsAllowed: 1 }

    component.ngOnChanges()

    expect(dialog.open).toHaveBeenCalled()
  })
})
