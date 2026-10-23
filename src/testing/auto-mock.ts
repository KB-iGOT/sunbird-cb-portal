// Catch-all test double for constructor-injected dependencies. Any property access
// returns another auto-mock and any call returns one too, so constructor-time usage
// such as `route.data.subscribe(...)` or `configSvc.userProfile.userId` does not throw.
// `then` and the iterator symbols stay undefined so it is never mistaken for a promise
// or an iterable, and `subscribe` hands back a real subscription-like object.
const PASSTHROUGH = new Set<PropertyKey>([
  'then',
  'toJSON',
  'asymmetricMatch',
  'nodeType',
  '$$typeof',
  Symbol.iterator,
  Symbol.asyncIterator,
  Symbol.toPrimitive,
])

// tslint:disable-next-line:no-any
export function autoMock(): any {
  const children = new Map<PropertyKey, unknown>()
  // a plain function target keeps the proxy callable and constructible
  // tslint:disable-next-line:only-arrow-functions
  const target = function () { }
  // tslint:disable-next-line:no-any
  const proxy: any = new Proxy(target, {
    get(_target, prop) {
      if (PASSTHROUGH.has(prop)) {
        return undefined
      }
      if (prop === 'subscribe') {
        return () => ({ unsubscribe: () => undefined, closed: true })
      }
      if (prop === 'pipe' || prop === 'asObservable') {
        return () => proxy
      }
      if (prop === 'toString') {
        return () => ''
      }
      if (prop === 'valueOf') {
        return undefined
      }
      if (!children.has(prop)) {
        children.set(prop, autoMock())
      }
      return children.get(prop)
    },
    set(_target, prop, value) {
      children.set(prop, value)
      return true
    },
    apply: () => autoMock(),
    construct: () => autoMock(),
  })
  return proxy
}
