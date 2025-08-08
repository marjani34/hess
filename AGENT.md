# Event Management Module - AI Agent Documentation

## Module Purpose

The Event Management Module is a comprehensive Angular feature module that allows logged-in users to create, view, edit, and delete events for their organization. It provides a complete CRUD interface with advanced filtering, sorting, and search capabilities.

### Key Files/Folders Structure:
```
src/app/pages/private/event-management/
├── event-management.module.ts          # Main module configuration
├── event-management.routes.ts          # Routing configuration
├── models/
│   └── event.model.ts                  # TypeScript interfaces
├── services/
│   └── event.service.ts                # Data management service
└── components/
    ├── event-list/                     # Events listing with filters
    ├── event-form/                     # Create/Edit form
    └── event-details/                  # Event details view
```

## Architecture Overview

### Components
- **EventListComponent**: Displays events in a table with search, filter, and sort functionality
- **EventFormComponent**: Shared form component for both create and edit modes
- **EventDetailsComponent**: Detailed view with statistics and sharing capabilities

### Services
- **EventService**: Manages data operations, filtering, and state management using RxJS BehaviorSubjects

### State Handling
- Uses RxJS BehaviorSubjects for reactive state management
- Implements loading states and error handling
- Maintains filtered and sorted data streams

### Data Flow
1. EventService fetches data from mock API
2. Components subscribe to observables for reactive updates
3. User interactions trigger service methods
4. UI updates automatically through RxJS streams

## How to Extend

### Adding a New Field to the Form

1. **Update the Model** (`models/event.model.ts`):
```typescript
export interface Event {
  // ... existing fields
  newField?: string; // Add new field
}
```

2. **Update the Form** (`components/event-form/event-form.component.ts`):
```typescript
private initForm(): void {
  this.eventForm = this.fb.group({
    // ... existing controls
    newField: ['', [Validators.required]], // Add form control
  });
}
```

3. **Update the Template** (`components/event-form/event-form.component.html`):
```html
<nz-form-item>
  <nz-form-label [nzSpan]="6" nzRequired>New Field</nz-form-label>
  <nz-form-control [nzSpan]="18" nzErrorTip="Please enter new field">
    <input nz-input formControlName="newField" placeholder="Enter new field" />
  </nz-form-control>
</nz-form-item>
```

4. **Update the Service** (`services/event.service.ts`):
```typescript
createEvent(eventData: CreateEventRequest): Observable<Event> {
  const newEvent: Event = {
    // ... existing fields
    newField: eventData.newField, // Add to creation
  };
}
```

### Adding a New Filter to the List

1. **Add Filter Control** (`components/event-list/event-list.component.ts`):
```typescript
export class EventListComponent {
  newFilter = new FormControl<string | null>(null);
  
  private setupNewFilterSubscription(): void {
    this.newFilter.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }
}
```

2. **Update Filter Logic**:
```typescript
private applyFilters(): void {
  let filtered = [...this.events];
  
  // Add new filter logic
  const newFilterValue = this.newFilter.value;
  if (newFilterValue) {
    filtered = filtered.filter(event => 
      event.someField.includes(newFilterValue)
    );
  }
  
  this.filteredEvents = filtered;
}
```

3. **Add to Template** (`components/event-list/event-list.component.html`):
```html
<nz-select 
  [formControl]="newFilter"
  [placeholder]="'Filter by new criteria'"
  style="width: 200px;"
>
  <nz-option [nzValue]="null" [nzLabel]="'All'"></nz-option>
  <nz-option nzValue="value1" [nzLabel]="'Option 1'"></nz-option>
</nz-select>
```

### Enhancing the Detail View

1. **Add New Section** (`components/event-details/event-details.component.html`):
```html
<nz-card class="new-section-card">
  <h3>New Section</h3>
  <nz-descriptions [nzColumn]="2" [nzBordered]="true">
    <nz-descriptions-item nzTitle="New Field">
      {{ event.newField }}
    </nz-descriptions-item>
  </nz-descriptions>
</nz-card>
```

2. **Add Helper Methods** (`components/event-details/event-details.component.ts`):
```typescript
getNewFieldDisplay(): string {
  return this.event?.newField || 'Not specified';
}
```

## AI Agent Notes

### How AI Was Used
- **Code Generation**: AI assisted in generating component templates and TypeScript interfaces
- **Architecture Design**: AI helped design the modular structure and data flow patterns
- **UI/UX**: AI provided suggestions for responsive design and user experience improvements
- **Error Handling**: AI helped implement comprehensive error handling and loading states

### Naming Conventions to Follow
- **Components**: Use PascalCase with descriptive names (e.g., `EventListComponent`)
- **Services**: Use PascalCase with "Service" suffix (e.g., `EventService`)
- **Models**: Use PascalCase for interfaces (e.g., `Event`, `CreateEventRequest`)
- **Files**: Use kebab-case (e.g., `event-list.component.ts`)
- **Methods**: Use camelCase with descriptive names (e.g., `getEventById`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `EVENT_MANAGEMENT_ROUTES`)

### Parts of Code AI Should Avoid Changing
- **Core Module Structure**: Don't modify the module imports and declarations
- **Service Architecture**: Maintain the RxJS-based reactive pattern
- **Routing Configuration**: Keep the lazy-loaded routing structure
- **Translation Keys**: Don't change the i18n key structure
- **Ant Design Integration**: Maintain the existing component imports

## Known Limitations / TODOs

### Current Limitations
1. **Mock Data Only**: Currently uses mock API - needs real backend integration
2. **Image Upload**: Simulated upload - needs real file upload service
3. **Pagination**: Basic pagination - could be enhanced with server-side pagination
4. **Real-time Updates**: No WebSocket integration for live updates
5. **Advanced Search**: Limited to title/description - could add full-text search

### TODOs for Enhancement
1. **Backend Integration**: Replace mock service with real HTTP calls
2. **File Upload**: Implement real image upload with progress indicators
3. **Advanced Filtering**: Add date range, price range, and category filters
4. **Bulk Operations**: Add bulk delete and export functionality
5. **Export Features**: Add PDF/Excel export for event data
6. **Real-time Notifications**: Add WebSocket for live updates
7. **Advanced Analytics**: Add charts and detailed statistics
8. **Email Integration**: Add email notifications for event updates
9. **Calendar Integration**: Add calendar view and iCal export
10. **Social Sharing**: Enhance sharing with social media integration

### Performance Optimizations
1. **Virtual Scrolling**: Implement for large event lists
2. **Image Optimization**: Add lazy loading and compression
3. **Caching**: Implement service worker for offline support
4. **Bundle Optimization**: Code splitting for better load times

## Prompt Example

Here's an example prompt to give to an AI to extend this module:

```
I need to add a new "Category" field to the Event Management Module. The category should be a dropdown with options like "Conference", "Workshop", "Concert", "Sports", "Other". 

Please:
1. Update the Event model to include a category field
2. Add the category field to the create/edit form with validation
3. Add category filtering to the event list
4. Display the category in the event details view
5. Update the translation keys for the new field

The category should be required and have a default value of "Other". The filter should allow filtering by multiple categories.
```

This prompt provides clear requirements and follows the established patterns in the codebase, making it easy for an AI to implement the requested feature.
