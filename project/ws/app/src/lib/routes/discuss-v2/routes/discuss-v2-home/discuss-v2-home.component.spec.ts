import { DiscussV2HomeComponent } from './discuss-v2-home.component';
import { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

describe('DiscussV2HomeComponent', () => {
  let component: DiscussV2HomeComponent;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let elementRef: ElementRef;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockRouter = {
      navigate: jest.fn(),
    } as any;
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: { data: { feedsWidgetData: { feeds: true }, communityWidgetData: { community: true } } },
        },
      },
    };
    elementRef = new ElementRef(document.createElement('div'));

    component = new DiscussV2HomeComponent(mockRouter, mockActivatedRoute as ActivatedRoute, elementRef);
  });

  afterEach(() => {
    component.ngOnDestroy();
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read widget data from the route', () => {
    expect(component.feedsWidgetData).toEqual({ feeds: true } as any);
    expect(component.communityWidgetData).toEqual({ community: true });
  });

  it('should click the my communities tab when it is the initial tab', () => {
    mockActivatedRoute.snapshot.data.initialTab = 'my_communities';
    const tab = document.createElement('div');
    tab.className = 'mat-mdc-tab';
    tab.textContent = ' My Communities ';
    const clickSpy = jest.spyOn(tab, 'click');
    elementRef.nativeElement.appendChild(tab);
    component = new DiscussV2HomeComponent(mockRouter, mockActivatedRoute as ActivatedRoute, elementRef);

    component.ngAfterViewInit();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should initialize shortCutData with correct values', () => {
    expect(component.shortCutData).toEqual([
      {
        name: 'Saved Posts',
        icon: 'bookmark_border',
        link: '/page/learn'
      },
      {
        name: 'Posts By You',
        icon: 'list_alt',
        link: ''
      },
      {
        name: 'Pending Request',
        icon: 'update',
        link: ''
      }
    ]);
  });

  describe('searchTextMethod', () => {
    it('should navigate to search with correct query params', () => {
      const searchText = ' test search ';
      component.searchTextMethod(searchText);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum-v2/search'],
        { queryParams: { c: 'test search' } }
      );
    });
  });

  describe('showAllCommunityByTopic', () => {
    it('should navigate to communities with correct topic', () => {
      const topic = 'technology';
      component.showAllCommunityByTopic(topic);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum-v2/communities/technology']
      );
    });
  });

  describe('showAllCommunityByTopicCard', () => {
    it('should navigate to communities with topic value', () => {
      const topicCard = { value: 'science' };
      component.showAllCommunityByTopicCard(topicCard);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum-v2/communities/science']
      );
    });
  });

  describe('communityCardClick', () => {
    it('should navigate to community with correct communityId', () => {
      const cardData = { communityId: '123' };
      component.communityCardClick(cardData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum-v2/community', '123']
      );
    });
  });

  describe('showAllTopics', () => {
    it('should navigate to all topics page', () => {
      component.showAllTopics({});
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum-v2/topics/all']
      );
    });
  });
});