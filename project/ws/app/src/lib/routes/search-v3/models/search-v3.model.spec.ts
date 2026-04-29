import {
  SearchV4Request,
  RequestParams,
  Filters,
  SortBy,
  SearchCategory,
  SearchOthersFacet,
  SearchEventfacet,
  SearchEventFields,
  SearchResourceMimeType,
  SearchResourceFacets,
  SearchPeoplesRequest,
  PeoplesFilters,
  SearchCommunitiesRequest,
  SearchNLP,
} from './search-v3.model'

describe('SearchV4Request', () => {
  it('should create with default request params', () => {
    const req = new SearchV4Request([])
    expect(req).toBeTruthy()
    expect(req.request).toBeDefined()
  })

  it('should pass competenciesKey to RequestParams', () => {
    const competenciesKey = ['comp1', 'comp2']
    const req = new SearchV4Request(competenciesKey)
    expect(req.request.facets).toContain('comp1')
    expect(req.request.facets).toContain('comp2')
  })

  it('should have no locale by default', () => {
    const req = new SearchV4Request([])
    expect(req.locale).toBeUndefined()
  })
})

describe('RequestParams', () => {
  it('should initialize with correct defaults', () => {
    const params = new RequestParams([])
    expect(params.query).toBe('')
    expect(params.limit).toBe(3)
    expect(params.offset).toBe(0)
  })

  it('should include standard fields', () => {
    const params = new RequestParams([])
    expect(params.fields).toContain('identifier')
    expect(params.fields).toContain('name')
    expect(params.fields).toContain('primaryCategory')
    expect(params.fields).toContain('mimeType')
  })

  it('facets should include SearchOthersFacet items', () => {
    const params = new RequestParams([])
    SearchOthersFacet.forEach(facet => {
      expect(params.facets).toContain(facet)
    })
  })

  it('facets should include custom competency keys', () => {
    const params = new RequestParams(['comp.key1', 'comp.key2'])
    expect(params.facets).toContain('comp.key1')
    expect(params.facets).toContain('comp.key2')
  })

  it('sort_by should be initialized', () => {
    const params = new RequestParams([])
    expect(params.sort_by).toBeDefined()
    expect(params.sort_by instanceof SortBy).toBe(true)
  })

  it('filters should be initialized', () => {
    const params = new RequestParams([])
    expect(params.filters).toBeDefined()
  })
})

describe('Filters', () => {
  it('should initialize with contentType Course', () => {
    const f = new Filters()
    expect(f.contentType).toEqual(['Course'])
  })

  it('should initialize with status Live', () => {
    const f = new Filters()
    expect(f.status).toEqual(['Live'])
  })

  it('should initialize courseCategory as empty array', () => {
    const f = new Filters()
    expect(f.courseCategory).toEqual([])
  })

  it('should allow setting dynamic keys', () => {
    const f = new Filters()
    f['customKey'] = ['val1', 'val2']
    expect(f['customKey']).toEqual(['val1', 'val2'])
  })
})

describe('SortBy', () => {
  it('should create an instance', () => {
    const s = new SortBy()
    expect(s).toBeTruthy()
  })

  it('should have no default properties set', () => {
    const s = new SortBy()
    expect(s.createdOn).toBeUndefined()
    expect(s.name).toBeUndefined()
    expect(s.avgRating).toBeUndefined()
  })
})

describe('SearchCategory enum', () => {
  it('All should be empty string', () => {
    expect(SearchCategory.All).toBe('')
  })

  it('Courses should be courses', () => {
    expect(SearchCategory.Courses).toBe('courses')
  })

  it('People should be peoples', () => {
    expect(SearchCategory.People).toBe('peoples')
  })

  it('Resources should be resources', () => {
    expect(SearchCategory.Resources).toBe('resources')
  })
})

describe('SearchOthersFacet', () => {
  it('should be an array', () => {
    expect(Array.isArray(SearchOthersFacet)).toBe(true)
  })

  it('should contain avgRating', () => {
    expect(SearchOthersFacet).toContain('avgRating')
  })

  it('should contain language', () => {
    expect(SearchOthersFacet).toContain('language')
  })
})

describe('SearchEventfacet', () => {
  it('should be an array', () => {
    expect(Array.isArray(SearchEventfacet)).toBe(true)
  })

  it('should contain duration', () => {
    expect(SearchEventfacet).toContain('duration')
  })

  it('should contain language', () => {
    expect(SearchEventfacet).toContain('language')
  })
})

describe('SearchEventFields', () => {
  it('should be an array', () => {
    expect(Array.isArray(SearchEventFields)).toBe(true)
  })

  it('should contain name and identifier', () => {
    expect(SearchEventFields).toContain('name')
    expect(SearchEventFields).toContain('identifier')
  })
})

describe('SearchResourceMimeType', () => {
  it('should be an array', () => {
    expect(Array.isArray(SearchResourceMimeType)).toBe(true)
  })

  it('should contain application/pdf', () => {
    expect(SearchResourceMimeType).toContain('application/pdf')
  })

  it('should contain video/mp4', () => {
    expect(SearchResourceMimeType).toContain('video/mp4')
  })
})

describe('SearchResourceFacets', () => {
  it('should be an array', () => {
    expect(Array.isArray(SearchResourceFacets)).toBe(true)
  })
})

describe('SearchPeoplesRequest', () => {
  it('should create with defaults', () => {
    const req = new SearchPeoplesRequest()
    expect(req).toBeTruthy()
    expect(req.limit).toBe(5)
    expect(req.offset).toBe(0)
    expect(req.query).toBe('')
    expect(req.fields).toEqual([])
  })

  it('should have facets for designation and org', () => {
    const req = new SearchPeoplesRequest()
    expect(req.facets).toContain('profileDetails.professionalDetails.designation')
    expect(req.facets).toContain('rootOrgName')
  })

  it('should have filters of type PeoplesFilters', () => {
    const req = new SearchPeoplesRequest()
    expect(req.filters).toBeDefined()
    expect(req.filters instanceof PeoplesFilters).toBe(true)
  })
})

describe('PeoplesFilters', () => {
  it('should create', () => {
    const f = new PeoplesFilters()
    expect(f).toBeTruthy()
  })

  it('should allow dynamic keys', () => {
    const f = new PeoplesFilters()
    f['department'] = ['IT']
    expect(f['department']).toEqual(['IT'])
  })
})

describe('SearchCommunitiesRequest', () => {
  it('should create with competency keys in facets', () => {
    const req = new SearchCommunitiesRequest(['comp1', 'comp2'])
    expect(req).toBeTruthy()
    expect(req.facets).toContain('comp1')
    expect(req.facets).toContain('comp2')
    expect(req.facets).toContain('topicName')
  })

  it('should have correct defaults', () => {
    const req = new SearchCommunitiesRequest([])
    expect(req.pageNumber).toBe(0)
    expect(req.pageSize).toBe(6)
    expect(req.filterCriteriaMap.status).toBe('active')
    expect(req.requestedFields).toEqual([])
  })
})

describe('SearchNLP', () => {
  it('should create with defaults', () => {
    const nlp = new SearchNLP()
    expect(nlp.query).toBe('')
    expect(nlp.synonyms).toBe(false)
  })
})
