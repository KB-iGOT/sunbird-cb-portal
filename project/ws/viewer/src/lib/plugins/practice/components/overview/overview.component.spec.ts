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

  describe('questionnaire (contextCategory "Baseline Assessment")', () => {
    const el = () => fixture.nativeElement as HTMLElement
    const show = (setup: () => void) => {
      setup()
      component.ngOnChanges()
      fixture.detectChanges()
    }
    const buttonTexts = () => Array.from(el().querySelectorAll('button span.padding-xs')).map(span => span.textContent?.trim())

    it('shows the intro and "Start Questionnaire", hides time / summary / consent, and Start needs no consent', () => {
      show(() => {
        component.contextCategory = 'Baseline Assessment'
        component.selectedAssessmentCompatibilityLevel = 7
        component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
        component.noOfQuestions = 5
        component.timeLimit = 600
      })
      expect(el().querySelector('.questionnaire-intro__heading')?.textContent?.trim()).toBe('About this baseline questionnaire')
      expect(el().querySelector('.questionnaire-intro__text')?.textContent).toContain('first milestone of the Leadership as a Mission workshop')
      expect(buttonTexts().every(text => text === 'Start Questionnaire')).toBe(true)
      expect(buttonTexts().length).toBeGreaterThan(0)
      expect(el().querySelector('.summary-standalone')).toBeNull()
      expect(el().querySelector('.consent-checkbox')).toBeNull()
      expect(el().querySelector('img[src*="timer.svg"]')).toBeNull()
      expect(component.consentGiven).toBe(true)
    })

    it('falls back to the route content\'s contextCategory', () => {
      component.contentData = { contextCategory: 'Baseline Assessment' }
      expect(component.questionnaire?.start).toBe('Start Questionnaire')
    })

    it('"Endline Assessment" gets the endline intro and Start Questionnaire', () => {
      show(() => {
        component.contextCategory = 'Endline Assessment'
        component.selectedAssessmentCompatibilityLevel = 7
        component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      })
      expect(component.questionnaire?.start).toBe('Start Questionnaire')
      expect(el().querySelector('.questionnaire-intro__heading')?.textContent?.trim()).toBe('About this endline questionnaire')
      expect(el().querySelector('.questionnaire-intro__text')?.textContent).toContain('final milestone of your journey')
      expect(el().querySelector('.summary-standalone')).toBeNull()
      expect(component.consentGiven).toBe(true)
    })

    it('other assessments keep the summary, consent and normal button', () => {
      show(() => {
        component.contextCategory = 'Final Milestone Assessment'
        component.selectedAssessmentCompatibilityLevel = 7
        component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      })
      expect(component.questionnaire).toBeUndefined()
      expect(el().querySelector('.questionnaire-intro')).toBeNull()
      expect(el().querySelector('.summary-standalone')).not.toBeNull()
      expect(component.consentGiven).toBe(false)
    })
  })

  it('stops the Start spinner when the assessment fails to load, so Start can be pressed again', () => {
    component.loading = true
    component.sectionsStatus = 'error'
    component.ngOnChanges()
    expect(component.loading).toBe(false)
  })
})
