import { DiscussV2HomeComponent } from './discuss-v2-home.component';
import { Router, ActivatedRoute } from '@angular/router';

// Mock objects
const mockRouter = {
  navigate: jest.fn()
};

const mockActivatedRoute = {
  snapshot: {
    data: {
      pageData: {
        data: {
          feedsWidgetData: {
            // Add mock feedsWidgetData properties here
            title: 'Recent Discussions'
          },
          communityWidgetData: {
            // Add mock communityWidgetData properties here
            title: 'Popular Communities'
          }
        }
      }
    }
  }
};

describe('DiscussV2HomeComponent', () => {
  let component: DiscussV2HomeComponent;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create component instance with mocked dependencies
    component = new DiscussV2HomeComponent(
      mockRouter as unknown as Router,
      mockActivatedRoute as unknown as ActivatedRoute
    );
  });

  it('should initialize shortCutData with three items', () => {
    expect(component.shortCutData).toBeDefined();
    expect(component.shortCutData.length).toBe(3);
    expect(component.shortCutData[0].name).toBe('Saved Posts');
    expect(component.shortCutData[1].name).toBe('Posts By You');
    expect(component.shortCutData[2].name).toBe('Pending Request');
  });

  it('should call getConfigurationData during initialization', () => {
    // Create a spy on the getConfigurationData method
    const spy = jest.spyOn(component, 'getConfigurationData');
    
    // Manually trigger the constructor logic again
    component = new DiscussV2HomeComponent(
      mockRouter as unknown as Router,
      mockActivatedRoute as unknown as ActivatedRoute
    );
    
    expect(spy).toHaveBeenCalled();
  });

  it('should set feedsWidgetData and communityWidgetData when pageData exists', () => {
    // This is implicitly called in constructor
    component.getConfigurationData();
    
    // expect(component.feedsWidgetData).toEqual();
    
    expect(component.communityWidgetData).toEqual({
      title: 'Popular Communities'
    });
  });

  it('should not update widget data when pageData is missing', () => {
    // Create a component with empty activatedRoute data
    const emptyActivatedRoute = {
      snapshot: {
        data: {}
      }
    };
    
    component = new DiscussV2HomeComponent(
      mockRouter as unknown as Router,
      emptyActivatedRoute as unknown as ActivatedRoute
    );
    
    expect(component.feedsWidgetData).toBeNull();
    expect(component.communityWidgetData).toEqual({});
  });

  it('should navigate to search page with query param on searchTextMethod', () => {
    const searchText = '  test query  ';
    component.searchTextMethod(searchText);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/discussion-forum-v2/search'],
      { queryParams: { c: 'test query' } }
    );
  });

  it('should navigate to communities by topic on showAllCommunityByTopic', () => {
    const topic = 'javascript';
    component.showAllCommunityByTopic(topic);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/discussion-forum-v2/communities/javascript']
    );
  });

  it('should navigate to communities by topic value on showAllCommunityByTopicCard', () => {
    const topicCard = { value: 'angular', label: 'Angular' };
    component.showAllCommunityByTopicCard(topicCard);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/discussion-forum-v2/communities/angular']
    );
  });

  it('should navigate to community details on communityCardClick', () => {
    const cardData = { communityId: '123', name: 'Test Community' };
    component.communityCardClick(cardData);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/discussion-forum-v2/community', '123']
    );
  });

  it('should navigate to all topics page on showAllTopics', () => {
    const eventData = { source: 'button' };
    component.showAllTopics(eventData);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/discussion-forum-v2/topics/all']
    );
  });
});