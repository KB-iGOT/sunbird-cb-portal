import { inject, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { ContentAssignService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentAssignmentGuard } from './content-assignment.guard'

describe('ContentAssignmentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentAssignmentGuard,
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ContentAssignService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
    })
  })

  it('should ...', inject([ContentAssignmentGuard], (guard: ContentAssignmentGuard) => {
    expect(guard).toBeTruthy()
  }))
})
