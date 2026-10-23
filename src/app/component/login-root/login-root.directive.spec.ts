import { ViewContainerRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { LoginRootDirective } from './login-root.directive'

describe('LoginRootDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      LoginRootDirective,
      { provide: ViewContainerRef, useValue: autoMock() },
    ],
  }))

  it('should create an instance', () => {
    const directive: LoginRootDirective = TestBed.inject(LoginRootDirective)
    expect(directive).toBeTruthy()
  })
})
