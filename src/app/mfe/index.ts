/**
 * MFE (Micro Frontend) integration module.
 *
 * This module provides the infrastructure for loading Angular 20 remote
 * features into the Angular 16 sunbird-cb-portal host application.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Angular 16 Host (sunbird-cb-portal)                        │
 * │                                                              │
 * │  /new/home ──► MfeWrapperComponent                          │
 * │                  │                                          │
 * │                  ├─ loadRemoteModule()                      │
 * │                  │    └─ injects <script> remoteEntry.js    │
 * │                  │                                          │
 * │                  ├─ bootstrap()                              │
 * │                  │    └─ createApplication() + elements      │
 * │                  │                                          │
 * │                  └─ <igot-mfe-home> (Custom Element)         │
 * │                       └─ Angular 20 app (isolated)          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Key design decisions:
 * - NO shared Angular packages (v16 ↔ v20 incompatible)
 * - Each feature bootstraps via createApplication() + @angular/elements
 * - provideZonelessChangeDetection() avoids zone.js conflicts
 * - Pure dynamic loading via <script> — no webpack plugin on host
 *
 * Files:
 * - mfe-wrapper.component.ts  → Generic wrapper that loads & renders any MFE
 * - mfe.module.ts             → NgModule with CUSTOM_ELEMENTS_SCHEMA
 * - mfe-config.service.ts     → Centralized remote URL configuration
 * - load-remote.ts            → Dynamic Module Federation script loader
 */

export { MfeWrapperComponent } from './mfe-wrapper.component'
export { MfeModule } from './mfe.module'
export { MfeConfigService } from './mfe-config.service'
export { loadRemoteModule } from './load-remote'
