import { FilterSearchPipe } from './filter-search.pipe';

describe('FilterSearchPipe', () => {
  let pipe: FilterSearchPipe;

  beforeEach(() => {
    pipe = new FilterSearchPipe();
  });

  it('should create an instance of FilterSearchPipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array if no items are provided', () => {
    const result = pipe.transform([], 'test');
    expect(result).toEqual([]);
  });

  it('should return the same array if no searchText is provided', () => {
    const items = [{ name: 'Item 1' }, { name: 'Item 2' }];
    const result = pipe.transform(items, '');
    expect(result).toEqual(items);
  });

  it('should filter items based on the searchText', () => {
    const items = [
      { name: 'Item 1' },
      { name: 'Item 2' },
      { name: 'Another Item' }
    ];
    const result = pipe.transform(items, 'Item');
    expect(result).toEqual([
      { name: 'Item 1' },
      { name: 'Item 2' }
    ]);
  });

  it('should return an empty array if no items match the searchText', () => {
    const items = [
      { name: 'Item 1' },
      { name: 'Item 2' }
    ];
    const result = pipe.transform(items, 'Nonexistent');
    expect(result).toEqual([]);
  });

  it('should match against "name" or "title" property of the item', () => {
    const items = [
      { name: 'Item 1' },
      { title: 'Some Title' },
      { name: 'Another Item' }
    ];
    const result = pipe.transform(items, 'Title');
    expect(result).toEqual([{ title: 'Some Title' }]);
  });

  it('should handle items with missing "name" or "title" property gracefully', () => {
    const items = [
      { name: 'Item 1' },
      { title: 'Some Title' },
      { noNameOrTitle: 'Invalid' }
    ];
    const result = pipe.transform(items, 'Item');
    expect(result).toEqual([{ name: 'Item 1' }]);
  });
});
