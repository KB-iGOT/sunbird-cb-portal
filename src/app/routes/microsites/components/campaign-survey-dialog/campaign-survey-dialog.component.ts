import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AppTocService, SurveyFormQuestionComponent } from '@sunbird-cb/toc'
import { MicrositeTelemetryService } from '../../services/microsite-telemetry.service'
import { DEFAULT_MILESTONE_LABELS, DEFAULT_SURVEY_ANSWER_LIMITS, NsCampaignMicrosite, buildSurveyForm, formatLabel, toFormDetails, toResponse } from '../../models/campaign-microsite.model'

@Component({
  selector: 'ws-app-campaign-survey-dialog',
  imports: [NgTemplateOutlet, ReactiveFormsModule, MatProgressSpinnerModule, SurveyFormQuestionComponent],
  templateUrl: './campaign-survey-dialog.component.html',
  styleUrl: './campaign-survey-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignSurveyDialogComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<CampaignSurveyDialogComponent, boolean>>(MatDialogRef)
  private readonly fb = inject(FormBuilder)
  private readonly tocSvc = inject(AppTocService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly destroyRef = inject(DestroyRef)
  private readonly telemetry = inject(MicrositeTelemetryService)

  readonly data = inject<NsCampaignMicrosite.ICampaignSurveyDialogData>(MAT_DIALOG_DATA)
  /** Page text from config (passed by the milestones section) */
  private readonly pageLabels = this.data.labels || DEFAULT_MILESTONE_LABELS
  readonly labels = { close: this.pageLabels.close, ...this.pageLabels.survey }

  readonly details = signal<NsCampaignMicrosite.ISurveyFormDetails | null>(null)
  readonly model = signal<NsCampaignMicrosite.ISurveyFormModel | null>(null)
  readonly isLoading = signal(false)
  readonly loadFailed = signal(false)
  readonly isSubmitting = signal(false)
  readonly isValid = signal(false)
  readonly isCommitted = signal(false)
  readonly canSubmit = computed(() => this.isValid() && this.isCommitted() && !this.isSubmitting())

  ngOnInit(): void {
    this.loadForm()
  }

  /** Retry after the form failed to load */
  retry(): void {
    this.track('sankalp-retry')
    this.loadForm()
  }

  loadForm(): void {
    const formId = this.data.milestone.formId
    if (!formId) {
      this.loadFailed.set(true)
      return
    }
    this.isLoading.set(true)
    this.loadFailed.set(false)
    this.tocSvc.getFormById(formId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        const details = toFormDetails(response)
        const model = buildSurveyForm(this.fb, details.fields, this.data.milestone.answerLimits ?? DEFAULT_SURVEY_ANSWER_LIMITS)
        model.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncValidity())
        this.details.set(details)
        this.model.set(model)
        this.syncValidity()
        this.isLoading.set(false)
      },
      error: () => {
        this.isLoading.set(false)
        this.loadFailed.set(true)
      },
    })
  }

  // the TOC question components swap validators for N/A answers
  syncValidity(): void {
    this.isValid.set(!!this.model()?.form.valid)
  }

  submit(): void {
    const model = this.model()
    const details = this.details()
    if (!model || !details || this.isSubmitting()) {
      return
    }
    model.form.markAllAsTouched()
    this.syncValidity()
    if (!this.isValid() || !this.isCommitted()) {
      return
    }

    this.track('sankalp-submit')
    const { milestone } = this.data
    const body = {
      formId: milestone.formId,
      version: details.version,
      status: 'SUBMITTED',
      responses: model.controls.map(toResponse),
      contextType: details.contextType,
      contextId: milestone.formId,
      contextName: milestone.name,
      contextOrgId: '',
    }
    this.isSubmitting.set(true)
    this.tocSvc.submitForm(body).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.isSubmitting.set(false)
        if (response?.params?.status === 'success') {
          this.notify(this.labels.submitted)
          this.dialogRef.close(true)
        } else {
          this.notify(response?.errorMessage || this.labels.submitError)
        }
      },
      error: () => {
        this.isSubmitting.set(false)
        this.notify(this.labels.submitError)
      },
    })
  }

  /** "45/300" under a limited answer */
  charCount(answer: unknown, max: number): string {
    const count = typeof answer === 'string' ? answer.length : 0
    return formatLabel(this.labels.charCount, { count, max })
  }

  minChars(min: number): string {
    return formatLabel(this.labels.minChars, { min })
  }

  /** Message under a question the user has been in: empty when required, else too short; '' when fine */
  answerError(answer: AbstractControl, limit: NsCampaignMicrosite.IAnswerRule | undefined): string {
    if (!answer.touched) {
      return ''
    }
    if (answer.hasError('required')) {
      return this.labels.required
    }
    return limit?.minLength && answer.hasError('minlength') ? this.minChars(limit.minLength) : ''
  }

  /** `button`: the X in the header (`close`) or Cancel in the footer (`cancel`), told apart in telemetry */
  close(button: 'close' | 'cancel' = 'close'): void {
    this.track(`sankalp-${button}`)
    this.dialogRef.close(false)
  }

  private track(id: string): void {
    this.telemetry.click('sankalp-form', id, { id: this.data.milestone.formId || '', type: 'survey' })
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'X', { duration: 5000 })
  }
}
