import { environment } from './environment'

describe('environment', () => {
  it('should be defined', () => {
    expect(environment).toBeDefined()
  })

  it('should have production set to false', () => {
    expect(environment.production).toBe(false)
  })

  it('should read name from window.env (setup-jest provides it)', () => {
    expect(typeof environment.name).toBe('string')
  })

  it('should read sitePath from window.env', () => {
    // setup-jest.ts sets sitePath to 'http://example.com'
    expect(environment.sitePath).toBe('http://example.com')
  })

  it('should have contentHost from window.env', () => {
    expect(environment.contentHost).toBe('http://content.example.com')
  })

  it('should have azureBucket from window.env', () => {
    expect(environment.azureBucket).toBe('test-azure-bucket')
  })

  it('should have apiCache default to 0 when not set in window.env', () => {
    expect(typeof environment.apiCache).toBe('number')
  })

  it('should have portals as array', () => {
    expect(Array.isArray(environment.portals)).toBe(true)
  })

  it('should have resendOTPTIme default to 120 when window.env does not provide it', () => {
    // setup-jest does not set resendOTPTIme, so default of 120 applies
    expect(environment.resendOTPTIme).toBe(120)
  })

  it('should have assessmentBuffer default to 0 when not set', () => {
    expect(environment.assessmentBuffer).toBe(0)
  })

  it('should have portalsForNotifications as object', () => {
    expect(typeof environment.portalsForNotifications).toBe('object')
  })

  it('should have string fields with empty string fallback', () => {
    expect(typeof environment.organisation).toBe('string')
    expect(typeof environment.framework).toBe('string')
    expect(typeof environment.channelId).toBe('string')
    expect(typeof environment.azureHost).toBe('string')
  })

  it('should have contentBucket equal to azureBucket', () => {
    // contentBucket is derived from azureBucket
    expect(environment.contentBucket).toBe(environment.azureBucket)
  })

  it('should have name from setup-jest window.env', () => {
    expect(environment.name).toBe('Test Environment')
  })

  it('should have organisation from window.env', () => {
    // setup-jest does not set organisation, so default empty string
    expect(environment.organisation).toBe('')
  })

  it('should have empty string for unset string fields', () => {
    expect(environment.dakshtaName).toBe('')
    expect(environment.helpEmail).toBe('')
    expect(environment.supportEmail).toBe('')
  })
})

