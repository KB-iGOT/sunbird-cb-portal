import { applyAccessibilityIconConfig, SHOW_ACCESSIBILITY_ICON_CLASS } from './init.service'

describe('applyAccessibilityIconConfig', () => {
  const shown = () => document.body.classList.contains(SHOW_ACCESSIBILITY_ICON_CLASS)

  afterEach(() => document.body.classList.remove(SHOW_ACCESSIBILITY_ICON_CLASS))

  it('shows the floating icon when components.accessibilityWidget.showFloatingIcon is true', () => {
    applyAccessibilityIconConfig({ components: { accessibilityWidget: { showFloatingIcon: true } } })
    expect(shown()).toBe(true)
  })

  it.each([
    ['not configured', {}],
    ['false', { components: { accessibilityWidget: { showFloatingIcon: false } } }],
    ['a string, not true', { components: { accessibilityWidget: { showFloatingIcon: 'true' } } }],
    ['config missing', undefined],
  ])('keeps it hidden when %s', (_case, config) => {
    document.body.classList.add(SHOW_ACCESSIBILITY_ICON_CLASS)
    applyAccessibilityIconConfig(config)
    expect(shown()).toBe(false)
  })
})
