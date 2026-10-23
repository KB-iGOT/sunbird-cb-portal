import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { of } from 'rxjs'

import { GbSearchService } from '../../services/gb-search.service'
import { ShowAllComponent } from './show-all.component'

describe('ShowAllComponent', () => {
  let component: ShowAllComponent
  let fixture: ComponentFixture<ShowAllComponent>
  const gbSvcMock = {
    exploreContent: jest.fn().mockReturnValue(of({ result: { content: [] } })),
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowAllComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: GbSearchService, useValue: gbSvcMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { name: 'test' } } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ShowAllComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.contentName).toBe('test')
    expect(gbSvcMock.exploreContent).toHaveBeenCalled()
  })
})
