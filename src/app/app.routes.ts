import { Routes } from '@angular/router';
import { GeneralComponent } from './general'
import { RequestedComponent } from './requested';
import { LoginComponent } from './login';

import { DataResolver } from './app.resolver';

import { 
  StatusResolve,
  GeneralRatingHistoryResolve,
  InstructorResolve,
  NewCommerResolve,
  UnitResolve,
  YpResolve,
  RequestedResolve,
} from './resolves';

export const ROUTES: Routes = [
  { path: '',      component: LoginComponent },
  { path: 'login',      component: LoginComponent },
  { 
    path: 'general',
    component: GeneralComponent,
    resolve: {
      generals: GeneralRatingHistoryResolve,
      newCommers: NewCommerResolve,
      unitContainer: UnitResolve,
      statusContainer: StatusResolve,
      yps: YpResolve,
    } 
  },
  { 
    path: 'requested',
    component: RequestedComponent,
    resolve: {
      newCommers: NewCommerResolve,
      unitContainer: UnitResolve,
      statusContainer: StatusResolve,
      instructors: InstructorResolve,
      requesteds: RequestedResolve,
    } 
  },
  { path: '**',    component: LoginComponent },
];
