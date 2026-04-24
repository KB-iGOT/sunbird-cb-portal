import { LoginRootService } from './login-root.service'
import { LoginComponent } from '../login/login.component'

describe('LoginRootService', () => {
  let service: LoginRootService

  beforeEach(() => {
    service = new LoginRootService()
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  it('should return LoginComponent from getComponent', () => {
    expect(service.getComponent()).toBe(LoginComponent)
  })
})
