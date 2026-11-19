import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core'
import { MultilingualTranslationsService, NsContent } from '@sunbird-cb/utils-v2'
import { NSPractice } from '../../practice.model'
import { ActivatedRoute } from '@angular/router'
import { ViewerHeaderSideBarToggleService } from './../../../../viewer-header-side-bar-toggle.service'
import { FinalAssessmentPopupComponent } from './../final-assessment-popup/final-assessment-popup.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

/** Intro shown instead of the assessment summary, instructions and consent checkbox */
export interface IQuestionnaireIntro {
  start: string
  heading: string
  description: string
}

/**
 * Questionnaires by `contextCategory`: survey-style, no time limit, retakes or pass mark, nothing to agree to
 * before starting. Add a category here to give it the same layout.
 */
export const QUESTIONNAIRE_INTROS: Record<string, IQuestionnaireIntro> = {
  'Baseline Assessment': {
    start: 'Start Questionnaire',
    heading: 'About this baseline questionnaire',
    description: 'This baseline questionnaire is the first milestone of the Leadership as a Mission workshop. '
      + 'It captures where you stand today, before the workshop begins, so your growth can be seen over the journey ahead. '
      + 'There are no right or wrong answers — please respond honestly, based on your own experience and practice.',
  },
  'Endline Assessment': {
    start: 'Start Questionnaire',
    heading: 'About this endline questionnaire',
    description: 'Congratulations on completing the Leadership as a Mission workshop! '
      + 'We hope it has given you meaningful insights and practical ways to grow as a leader. '
      + 'This endline questionnaire is the final milestone of your journey — it helps you reflect on how your thinking '
      + 'and practice have evolved since the baseline. There are no right or wrong answers — please respond honestly, '
      + 'based on your own experience.',
  },
}
@Component({
    selector: 'viewer-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    standalone: false
})
export class OverviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() learningObjective = ''
  @Input() complexityLevel = ''
  @Input() primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
  @Input() duration = 0
  @Input() timeLimit = 0
  @Input() noOfQuestions = 0
  @Input() canAttempt!: NSPractice.IRetakeAssessment
  @Input() coursePrimaryCategory: any
  @Input() courseCategory: any
  @Input() instructionAssessment: any
  @Input() selectedAssessmentCompatibilityLevel: any
  @Output() userSelection = new EventEmitter<NSPractice.TUserSelectionType>()
  @Input() forPreview = false
  @Input() quizData: any
  /** From the practice player; falls back to the route content */
  @Input() contextCategory = ''
  /** The player's section-load status: on 'error' the Start button stops loading and can be pressed again */
  @Input() sectionsStatus = ''
  forCreatorMode = window.location.href.includes('editMode=true')
  questionTYP = NsContent.EPrimaryCategory
  // staticImage = '/assets/images/exam/practice-test.png'
  staticImage = '/assets/images/exam/practice-result.png'
  loading = false
  points = [
    { icon: 'info', text: 'No negative marking' },
    { icon: 'info', text: 'Assessment will have time duration' },
    { icon: 'info', text: 'Skipped question can be attempted again before submitting' },
  ]
  isretakeAllowed = false
  dataSubscription: any
  consentGiven = false
  maxAttempPopup = false
  currentPage = 0
  contentData: any

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public snackbar: MatSnackBar,
    public viewerHeaderSideBarToggleService: ViewerHeaderSideBarToggleService,
    private langtranslations: MultilingualTranslationsService,
  ) { }

  ngOnInit() {
    this.dataSubscription = this.route.data.subscribe(data => {
      this.contentData = data?.content?.data
      // a questionnaire has no consent checkbox: Start is enabled straight away
      if (this.questionnaire) {
        this.consentGiven = true
      }

      if (data && data.pageData) {
        this.isretakeAllowed = data.pageData.data.isretakeAllowed
      }
    })
  }

  /** Intro for a questionnaire category (e.g. Baseline Assessment), else undefined */
  get questionnaire(): IQuestionnaireIntro | undefined {
    return QUESTIONNAIRE_INTROS[this.contextCategory || this.contentData?.contextCategory || '']
  }

  ngOnChanges() {
    if (this.sectionsStatus === 'error') {
      this.loading = false
    }
    if (this.questionnaire) {
      this.consentGiven = true
    }
    if (!this.forPreview) {
      if (this.canAttempt && (this.canAttempt.attemptsMade >= this.canAttempt.attemptsAllowed) &&
        this.questionTYP.FINAL_ASSESSMENT === this.primaryCategory) {
        if (!this.maxAttempPopup && this.selectedAssessmentCompatibilityLevel > 6) {
          this.showAssessmentPopup()
        }
      }
    }

  }

  showAssessmentPopup() {
    this.maxAttempPopup = true
    const popupData = {
      headerText: 'this.resourceName',
      assessmentType: 'maxAttemptReached',
      primaryCategory: this.primaryCategory,
      canAttempt: this.canAttempt,
      warningNote: 'Do you want to submit your test finally. After submitting test, you will have to start the test from beginning.',
      buttonsList: [
        {
          response: 'yes',
          text: 'Ok',
          classes: 'blue-full',
        },
      ],
    }
    const dialogRef = this.dialog.open(FinalAssessmentPopupComponent, {
      data: popupData,
      width: '626px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '225px',
      panelClass: 'final-assessment',
    })
    // dialogRef.componentInstance.xyz = this.configSvc
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        switch (result) {
          case 'yes':
            this.maxAttempPopup = false
            // this.submitQuiz()
            break
        }

      }
    })
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  overviewed(event: NSPractice.TUserSelectionType) {
    if ((this.forPreview && !this.forCreatorMode) &&
      this.primaryCategory === this.questionTYP.FINAL_ASSESSMENT) {
      if (this.quizData && this.quizData.isPublic) {
        this.loading = true
        this.userSelection.emit(event)
        this.viewerHeaderSideBarToggleService.visibilityStatus.next(false)
      } else {
        this.snackbar.open('The content is not available to access.')
      }
    } else {
      this.loading = true
      this.userSelection.emit(event)
      this.viewerHeaderSideBarToggleService.visibilityStatus.next(false)
    }
  }

  translateLabels(label: string, type: any) {
    return this.langtranslations.translateLabel(label, type, '')
  }

  startTestEnable(event: any) {
    // tslint:disable-next-line
    console.log('event', event)
    this.consentGiven = !this.consentGiven
  }

  nextPage(): void {
    if (this.instructionAssessment && (this.currentPage < this.instructionAssessment.length - 1)) {
      this.currentPage = this.currentPage + 1
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage = this.currentPage - 1
    }
  }
}
