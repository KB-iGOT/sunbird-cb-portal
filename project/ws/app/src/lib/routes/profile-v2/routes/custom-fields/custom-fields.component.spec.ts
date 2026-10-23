import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

import { UserProfileService } from '../../../user-profile/services/user-profile.service';
import { CustomFieldsComponent } from './custom-fields.component';

describe('CustomFieldsComponent', () => {
  let component: CustomFieldsComponent;
  let fixture: ComponentFixture<CustomFieldsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomFieldsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: UserProfileService, useValue: { readOrgData: jest.fn().mockReturnValue(of({})) } },
        { provide: ConfigurationsService, useValue: { userProfile: { userId: 'user-id', rootOrgId: 'org-id' } } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { editConfig: {}, apiConfig: {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(CustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
