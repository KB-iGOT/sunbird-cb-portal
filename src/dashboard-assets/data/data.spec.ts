import { mapFilePath, dashboardEmptyData } from './data'

describe('dashboard-assets data constants', () => {
  it('should have the correct mapFilePath', () => {
    expect(mapFilePath).toBe(
      '../../dasboard-assets/json/IndiaDistrict_Updated_21_05_2020.json',
    )
  })

  it('should define dashboardEmptyData with expected default values', () => {
    const expected: any = {
      showFilters: 'false',
      showWidgets: 'false',
      widgetTitle: 'Under construction!',
      showWidgetTitle: 'true',
      showMessage: true,
      messageType: 'warning',
      message:
        'Please note that the data shown here is not actual and is only intended to showcase the capability of the platform until the actual usage begins.',
      filtersDetails: [],
      visualizationDetails: [],
      chartDetails: [],
      widgetData: [],
    }

    expect(dashboardEmptyData).toEqual(expected)
  })
})
