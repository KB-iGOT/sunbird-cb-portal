/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { FilterPlaylistPipe } from './filter-playlist.pipe'

describe('FilterPlaylistPipe', () => {
  let pipe: FilterPlaylistPipe

  const mockPlaylists = {
    result: {
      content: [
        {
          identifier: 'playlist1',
          name: 'Angular Basics',
          description: 'Learn Angular fundamentals',
          duration: 120,
        },
        {
          identifier: 'playlist2',
          name: 'React Advanced',
          description: 'Advanced React concepts',
          duration: 180,
        },
        {
          identifier: 'playlist3',
          name: 'Vue.js Tutorial',
          description: 'Vue.js from scratch',
          duration: 150,
        },
        {
          identifier: 'playlist4',
          name: 'JavaScript ES6',
          description: 'Modern JavaScript features',
          duration: 200,
        },
        {
          identifier: 'playlist5',
          name: 'Angular Advanced',
          description: 'Advanced Angular topics',
          duration: 240,
        },
      ],
    },
  }

  beforeEach(() => {
    pipe = new FilterPlaylistPipe()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy()
    })

    it('should be defined', () => {
      expect(pipe).toBeDefined()
    })
  })

  describe('transform', () => {
    it('should return all playlists when search query is empty', () => {
      const result = pipe.transform(mockPlaylists, '')

      expect(result).toEqual(mockPlaylists.result.content)
      expect(result?.length).toBe(5)
    })

    it('should return all playlists when search query is undefined', () => {
      const result = pipe.transform(mockPlaylists, undefined as any)

      expect(result).toEqual(mockPlaylists.result.content)
      expect(result?.length).toBe(5)
    })

    it('should return all playlists when search query is null', () => {
      const result = pipe.transform(mockPlaylists, null as any)

      expect(result).toEqual(mockPlaylists.result.content)
      expect(result?.length).toBe(5)
    })

    it('should filter playlists by name case-insensitively', () => {
      const result = pipe.transform(mockPlaylists, 'angular')

      expect(result?.length).toBe(2)
      expect(result?.[0].name).toBe('Angular Basics')
      expect(result?.[1].name).toBe('Angular Advanced')
    })

    it('should handle uppercase search query', () => {
      const result = pipe.transform(mockPlaylists, 'ANGULAR')

      expect(result?.length).toBe(2)
      expect(result?.[0].name).toBe('Angular Basics')
      expect(result?.[1].name).toBe('Angular Advanced')
    })

    it('should handle mixed case search query', () => {
      const result = pipe.transform(mockPlaylists, 'aNgUlAr')

      expect(result?.length).toBe(2)
      expect(result?.[0].name).toBe('Angular Basics')
      expect(result?.[1].name).toBe('Angular Advanced')
    })

    it('should filter playlists with partial match', () => {
      const result = pipe.transform(mockPlaylists, 'adv')

      expect(result?.length).toBe(2)
      expect(result?.[0].name).toBe('React Advanced')
      expect(result?.[1].name).toBe('Angular Advanced')
    })

    it('should return single matching playlist', () => {
      const result = pipe.transform(mockPlaylists, 'vue')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Vue.js Tutorial')
    })

    it('should return undefined when no playlists match', () => {
      const result = pipe.transform(mockPlaylists, 'Python')

      expect(result).toBeUndefined()
    })

    it('should return undefined when search query does not match any playlist', () => {
      const result = pipe.transform(mockPlaylists, 'nonexistent')

      expect(result).toBeUndefined()
    })

    it('should handle search with spaces', () => {
      const result = pipe.transform(mockPlaylists, 'angular basics')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Angular Basics')
    })

    it('should handle search with leading spaces', () => {
      const result = pipe.transform(mockPlaylists, '  angular')

      expect(result?.length).toBe(2)
    })

    it('should handle search with trailing spaces', () => {
      const result = pipe.transform(mockPlaylists, 'angular  ')

      expect(result?.length).toBe(2)
    })

    it('should handle search with special characters', () => {
      const playlistsWithSpecialChars = {
        result: {
          content: [
            { identifier: 'p1', name: 'C++ Programming' },
            { identifier: 'p2', name: 'C# Basics' },
          ],
        },
      }

      const result = pipe.transform(playlistsWithSpecialChars, 'c++')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('C++ Programming')
    })

    it('should return undefined when playlists is null', () => {
      const nullPlaylists = {
        result: {
          content: null,
        },
      }

      const result = pipe.transform(nullPlaylists, 'angular')

      expect(result).toBeUndefined()
    })

    it('should return undefined when playlists content is undefined', () => {
      const undefinedPlaylists = {
        result: {
          content: undefined,
        },
      }

      const result = pipe.transform(undefinedPlaylists, 'angular')

      expect(result).toBeUndefined()
    })

    it('should handle empty playlists array', () => {
      const emptyPlaylists = {
        result: {
          content: [],
        },
      }

      const result = pipe.transform(emptyPlaylists, 'angular')

      expect(result).toBeUndefined()
    })

    it('should return undefined for empty array with no search', () => {
      const emptyPlaylists = {
        result: {
          content: [],
        },
      }

      const result = pipe.transform(emptyPlaylists, '')

      expect(result).toBeUndefined()
    })

    it('should filter correctly with single character search', () => {
      const result = pipe.transform(mockPlaylists, 'j')

      expect(result?.length).toBe(2)
      expect(result?.[0].name).toBe('Vue.js Tutorial')
      expect(result?.[1].name).toBe('JavaScript ES6')
    })

    it('should handle numbers in search query', () => {
      const playlistsWithNumbers = {
        result: {
          content: [
            { identifier: 'p1', name: 'ES6 Features' },
            { identifier: 'p2', name: 'Angular 2' },
            { identifier: 'p3', name: 'React 16' },
          ],
        },
      }

      const result = pipe.transform(playlistsWithNumbers, '6')

      expect(result?.length).toBe(2)
    })

    it('should handle search query with dots', () => {
      const result = pipe.transform(mockPlaylists, 'vue.js')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Vue.js Tutorial')
    })

    it('should maintain order of filtered results', () => {
      const result = pipe.transform(mockPlaylists, 'a')

      expect(result?.length).toBeGreaterThan(0)
      const firstIndex = mockPlaylists.result.content.findIndex(
        (p) => p.identifier === result?.[0].identifier
      )
      const lastIndex = mockPlaylists.result.content.findIndex(
        (p) => p.identifier === result?.[result.length - 1].identifier
      )
      expect(firstIndex).toBeLessThan(lastIndex)
    })

    it('should not modify original playlists array', () => {
      const originalLength = mockPlaylists.result.content.length
      const originalFirst = mockPlaylists.result.content[0].name

      pipe.transform(mockPlaylists, 'angular')

      expect(mockPlaylists.result.content.length).toBe(originalLength)
      expect(mockPlaylists.result.content[0].name).toBe(originalFirst)
    })

    it('should handle playlists with similar names', () => {
      const similarPlaylists = {
        result: {
          content: [
            { identifier: 'p1', name: 'Test' },
            { identifier: 'p2', name: 'Testing' },
            { identifier: 'p3', name: 'Tester' },
            { identifier: 'p4', name: 'Test Suite' },
          ],
        },
      }

      const result = pipe.transform(similarPlaylists, 'test')

      expect(result?.length).toBe(4)
    })

    it('should handle exact match search', () => {
      const result = pipe.transform(mockPlaylists, 'Angular Basics')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Angular Basics')
    })

    it('should handle search at the end of playlist name', () => {
      const result = pipe.transform(mockPlaylists, 'advanced')

      expect(result?.length).toBe(2)
    })

    it('should handle search at the beginning of playlist name', () => {
      const result = pipe.transform(mockPlaylists, 'react')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('React Advanced')
    })

    it('should handle very long search query', () => {
      const longQuery = 'a'.repeat(1000)

      const result = pipe.transform(mockPlaylists, longQuery)

      expect(result).toBeUndefined()
    })

    it('should handle playlist names with unicode characters', () => {
      const unicodePlaylists = {
        result: {
          content: [
            { identifier: 'p1', name: 'Angular básico' },
            { identifier: 'p2', name: 'React 学习' },
            { identifier: 'p3', name: 'Vue テュートリアル' },
          ],
        },
      }

      const result = pipe.transform(unicodePlaylists, 'angular')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Angular básico')
    })

    it('should return all playlists when search is whitespace only', () => {
      const result = pipe.transform(mockPlaylists, '   ')

      expect(result).toEqual(mockPlaylists.result.content)
    })

    it('should handle malformed playlists object without result', () => {
      const malformedPlaylists = {} as any

      expect(() => pipe.transform(malformedPlaylists, 'angular')).toThrow()
    })

    it('should handle malformed playlists object without result.content', () => {
      const malformedPlaylists = {
        result: {},
      } as any

      const result = pipe.transform(malformedPlaylists, 'angular')

      expect(result).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle multiple consecutive calls', () => {
      const result1 = pipe.transform(mockPlaylists, 'angular')
      const result2 = pipe.transform(mockPlaylists, 'react')
      const result3 = pipe.transform(mockPlaylists, 'vue')

      expect(result1?.length).toBe(2)
      expect(result2?.length).toBe(1)
      expect(result3?.length).toBe(1)
    })

    it('should handle playlist with empty name', () => {
      const playlistsWithEmpty = {
        result: {
          content: [
            { identifier: 'p1', name: '' },
            { identifier: 'p2', name: 'Test' },
          ],
        },
      }

      const result = pipe.transform(playlistsWithEmpty, 'test')

      expect(result?.length).toBe(1)
      expect(result?.[0].name).toBe('Test')
    })

    it('should handle playlist with only spaces in name', () => {
      const playlistsWithSpaces = {
        result: {
          content: [
            { identifier: 'p1', name: '   ' },
            { identifier: 'p2', name: 'Test' },
          ],
        },
      }

      const result = pipe.transform(playlistsWithSpaces, 'test')

      expect(result?.length).toBe(1)
    })

    it('should handle search with tab character', () => {
      const result = pipe.transform(mockPlaylists, '\tangular')

      expect(result?.length).toBe(2)
    })

    it('should handle search with newline character', () => {
      const result = pipe.transform(mockPlaylists, 'angular\n')

      expect(result).toBeUndefined()
    })
  })

  describe('performance', () => {
    it('should handle large playlist array efficiently', () => {
      const largePlaylists = {
        result: {
          content: Array.from({ length: 10000 }, (_, i) => ({
            identifier: `playlist${i}`,
            name: `Playlist ${i}`,
            description: `Description ${i}`,
          })),
        },
      }

      const startTime = Date.now()
      const result = pipe.transform(largePlaylists, 'Playlist 9999')
      const endTime = Date.now()

      expect(result?.length).toBe(1)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in less than 1 second
    })
  })
})
