// scorm-player.component.ts
import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';
import { ScormService } from './scorm_service';

@Component({
  selector: 'app-scorm-player',
  template: `
    <div class="scorm-player-container">
      <div class="scorm-controls" *ngIf="showControls">
        <button (click)="initializeScorm()" [disabled]="isInitialized">Initialize</button>
        <button (click)="commitData()" [disabled]="!isInitialized">Commit</button>
        <button (click)="terminateScorm()" [disabled]="!isInitialized">Terminate</button>
        <div class="scorm-status">
          Status: <span [class]="'status-' + completionStatus">{{ completionStatus }}</span>
        </div>
      </div>
      
      <div class="scorm-content" [style.height]="contentHeight">
        <iframe 
          #scormFrame
          [src]="contentUrl" 
          width="100%" 
          height="100%"
          frameborder="0"
          (load)="onFrameLoad()">
        </iframe>
      </div>
      
      <!-- <div class="scorm-debug" *ngIf="debugMode">
        <h4>Debug Information</h4>
        <pre>{{ debugInfo | json }}</pre>
      </div> -->
    </div>
  `,
  styles: [`
    .scorm-player-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .scorm-controls {
      padding: 10px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .scorm-controls button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .scorm-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .scorm-status {
      margin-left: auto;
      font-weight: bold;
    }
    
    .status-completed { color: #28a745; }
    .status-incomplete { color: #ffc107; }
    .status-passed { color: #28a745; }
    .status-failed { color: #dc3545; }
    
    .scorm-content {
      flex: 1;
      overflow: hidden;
    }
    
    .scorm-debug {
      max-height: 200px;
      overflow-y: auto;
      background: #f8f9fa;
      border-top: 1px solid #ddd;
      padding: 10px;
    }
    
    .scorm-debug pre {
      font-size: 12px;
      margin: 0;
    }
  `]
})
export class ScormPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() contentUrl: string = '';
  @Input() scormVersion: '1.2' | '2004' | 'aicc' = '2004';
  @Input() lmsCommitUrl: string = '';
  @Input() showControls: boolean = true;
  @Input() debugMode: boolean = false;
  @Input() contentHeight: string = '600px';
  @Input() sandboxOptions: string = 'allow-scripts allow-same-origin allow-forms';
  @Input() initialData: any = null;
  
  @ViewChild('scormFrame') scormFrame!: ElementRef<HTMLIFrameElement>;
  
  isInitialized: boolean = false;
  completionStatus: string = 'incomplete';
  debugInfo: any = {};
  
  constructor(
    private scormService: ScormService,
  ) {}
  
  ngOnInit() {
    this.setupScormApi();
  }
  
  ngAfterViewInit() {
    // Set up communication with iframe if needed
    this.setupCrossFrameCommunication();
  }
  
  ngOnDestroy() {
    if (this.isInitialized) {
      this.terminateScorm();
    }
  }
  
  private setupScormApi() {
    const settings = {
      autocommit: true,
      autocommitSeconds: 30,
      lmsCommitUrl: this.lmsCommitUrl,
      logLevel: this.debugMode ? 'DEBUG' : 'ERROR',
      dataCommitFormat: 'json' as const,
      responseHandler: this.handleLmsResponse.bind(this),
      onLogMessage: this.handleLogMessage.bind(this)
    };
    
    this.scormService.initializeScorm(this.scormVersion, settings);
    
    // Load initial data if provided
    if (this.initialData) {
      this.scormService.loadInitialData(this.initialData);
    }
  }
  
  private setupCrossFrameCommunication() {
    // Listen for messages from SCORM content
    window.addEventListener('message', (event) => {
      if (event.source === this.scormFrame?.nativeElement?.contentWindow) {
        this.handleScormMessage(event.data);
      }
    });
  }
  
  private handleScormMessage(data: any) {
    if (this.debugMode) {
      console.log('SCORM Message:', data);
    }
    
    // Handle different types of messages from SCORM content
    switch (data.type) {
      case 'scorm-api-request':
        this.handleApiRequest(data);
        break;
      case 'scorm-data-update':
        this.updateDebugInfo();
        break;
    }
  }
  
  private handleApiRequest(data: any) {
    const api = this.scormService.getApi();
    if (api && data.method) {
      try {
        const result = api[data.method](data.param1 || '', data.param2 || '');
        this.postMessageToFrame({
          type: 'scorm-api-response',
          id: data.id,
          result: result
        });
      } catch (error) {
        console.error('SCORM API Error:', error);
      }
    }
  }
  
  private postMessageToFrame(message: any) {
    if (this.scormFrame?.nativeElement?.contentWindow) {
      this.scormFrame.nativeElement.contentWindow.postMessage(message, '*');
    }
  }
  
  initializeScorm() {
    const result = this.scormService.initialize();
    this.isInitialized = result === 'true';
    this.updateDebugInfo();
    
    if (this.isInitialized) {
      console.log('SCORM initialized successfully');
    }
  }
  
  commitData() {
    const result = this.scormService.commit();
    this.updateDebugInfo();
    
    if (result === 'true') {
      console.log('SCORM data committed successfully');
    }
  }
  
  terminateScorm() {
    const result = this.scormService.terminate();
    this.isInitialized = false;
    this.updateDebugInfo();
    
    if (result === 'true') {
      console.log('SCORM terminated successfully');
    }
  }
  
  onFrameLoad() {
    console.log('SCORM content loaded');
    
    // Auto-initialize if not already done
    if (!this.isInitialized) {
      setTimeout(() => {
        this.initializeScorm();
      }, 1000);
    }
  }
  
  private updateDebugInfo() {
    if (this.debugMode) {
      const cmiData = this.scormService.getCmiData();
      this.debugInfo = {
        initialized: this.isInitialized,
        cmiData: cmiData,
        completionStatus: this.getCompletionStatus(),
        score: this.getScore(),
        suspendData: this.scormService.getSuspendData()
      };
      
      this.completionStatus = this.getCompletionStatus();
    }
  }
  
  private getCompletionStatus(): string {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return this.scormService.getValue('cmi.core.lesson_status') || 'incomplete';
    } else {
      const completion = this.scormService.getValue('cmi.completion_status') || 'incomplete';
      const success = this.scormService.getValue('cmi.success_status') || 'unknown';
      
      if (success === 'passed') return 'passed';
      if (success === 'failed') return 'failed';
      return completion;
    }
  }
  
  private getScore(): any {
    if (this.scormVersion === '1.2' || this.scormVersion === 'aicc') {
      return {
        raw: this.scormService.getValue('cmi.core.score.raw'),
        min: this.scormService.getValue('cmi.core.score.min'),
        max: this.scormService.getValue('cmi.core.score.max')
      };
    } else {
      return {
        raw: this.scormService.getValue('cmi.score.raw'),
        min: this.scormService.getValue('cmi.score.min'),
        max: this.scormService.getValue('cmi.score.max')
      };
    }
  }
  
  private handleLmsResponse(response: Response): Promise<any> {
    return response.json().then(data => {
      return {
        result: data.success || data.result,
        errorCode: data.errorCode || 0
      };
    });
  }
  
  private handleLogMessage(level: string, message: string) {
    if (this.debugMode) {
      console.log(`[SCORM ${level}] ${message}`);
    }
  }
  
  // Public methods for external control
  setCompletionStatus(status: 'completed' | 'incomplete' | 'passed' | 'failed') {
    this.scormService.setCompletionStatus(status);
    this.updateDebugInfo();
  }
  
  setScore(raw: number, min: number = 0, max: number = 100) {
    this.scormService.setScore(raw, min, max);
    this.updateDebugInfo();
  }
  
  setSuspendData(data: string) {
    this.scormService.setSuspendData(data);
    this.updateDebugInfo();
  }
}