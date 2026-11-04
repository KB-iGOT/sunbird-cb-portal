import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { AppTocService, SurveyFormQuestionComponent, SurveyFormSectionComponent } from '@sunbird-cb/toc'
import { NsCampaignMicrosite, SURVEY_LABELS, buildSurveyForm, toFormDetails, toResponse } from '../../models/campaign-microsite.model'

@Component({
  selector: 'ws-app-campaign-survey-dialog',
  imports: [ReactiveFormsModule, MatProgressSpinnerModule, TranslateModule, SurveyFormQuestionComponent, SurveyFormSectionComponent],
  templateUrl: './campaign-survey-dialog.component.html',
  styleUrl: './campaign-survey-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignSurveyDialogComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<CampaignSurveyDialogComponent, boolean>>(MatDialogRef)
  private readonly fb = inject(FormBuilder)
  private readonly tocSvc = inject(AppTocService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly translate = inject(TranslateService)
  private readonly destroyRef = inject(DestroyRef)

  readonly data = inject<NsCampaignMicrosite.ICampaignSurveyDialogData>(MAT_DIALOG_DATA)
  readonly labels = SURVEY_LABELS

  readonly details = signal<NsCampaignMicrosite.ISurveyFormDetails | null>(null)
  readonly model = signal<NsCampaignMicrosite.ISurveyFormModel | null>(null)
  readonly isLoading = signal(false)
  readonly loadFailed = signal(false)
  readonly isSubmitting = signal(false)
  readonly isValid = signal(false)

  ngOnInit(): void {
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
        const model = buildSurveyForm(this.fb, details.fields)
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
    if (!this.isValid()) {
      return
    }

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

  close(): void {
    this.dialogRef.close(false)
  }

  private notify(message: string): void {
    this.snackBar.open(this.translate.instant(message), 'X', { duration: 5000 })
  }
}
