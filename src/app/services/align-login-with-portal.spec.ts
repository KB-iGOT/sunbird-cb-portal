import { alignLoginWithPortal } from './init.service'

describe('alignLoginWithPortal', () => {
  const realLocation = window.location
  const uatEnv = { sitePath: 'portal.uat.karmayogibharat.net' }
  const prodKeycloak = () => ({
    keycloak: {
      realm: 'sunbird',
      url: 'https://portal.igotkarmayogi.gov.in/protected/v8/resource',
      url2: 'https://portal.igotkarmayogi.gov.in/auth',
    },
  })

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...realLocation,
        host: 'portal.uat.karmayogibharat.net',
        hostname: 'portal.uat.karmayogibharat.net',
        origin: 'https://portal.uat.karmayogibharat.net',
      },
    })
  })

  afterEach(() => Object.defineProperty(window, 'location', { configurable: true, value: realLocation }))

  it('points login at this portal when the environment is this portal\'s', () => {
    const config = prodKeycloak()
    alignLoginWithPortal(config, uatEnv)
    expect(config.keycloak.url).toBe('https://portal.uat.karmayogibharat.net/protected/v8/resource')
    expect(config.keycloak.url2).toBe('https://portal.uat.karmayogibharat.net/auth')
    expect(config.keycloak.realm).toBe('sunbird')
  })

  it('leaves login alone when the environment is not this portal\'s', () => {
    const config = prodKeycloak()
    alignLoginWithPortal(config, { sitePath: 'portal.igotkarmayogi.gov.in' })
    expect(config.keycloak.url).toBe('https://portal.igotkarmayogi.gov.in/protected/v8/resource')
  })

  it('leaves relative or missing values alone', () => {
    const config: any = { keycloak: { url: '/protected/v8/resource' } }
    alignLoginWithPortal(config, uatEnv)
    expect(config.keycloak.url).toBe('/protected/v8/resource')
    expect(() => alignLoginWithPortal({}, uatEnv)).not.toThrow()
    expect(() => alignLoginWithPortal(undefined, uatEnv)).not.toThrow()
  })
})
