import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

import { SadhanaSaptahComponent } from './sadhana-saptah.component'

describe('SadhanaSaptahComponent', () => {
  let component: SadhanaSaptahComponent
  let fixture: ComponentFixture<SadhanaSaptahComponent>
  const formData = {
    data: { result: { form: { data: { sectionList: [{ key: 'a' }], individualSection: { b: 1 }, nlwConfig: { c: 2 } } } } },
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SadhanaSaptahComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { formData } } } },
        { provide: ConfigurationsService, useValue: { userProfile: {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(SadhanaSaptahComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.sectionList).toEqual([{ key: 'a' }])
    expect(component.individualSection).toEqual({ b: 1 })
    expect(component.nlwConfig).toEqual({ c: 2 })
  })
})
