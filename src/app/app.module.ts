import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, RequestOptions } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

import { ModalModule, ButtonsModule, TooltipModule } from 'ngx-bootstrap';
import { SocketIoModule, SocketIoConfig } from 'ng2-socket-io';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { 
  DataService,
  MessageService, 
  SessionStorageService, 
  UtilService, 
  SocketService,
  LocalStorageService,
  AppRequestOptions,
} from './services';
import { 
  StatusResolve,
  GeneralRatingHistoryResolve,
  InstructorResolve,
  NewCommerResolve,
  UnitResolve,
  YpResolve,
  RequestedResolve,
} from './resolves'
import { 
  RequestedComponent, 
  EditRequestedComponent,
  SearchParamsComponent,
} from './requested';
import { 
  GeneralComponent, 
  RatingButtonComponent, 
  EditRatingComponent, 
  GeneralConfigComponent 
} from './general';
import { LoginComponent } from './login';
import { MessageComponent } from './message';

import { CONTEXT_PATH } from './const';


import '../styles/styles.scss';
import '../styles/headings.css';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

// Socket.IO
const socketIoConfig: SocketIoConfig = {
  url: CONTEXT_PATH,
  options: {}
}

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    GeneralComponent,
    GeneralConfigComponent,
    RatingButtonComponent,
    EditRatingComponent,
    MessageComponent,
    RequestedComponent,
    EditRequestedComponent,
    LoginComponent,
    SearchParamsComponent,
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    SocketIoModule.forRoot(socketIoConfig),
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    DataService,
    MessageService,
    SessionStorageService,
    UtilService,
    SocketService,
    StatusResolve,
    LocalStorageService,
    GeneralRatingHistoryResolve,
    InstructorResolve,
    NewCommerResolve,
    UnitResolve,
    YpResolve,
    RequestedResolve,
    {provide: RequestOptions, useClass: AppRequestOptions },
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    /**
     * Set state
     */
    this.appState._state = store.state;
    /**
     * Set input values
     */
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    /**
     * Save state
     */
    const state = this.appState._state;
    store.state = state;
    /**
     * Recreate root elements
     */
    store.disposeOldHosts = createNewHosts(cmpLocation);
    /**
     * Save input values
     */
    store.restoreInputValues  = createInputTransfer();
    /**
     * Remove styles
     */
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    /**
     * Display new elements
     */
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
