import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

import { UserProfileService } from '../../../user-profile/services/user-profile.service';
import { ViewCustomFieldsComponent } from './view-custom-fields.component';

describe('ViewCustomFieldsComponent', () => {
  let component: ViewCustomFieldsComponent;
  let fixture: ComponentFixture<ViewCustomFieldsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCustomFieldsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: UserProfileService, useValue: { readOrgData: jest.fn().mockReturnValue(of({})) } },
        { provide: ConfigurationsService, useValue: { userProfile: { userId: 'user-id', rootOrgId: 'org-id' } } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: BreakpointObserver, useValue: { observe: jest.fn().mockReturnValue(of({ matches: false })) } },
        { provide: ActivatedRoute, useValue: { fragment: of(null) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ViewCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
