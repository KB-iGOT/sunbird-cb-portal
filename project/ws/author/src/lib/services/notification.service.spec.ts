
import { AuthInitService } from '@ws/author/src/lib/services/init.service';
import { WorkFlowService } from './work-flow.service';
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service';
import { ApiService } from 'project/ws/author/src/lib/modules/shared/services/api.service';
import { NotificationService } from './notification.service';


describe('NotificationService', () => {
    let component: NotificationService;

    const apiService :Partial<ApiService> ={};
	const workFlowService :Partial<WorkFlowService> ={};
	const accessService :Partial<AccessControlService> ={};
	const initService :Partial<AuthInitService> ={};

    beforeAll(() => {
        component = new NotificationService(
            apiService as ApiService,
			workFlowService as WorkFlowService,
			accessService as AccessControlService,
			initService as AuthInitService
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
            
    it('should create a instance of component', () => {
        expect(component).toBeTruthy();
    });
});