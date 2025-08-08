import { Routes } from '@angular/router';

export const EVENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./components/event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/event-form/event-form.component').then(m => m.EventFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/event-form/event-form.component').then(m => m.EventFormComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./components/event-details/event-details.component').then(m => m.EventDetailsComponent)
  }
];
