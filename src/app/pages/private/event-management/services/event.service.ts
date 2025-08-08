import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Event, CreateEventRequest, UpdateEventRequest } from '../models/event.model';
import { UserService } from '../../../../core/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly MOCK_API_URL = 'https://hessadnani.com/api/mock.json';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public events$ = this.eventsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  // Mock organization ID for demo purposes
  private readonly MOCK_ORG_ID = 'org-123';

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.loadingSubject.next(true);
    this.http.get<any>(this.MOCK_API_URL).pipe(
      map(response => {
        const events = response.events || [];
        // Filter events by the current user's organization
        return events.filter((event: Event) => 
          event.organizer.id === this.MOCK_ORG_ID && event.dateDeleted === null
        );
      }),
      tap(events => {
        this.eventsSubject.next(events);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading events:', error);
        this.loadingSubject.next(false);
        return of([]);
      })
    ).subscribe();
  }

  getEvents(): Observable<Event[]> {
    return this.events$;
  }

  getEventById(id: string): Observable<Event | null> {
    return this.events$.pipe(
      map(events => events.find(event => event.id === id) || null)
    );
  }

  createEvent(eventData: CreateEventRequest): Observable<Event> {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title: eventData.title,
      status: 'Active',
      organizer: {
        id: this.MOCK_ORG_ID,
        businessName: 'Event Corp'
      },
      startDateTime: eventData.startDateTime,
      endDateTime: eventData.endDateTime,
      timezone: eventData.timezone,
      description: eventData.description,
      primaryImageUrl: eventData.primaryImageUrl,
      coverImageUrl: eventData.coverImageUrl,
      imageGalleryUrls: [eventData.primaryImageUrl, eventData.coverImageUrl],
      venue: {
        id: `venue-${Date.now()}`,
        email: 'info@venue.com',
        venueName: eventData.venue.venueName,
        address1: eventData.venue.address1,
        city: eventData.venue.city,
        state: eventData.venue.state,
        country: eventData.venue.country,
        postalZip: eventData.venue.postalZip,
        latitude: 0,
        longitude: 0,
        imageGalleryUrls: []
      },
      tickets: [],
      leads: [],
      dateAdded: new Date().toISOString(),
      dateUpdated: null,
      dateDeleted: null,
      isPublic: eventData.isPublic
    };

    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, newEvent]);

    return of(newEvent);
  }

  updateEvent(id: string, eventData: UpdateEventRequest): Observable<Event | null> {
    const currentEvents = this.eventsSubject.value;
    const eventIndex = currentEvents.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return of(null);
    }

    const currentEvent = currentEvents[eventIndex];
    const updatedEvent: Event = {
      ...currentEvent,
      ...eventData,
      id: id, // Ensure ID is included
      venue: {
        ...currentEvent.venue,
        ...eventData.venue
      },
      dateUpdated: new Date().toISOString()
    };

    currentEvents[eventIndex] = updatedEvent;
    this.eventsSubject.next([...currentEvents]);

    return of(updatedEvent);
  }

  deleteEvent(id: string): Observable<boolean> {
    const currentEvents = this.eventsSubject.value;
    const eventIndex = currentEvents.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return of(false);
    }

    // Soft delete
    currentEvents[eventIndex] = {
      ...currentEvents[eventIndex],
      dateDeleted: new Date().toISOString()
    };

    this.eventsSubject.next([...currentEvents]);
    return of(true);
  }

  searchEvents(searchTerm: string): Observable<Event[]> {
    return this.events$.pipe(
      map(events => events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  filterEventsByVisibility(isPublic: boolean | null): Observable<Event[]> {
    return this.events$.pipe(
      map(events => {
        if (isPublic === null) return events;
        return events.filter(event => event.isPublic === isPublic);
      })
    );
  }

  sortEventsByDate(ascending: boolean = true): Observable<Event[]> {
    return this.events$.pipe(
      map(events => [...events].sort((a, b) => {
        const dateA = new Date(a.startDateTime).getTime();
        const dateB = new Date(b.startDateTime).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      }))
    );
  }

  refreshEvents(): void {
    this.loadEvents();
  }
}
