// scorm.service.ts
import { Injectable } from '@angular/core';
import { Scorm12API, Scorm2004API, AICC } from 'kb-scorm-again';

export interface ScormSettings {
  autocommit?: boolean;
  autocommitSeconds?: number;
  lmsCommitUrl?: string;
  logLevel?: any;
  dataCommitFormat?: 'json' | 'flattened' | 'params';
  asyncCommit?: boolean;
  sendFullCommit?: boolean;
  xhrWithCredentials?: boolean;
  xhrHeaders?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})

export class ScormService {
  private api: any;
  private scormVersion: '1.2' | '2004' | 'aicc' = '2004';

  constructor() {}

  /**
   * Initialize SCORM API based on version
   */
  initializeScorm(version: '1.2' | '2004' | 'aicc' = '2004', settings: ScormSettings = {}) {
    this.scormVersion = version;
    
    const defaultSettings: ScormSettings = {
      autocommit: true,
      autocommitSeconds: 30,
      logLevel: '',
      dataCommitFormat: 'json',
      asyncCommit: true,
      sendFullCommit: true,
      ...settings
    };

    switch (version) {
      case '1.2':
        this.api = new Scorm12API(defaultSettings);
        (window as any).API = this.api;
        break;
      case '2004':
        this.api = new Scorm2004API(defaultSettings);
        (window as any).API_1484_11 = this.api;
        break;
      case 'aicc':
        this.api = new AICC(defaultSettings);
        (window as any).API = this.api;
        break;
    }

    // Set up event listeners
    this.setupEventListeners();
    
    return this.api;
  }

  /**
   * Load initial data into SCORM API
   */
  loadInitialData(data: any) {
    if (this.api) {
      this.api.loadFromJSON(data);
    }
  }

  /**
   * Load flattened data into SCORM API
   */
  loadFlattenedData(data: any) {
    if (this.api) {
      this.api.loadFromFlattenedJSON(data);
    }
  }

  /**
   * Get SCORM API instance
   */
  getApi() {
    return this.api;
  }

  /**
   * Get current CMI data
   */
  getCmiData() {
    return this.api?.cmi;
  }

  /**
   * Get specific CMI value
   */
  getValue(element: string) {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.api?.LMSGetValue(element);
    } else {
      return this.api?.GetValue(element);
    }
  }

  /**
   * Set specific CMI value
   */
  setValue(element: string, value: string) {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.api?.LMSSetValue(element, value);
    } else {
      return this.api?.SetValue(element, value);
    }
  }

  /**
   * Commit data to LMS
   */
  commit() {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.api?.LMSCommit('');
    } else {
      return this.api?.Commit('');
    }
  }

  /**
   * Initialize SCORM session
   */
  initialize() {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.api?.LMSInitialize('');
    } else {
      return this.api?.Initialize('');
    }
  }

  /**
   * Terminate SCORM session
   */
  terminate() {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.api?.LMSFinish('');
    } else {
      return this.api?.Terminate('');
    }
  }

  /**
   * Set up event listeners for SCORM API
   */
  private setupEventListeners() {
    if (!this.api) return;

    // Listen for initialization
    const initEvent = this.scormVersion === '1.2' || this.scormVersion === 'aicc' ? 'LMSInitialize' : 'Initialize';
    this.api.on(initEvent, () => {
      console.log('SCORM API initialized');
    });

    // Listen for commits
    const commitEvent = this.scormVersion === '1.2' || this.scormVersion === 'aicc' ? 'LMSCommit' : 'Commit';
    this.api.on(commitEvent, () => {
      console.log('SCORM data committed');
    });

    // Listen for termination
    const terminateEvent = this.scormVersion === '1.2' || this.scormVersion === 'aicc' ? 'LMSFinish' : 'Terminate';
    this.api.on(terminateEvent, () => {
      console.log('SCORM session terminated');
    });

    // Listen for value changes (wildcard)
    const setValueEvent = this.scormVersion === '1.2' || this.scormVersion === 'aicc' ? 'LMSSetValue.cmi.*' : 'SetValue.cmi.*';
    this.api.on(setValueEvent, (element: string, value: any) => {
      console.log(`SCORM value set: ${element} = ${value}`);
    });
  }

  /**
   * Set completion status
   */
  setCompletionStatus(status: 'completed' | 'incomplete' | 'passed' | 'failed') {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      this.setValue('cmi.core.lesson_status', status);
    } else {
      this.setValue('cmi.completion_status', status === 'completed' || status === 'passed' ? 'completed' : 'incomplete');
      if (status === 'passed' || status === 'failed') {
        this.setValue('cmi.success_status', status);
      }
    }
  }

  /**
   * Set score
   */
  setScore(raw: number, min: number = 0, max: number = 100) {
    debugger
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      this.setValue('cmi.core.score.raw', raw.toString());
      this.setValue('cmi.core.score.min', min.toString());
      this.setValue('cmi.core.score.max', max.toString());
    } else {
      this.setValue('cmi.score.raw', raw.toString());
      this.setValue('cmi.score.min', min.toString());
      this.setValue('cmi.score.max', max.toString());
    }
  }

  /**
   * Set suspend data
   */
  setSuspendData(data: string) {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      this.setValue('cmi.suspend_data', data);
    } else {
      this.setValue('cmi.suspend_data', data);
    }
  }

  /**
   * Get suspend data
   */
  getSuspendData(): string {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.getValue('cmi.suspend_data');
    } else {
      return this.getValue('cmi.suspend_data');
    }
  }
}