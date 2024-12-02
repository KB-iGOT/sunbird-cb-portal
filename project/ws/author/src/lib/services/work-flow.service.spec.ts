
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service';
import { ConditionCheckService } from '@ws/author/src/lib/modules/shared/services/condition-check.service';
import { AuthInitService } from '@ws/author/src/lib/services/init.service';
import { WorkFlowService } from './work-flow.service';


describe('WorkFlowService', () => {
    let component: WorkFlowService;

    const initService :Partial<AuthInitService> ={};
	const conditionService :Partial<ConditionCheckService> ={};
	const accessControlSvc :Partial<AccessControlService> ={};

    beforeAll(() => {
        component = new WorkFlowService(
            initService as AuthInitService,
			conditionService as ConditionCheckService,
			accessControlSvc as AccessControlService
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