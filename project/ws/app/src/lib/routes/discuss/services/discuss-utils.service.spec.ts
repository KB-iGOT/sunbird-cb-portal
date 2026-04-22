import { DiscussUtilsService } from './discuss-utils.service'

describe('DiscussUtilsService', () => {
  let service: DiscussUtilsService

  beforeEach(() => {
    service = new DiscussUtilsService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize with undefined discussionCnfig', () => {
      expect(service.discussionCnfig).toBeUndefined()
    })

    it('should be an instance of DiscussUtilsService', () => {
      expect(service).toBeInstanceOf(DiscussUtilsService)
    })
  })

  describe('stringToColor', () => {
    it('should return a valid HSL color string', () => {
      const result = service.stringToColor('test')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should return consistent color for the same string', () => {
      const str = 'testString'
      const result1 = service.stringToColor(str)
      const result2 = service.stringToColor(str)
      expect(result1).toBe(result2)
    })

    it('should return different colors for different strings', () => {
      const result1 = service.stringToColor('string1')
      const result2 = service.stringToColor('string2')
      expect(result1).not.toBe(result2)
    })

    it('should handle empty string', () => {
      const result = service.stringToColor('')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle single character', () => {
      const result = service.stringToColor('A')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle long strings', () => {
      const longString = 'ThisIsAVeryLongStringToTestTheColorGenerationFunction'
      const result = service.stringToColor(longString)
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle special characters', () => {
      const result = service.stringToColor('test@#$%^&*()')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle unicode characters', () => {
      const result = service.stringToColor('テスト')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle numbers as strings', () => {
      const result = service.stringToColor('123456')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle whitespace characters', () => {
      const result = service.stringToColor('   test   ')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should generate color with hue between 0 and 359', () => {
      const result = service.stringToColor('anyString')
      const regex = /hsl\((\d+),100%,30%\)/
      const hueMatch = regex.exec(result)
      if (hueMatch) {
        const hue = Number.parseInt(hueMatch[1], 10)
        expect(hue).toBeGreaterThanOrEqual(0)
        expect(hue).toBeLessThan(360)
      }
    })

    it('should handle strings with newlines', () => {
      const result = service.stringToColor('test\nstring')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle strings with tabs', () => {
      const result = service.stringToColor('test\tstring')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle email-like strings', () => {
      const result = service.stringToColor('user@example.com')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle URL-like strings', () => {
      const result = service.stringToColor('https://example.com/path')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle mixed case strings consistently', () => {
      const result1 = service.stringToColor('Test')
      const result2 = service.stringToColor('TEST')
      const result3 = service.stringToColor('test')
      expect(result1).not.toBe(result2)
      expect(result2).not.toBe(result3)
      expect(result1).not.toBe(result3)
    })

    it('should handle strings with repeated characters', () => {
      const result = service.stringToColor('aaaaaaa')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle alphanumeric strings', () => {
      const result = service.stringToColor('abc123XYZ')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should handle strings with emojis', () => {
      const result = service.stringToColor('test 😀 emoji')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })
  })

  describe('getContrast', () => {
    it('should return the hardcoded contrast color', () => {
      const result = service.getContrast('#ffffff')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should return same value regardless of input hex color', () => {
      const result1 = service.getContrast('#000000')
      const result2 = service.getContrast('#ff0000')
      const result3 = service.getContrast('#00ff00')
      expect(result1).toBe('rgba(255, 255, 255, 80%)')
      expect(result2).toBe('rgba(255, 255, 255, 80%)')
      expect(result3).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle null input', () => {
      const result = service.getContrast(null)
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle undefined input', () => {
      const result = service.getContrast(undefined)
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle invalid hex color', () => {
      const result = service.getContrast('invalid')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle empty string', () => {
      const result = service.getContrast('')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle short hex format', () => {
      const result = service.getContrast('#fff')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle hex without hash prefix', () => {
      const result = service.getContrast('ffffff')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle rgb color format', () => {
      const result = service.getContrast('rgb(255, 255, 255)')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle rgba color format', () => {
      const result = service.getContrast('rgba(255, 255, 255, 0.5)')
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle numeric input', () => {
      const result = service.getContrast(123456)
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should handle object input', () => {
      const result = service.getContrast({ color: '#ffffff' })
      expect(result).toBe('rgba(255, 255, 255, 80%)')
    })
  })

  describe('setDiscussionConfig', () => {
    it('should set discussion config', () => {
      const config = { theme: 'dark', language: 'en' }
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toEqual(config)
    })

    it('should update existing config', () => {
      const config1 = { theme: 'light' }
      const config2 = { theme: 'dark', language: 'hi' }
      service.setDiscussionConfig(config1)
      expect(service.discussionCnfig).toEqual(config1)
      service.setDiscussionConfig(config2)
      expect(service.discussionCnfig).toEqual(config2)
    })

    it('should handle null config', () => {
      service.setDiscussionConfig(null)
      expect(service.discussionCnfig).toBeNull()
    })

    it('should handle undefined config', () => {
      service.setDiscussionConfig(undefined)
      expect(service.discussionCnfig).toBeUndefined()
    })

    it('should handle empty object config', () => {
      const config = {}
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toEqual({})
    })

    it('should handle complex nested config', () => {
      const config = {
        theme: 'dark',
        settings: {
          notifications: true,
          privacy: {
            level: 'public',
          },
        },
      }
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toEqual(config)
    })

    it('should handle array config', () => {
      const config = ['option1', 'option2', 'option3']
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toEqual(config)
    })

    it('should handle string config', () => {
      const config = 'simple string config'
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toBe(config)
    })

    it('should handle number config', () => {
      const config = 42
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toBe(42)
    })

    it('should handle boolean config', () => {
      const config = true
      service.setDiscussionConfig(config)
      expect(service.discussionCnfig).toBe(true)
    })

    it('should not create a copy but use reference', () => {
      const config = { theme: 'dark' }
      service.setDiscussionConfig(config)
      config.theme = 'light'
      expect(service.discussionCnfig.theme).toBe('light')
    })
  })

  describe('getDiscussionConfig', () => {
    it('should return undefined when config is not set', () => {
      const result = service.getDiscussionConfig()
      expect(result).toBeUndefined()
    })

    it('should return the discussion config that was set', () => {
      const config = { theme: 'dark', language: 'en' }
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toEqual(config)
    })

    it('should return the same reference', () => {
      const config = { theme: 'dark' }
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toBe(config)
    })

    it('should return null if null was set', () => {
      service.setDiscussionConfig(null)
      const result = service.getDiscussionConfig()
      expect(result).toBeNull()
    })

    it('should return empty object if empty object was set', () => {
      service.setDiscussionConfig({})
      const result = service.getDiscussionConfig()
      expect(result).toEqual({})
    })

    it('should return updated config after multiple sets', () => {
      service.setDiscussionConfig({ theme: 'light' })
      service.setDiscussionConfig({ theme: 'dark' })
      const result = service.getDiscussionConfig()
      expect(result).toEqual({ theme: 'dark' })
    })

    it('should return complex nested config', () => {
      const config = {
        theme: 'dark',
        nested: {
          level1: {
            level2: 'value',
          },
        },
      }
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toEqual(config)
    })

    it('should return array config', () => {
      const config = [1, 2, 3]
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toEqual(config)
    })

    it('should return string config', () => {
      const config = 'test string'
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toBe(config)
    })

    it('should return number config', () => {
      const config = 100
      service.setDiscussionConfig(config)
      const result = service.getDiscussionConfig()
      expect(result).toBe(100)
    })

    it('should return boolean config', () => {
      service.setDiscussionConfig(false)
      const result = service.getDiscussionConfig()
      expect(result).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should work correctly when setting and getting config multiple times', () => {
      const config1 = { setting: 'value1' }
      const config2 = { setting: 'value2' }

      service.setDiscussionConfig(config1)
      expect(service.getDiscussionConfig()).toEqual(config1)

      service.setDiscussionConfig(config2)
      expect(service.getDiscussionConfig()).toEqual(config2)
    })

    it('should generate colors and manage config independently', () => {
      const color = service.stringToColor('test')
      const config = { theme: 'dark' }
      service.setDiscussionConfig(config)

      expect(color).toMatch(/^hsl\(\d+,100%,30%\)$/)
      expect(service.getDiscussionConfig()).toEqual(config)
    })

    it('should handle all methods in sequence', () => {
      const color1 = service.stringToColor('user1')
      const contrast = service.getContrast('#ffffff')
      service.setDiscussionConfig({ enabled: true })
      const color2 = service.stringToColor('user2')
      const config = service.getDiscussionConfig()

      expect(color1).toMatch(/^hsl\(\d+,100%,30%\)$/)
      expect(contrast).toBe('rgba(255, 255, 255, 80%)')
      expect(color2).toMatch(/^hsl\(\d+,100%,30%\)$/)
      expect(config).toEqual({ enabled: true })
    })
  })
})
