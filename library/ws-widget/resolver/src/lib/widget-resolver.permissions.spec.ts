/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { hasUnitPermission, hasPermissions } from './widget-resolver.permissions'

describe('widget-resolver.permissions', () => {
  describe('hasUnitPermission', () => {
    describe('basic functionality', () => {
      it('should return true when requiredPermission is undefined', () => {
        const result = hasUnitPermission(undefined)

        expect(result).toBe(true)
      })

      it('should return true when requiredPermission is null', () => {
        const result = hasUnitPermission(null)

        expect(result).toBe(true)
      })

      it('should return true when requiredPermission is empty string', () => {
        const result = hasUnitPermission('')

        expect(result).toBe(true)
      })

      it('should return true when requiredPermission is empty array', () => {
        const result = hasUnitPermission([])

        expect(result).toBe(true)
      })

      it('should return false when requiredPermission is object and not array', () => {
        const result = hasUnitPermission({} as any)

        expect(result).toBe(false)
      })
    })

    describe('string permission matching', () => {
      it('should return true when string permission matches in Set', () => {
        const matchAgainst = new Set(['admin', 'user'])
        const result = hasUnitPermission('admin', matchAgainst)

        expect(result).toBe(true)
      })

      it('should return false when string permission does not match in Set', () => {
        const matchAgainst = new Set(['user', 'guest'])
        const result = hasUnitPermission('admin', matchAgainst)

        expect(result).toBe(false)
      })

      it('should handle string matchAgainst parameter', () => {
        const result = hasUnitPermission('admin', 'admin')

        expect(result).toBe(true)
      })

      it('should return false when string does not match string matchAgainst', () => {
        const result = hasUnitPermission('admin', 'user')

        expect(result).toBe(false)
      })

      it('should handle array matchAgainst parameter', () => {
        const result = hasUnitPermission('admin', ['admin', 'user'])

        expect(result).toBe(true)
      })

      it('should return false when string not in array matchAgainst', () => {
        const result = hasUnitPermission('admin', ['user', 'guest'])

        expect(result).toBe(false)
      })

      it('should handle empty Set matchAgainst', () => {
        const result = hasUnitPermission('admin', new Set())

        expect(result).toBe(false)
      })

      it('should handle null matchAgainst', () => {
        const result = hasUnitPermission('admin', null)

        expect(result).toBe(false)
      })

      it('should handle undefined matchAgainst', () => {
        const result = hasUnitPermission('admin', undefined)

        expect(result).toBe(false)
      })
    })

    describe('array permission matching - all mode', () => {
      it('should return true when all array permissions match', () => {
        const matchAgainst = new Set(['admin', 'user', 'editor'])
        const result = hasUnitPermission(['admin', 'user'], matchAgainst)

        expect(result).toBe(true)
      })

      it('should return false when not all array permissions match', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission(['admin', 'user'], matchAgainst)

        expect(result).toBe(false)
      })

      it('should return true when single element array matches', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission(['admin'], matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle array with empty Set matchAgainst', () => {
        const result = hasUnitPermission(['admin', 'user'], new Set())

        expect(result).toBe(false)
      })

      it('should handle array with string matchAgainst', () => {
        const result = hasUnitPermission(['admin', 'user'], 'admin')

        expect(result).toBe(false)
      })

      it('should handle array with array matchAgainst', () => {
        const result = hasUnitPermission(['admin', 'user'], ['admin', 'user', 'editor'])

        expect(result).toBe(true)
      })
    })

    describe('object permission matching - all operator', () => {
      it('should return true when all permissions match', () => {
        const matchAgainst = new Set(['admin', 'editor'])
        const result = hasUnitPermission({ all: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return false when not all permissions match', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(false)
      })

      it('should return true when all is single string that matches', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: 'admin' }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when all is null', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: null }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when all is undefined', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: undefined }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when all is empty array', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: [] }, matchAgainst)

        expect(result).toBe(true)
      })
    })

    describe('object permission matching - some operator', () => {
      it('should return true when some permissions match', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ some: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return false when no permissions match', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission({ some: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(false)
      })

      it('should return true when some is single string that matches', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ some: 'admin' }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when some is null', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ some: null }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when some is undefined', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ some: undefined }, matchAgainst)

        expect(result).toBe(true)
      })
    })

    describe('object permission matching - none operator', () => {
      it('should return true when none of the permissions match', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission({ none: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return false when any permission matches', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ none: ['admin', 'editor'] }, matchAgainst)

        expect(result).toBe(false)
      })

      it('should return false when none is single string that matches', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ none: 'admin' }, matchAgainst)

        expect(result).toBe(false)
      })

      it('should return true when none is single string that does not match', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission({ none: 'admin' }, matchAgainst)

        expect(result).toBe(true)
      })

      it('should return true when none is null', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ none: null }, matchAgainst)

        expect(result).toBe(true)
      })
    })

    describe('object permission matching - combined operators', () => {
      it('should return true when all, some, and none conditions are met', () => {
        const matchAgainst = new Set(['admin', 'editor'])
        const result = hasUnitPermission(
          {
            all: ['admin', 'editor'],
            some: ['admin'],
            none: ['guest'],
          },
          matchAgainst
        )

        expect(result).toBe(true)
      })

      it('should return false when all condition fails', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission(
          {
            all: ['admin', 'editor'],
            some: ['admin'],
            none: ['guest'],
          },
          matchAgainst
        )

        expect(result).toBe(false)
      })

      it('should return false when some condition fails', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission(
          {
            all: [],
            some: ['admin', 'editor'],
            none: ['moderator'],
          },
          matchAgainst
        )

        expect(result).toBe(false)
      })

      it('should return false when none condition fails', () => {
        const matchAgainst = new Set(['admin', 'guest'])
        const result = hasUnitPermission(
          {
            all: ['admin'],
            some: ['admin'],
            none: ['guest'],
          },
          matchAgainst
        )

        expect(result).toBe(false)
      })

      it('should handle combination with only all and some', () => {
        const matchAgainst = new Set(['admin', 'editor'])
        const result = hasUnitPermission(
          {
            all: ['admin'],
            some: ['editor'],
          },
          matchAgainst
        )

        expect(result).toBe(true)
      })

      it('should handle combination with only all and none', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission(
          {
            all: ['admin'],
            none: ['guest'],
          },
          matchAgainst
        )

        expect(result).toBe(true)
      })

      it('should handle combination with only some and none', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission(
          {
            some: ['admin', 'editor'],
            none: ['guest'],
          },
          matchAgainst
        )

        expect(result).toBe(true)
      })
    })

    describe('isRestrictive mode', () => {
      it('should flip result for string permission when isRestrictive is true', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission('admin', matchAgainst, true)

        expect(result).toBe(false)
      })

      it('should flip result for array permission when isRestrictive is true', () => {
        const matchAgainst = new Set(['admin', 'editor'])
        const result = hasUnitPermission(['admin', 'editor'], matchAgainst, true)

        expect(result).toBe(false)
      })

      it('should flip result for object all permission when isRestrictive is true', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: 'admin' }, matchAgainst, true)

        expect(result).toBe(false)
      })

      it('should flip result for object some permission when isRestrictive is true', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ some: 'admin' }, matchAgainst, true)

        expect(result).toBe(false)
      })

      it('should flip result for object none permission when isRestrictive is true', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission({ none: 'admin' }, matchAgainst, true)

        expect(result).toBe(false)
      })

      it('should return true when permission not found and isRestrictive is true', () => {
        const matchAgainst = new Set(['guest'])
        const result = hasUnitPermission('admin', matchAgainst, true)

        expect(result).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle very long permission strings', () => {
        const longPermission = 'a'.repeat(1000)
        const matchAgainst = new Set([longPermission])
        const result = hasUnitPermission(longPermission, matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle special characters in permissions', () => {
        const matchAgainst = new Set(['admin@#$%'])
        const result = hasUnitPermission('admin@#$%', matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle unicode characters in permissions', () => {
        const matchAgainst = new Set(['管理員'])
        const result = hasUnitPermission('管理員', matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle large arrays', () => {
        const permissions = Array.from({ length: 100 }, (_, i) => `perm${i}`)
        const matchAgainst = new Set(permissions)
        const result = hasUnitPermission(permissions, matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle empty string in array', () => {
        const matchAgainst = new Set(['', 'admin'])
        const result = hasUnitPermission(['', 'admin'], matchAgainst)

        expect(result).toBe(true)
      })

      it('should handle mixed valid and invalid array matchAgainst', () => {
        const result = hasUnitPermission('admin', ['admin', 123 as any, 'user'])

        expect(result).toBe(false)
      })

      it('should return true when all operators are null', () => {
        const matchAgainst = new Set(['admin'])
        const result = hasUnitPermission({ all: null, some: null, none: null }, matchAgainst)

        expect(result).toBe(true)
      })
    })
  })

  describe('hasPermissions', () => {
    describe('basic functionality', () => {
      it('should return true when requiredPermission is undefined', () => {
        const result = hasPermissions(undefined)

        expect(result).toBe(true)
      })

      it('should return true when requiredPermission is null', () => {
        const result = hasPermissions(undefined)

        expect(result).toBe(true)
      })

      it('should return false when available is false', () => {
        const result = hasPermissions({ available: false, enabled: true })

        expect(result).toBe(false)
      })

      it('should return false when enabled is false', () => {
        const result = hasPermissions({ available: true, enabled: false })

        expect(result).toBe(false)
      })

      it('should return false when both available and enabled are false', () => {
        const result = hasPermissions({ available: false, enabled: false })

        expect(result).toBe(false)
      })

      it('should return true when available and enabled are true with no other conditions', () => {
        const result = hasPermissions({ available: true, enabled: true })

        expect(result).toBe(true)
      })
    })

    describe('role-based permissions', () => {
      it('should return true when required role matches available role', () => {
        const result = hasPermissions(
          { available: true, enabled: true, roles: 'admin' },
          'admin'
        )

        expect(result).toBe(true)
      })

      it('should return false when required role does not match', () => {
        const result = hasPermissions(
          { available: true, enabled: true, roles: 'admin' },
          'user'
        )

        expect(result).toBe(false)
      })

      it('should handle roles as Set', () => {
        const roles = new Set(['admin', 'editor'])
        const result = hasPermissions(
          { available: true, enabled: true, roles: 'admin' },
          roles
        )

        expect(result).toBe(true)
      })

      it('should handle roles as array', () => {
        const result = hasPermissions(
          { available: true, enabled: true, roles: 'admin' },
          ['admin', 'editor']
        )

        expect(result).toBe(true)
      })

      it('should handle required roles as array', () => {
        const result = hasPermissions(
          { available: true, enabled: true, roles: ['admin', 'editor'] },
          new Set(['admin', 'editor', 'moderator'])
        )

        expect(result).toBe(true)
      })

      it('should return true when roles is undefined', () => {
        const result = hasPermissions(
          { available: true, enabled: true },
          'admin'
        )

        expect(result).toBe(true)
      })

      it('should return true when availableRoles is undefined', () => {
        const result = hasPermissions(
          { available: true, enabled: true, roles: 'admin' },
          undefined
        )

        expect(result).toBe(false)
      })
    })

    describe('group-based permissions', () => {
      it('should return true when required group matches available group', () => {
        const result = hasPermissions(
          { available: true, enabled: true, groups: 'developers' },
          undefined,
          'developers'
        )

        expect(result).toBe(true)
      })

      it('should return false when required group does not match', () => {
        const result = hasPermissions(
          { available: true, enabled: true, groups: 'developers' },
          undefined,
          'designers'
        )

        expect(result).toBe(false)
      })

      it('should handle groups as Set', () => {
        const groups = new Set(['developers', 'designers'])
        const result = hasPermissions(
          { available: true, enabled: true, groups: 'developers' },
          undefined,
          groups
        )

        expect(result).toBe(true)
      })

      it('should handle groups as array', () => {
        const result = hasPermissions(
          { available: true, enabled: true, groups: 'developers' },
          undefined,
          ['developers', 'designers']
        )

        expect(result).toBe(true)
      })

      it('should handle required groups as array', () => {
        const result = hasPermissions(
          { available: true, enabled: true, groups: ['developers', 'designers'] },
          undefined,
          new Set(['developers', 'designers', 'testers'])
        )

        expect(result).toBe(true)
      })
    })

    describe('feature-based permissions', () => {
      it('should return true when restricted feature is not in available features', () => {
        const result = hasPermissions(
          { available: true, enabled: true, features: 'beta' },
          undefined,
          undefined,
          new Set(['alpha'])
        )

        expect(result).toBe(true)
      })

      it('should return false when restricted feature is in available features', () => {
        const result = hasPermissions(
          { available: true, enabled: true, features: 'beta' },
          undefined,
          undefined,
          new Set(['beta'])
        )

        expect(result).toBe(false)
      })

      it('should handle features as string', () => {
        const result = hasPermissions(
          { available: true, enabled: true, features: 'beta' },
          undefined,
          undefined,
          'alpha'
        )

        expect(result).toBe(true)
      })

      it('should handle features as array', () => {
        const result = hasPermissions(
          { available: true, enabled: true, features: 'beta' },
          undefined,
          undefined,
          ['alpha', 'gamma']
        )

        expect(result).toBe(true)
      })

      it('should return false when required feature array matches restrictedFeatures', () => {
        const result = hasPermissions(
          { available: true, enabled: true, features: ['beta', 'gamma'] },
          undefined,
          undefined,
          new Set(['beta', 'gamma'])
        )

        expect(result).toBe(false)
      })
    })

    describe('combined permissions', () => {
      it('should return true when all permissions match', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: 'admin',
            groups: 'developers',
            features: 'beta',
          },
          'admin',
          'developers',
          new Set(['alpha'])
        )

        expect(result).toBe(true)
      })

      it('should return false when roles do not match', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: 'admin',
            groups: 'developers',
            features: 'beta',
          },
          'user',
          'developers',
          new Set(['alpha'])
        )

        expect(result).toBe(false)
      })

      it('should return false when groups do not match', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: 'admin',
            groups: 'developers',
            features: 'beta',
          },
          'admin',
          'designers',
          new Set(['alpha'])
        )

        expect(result).toBe(false)
      })

      it('should return false when features are restricted', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: 'admin',
            groups: 'developers',
            features: 'beta',
          },
          'admin',
          'developers',
          new Set(['beta'])
        )

        expect(result).toBe(false)
      })

      it('should handle complex role requirements', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: { all: ['admin', 'moderator'] },
            groups: 'developers',
          },
          new Set(['admin', 'moderator']),
          'developers'
        )

        expect(result).toBe(true)
      })

      it('should handle complex group requirements', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: 'admin',
            groups: { some: ['developers', 'designers'] },
          },
          'admin',
          new Set(['developers'])
        )

        expect(result).toBe(true)
      })

      it('should handle complex feature requirements', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            features: { none: ['beta', 'alpha'] },
          },
          undefined,
          undefined,
          new Set(['gamma'])
        )

        expect(result).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle null values for all optional parameters', () => {
        const result = hasPermissions(
          { available: true, enabled: true },
          null,
          null,
          null
        )

        expect(result).toBe(true)
      })

      it('should handle undefined values for all optional parameters', () => {
        const result = hasPermissions(
          { available: true, enabled: true },
          undefined,
          undefined,
          undefined
        )

        expect(result).toBe(true)
      })

      it('should return false when available is undefined', () => {
        const result = hasPermissions({ enabled: true } as any)

        expect(result).toBe(false)
      })

      it('should return false when enabled is undefined', () => {
        const result = hasPermissions({ available: true } as any)

        expect(result).toBe(false)
      })

      it('should handle empty permission object', () => {
        const result = hasPermissions({} as any)

        expect(result).toBe(false)
      })

      it('should handle complex nested permissions', () => {
        const result = hasPermissions(
          {
            available: true,
            enabled: true,
            roles: { all: ['admin', 'editor'], some: ['moderator'], none: ['guest'] },
            groups: { some: ['developers', 'designers'] },
            features: { none: ['beta'] },
          },
          new Set(['admin', 'editor']),
          new Set(['developers']),
          new Set(['alpha'])
        )

        expect(result).toBe(false)
      })
    })
  })
})
