import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

// Ant Design Components
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// Models and Services
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzSpinModule,
    NzEmptyModule,
    NzIconModule,
    NzPopconfirmModule,
    NzTagModule,
    NzToolTipModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  searchControl = new FormControl('');
  visibilityFilter = new FormControl<string | null>(null);
  sortOrder = new FormControl<'asc' | 'desc'>('asc');
  
  private destroy$ = new Subject<void>();

  // Table configuration
  pageSize = 10;
  currentPage = 1;
  total = 0;

  constructor(
    private eventService: EventService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.setupFilterSubscription();
    this.setupSortSubscription();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.applyFilters();
    });
  }

  private setupFilterSubscription(): void {
    this.visibilityFilter.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private setupSortSubscription(): void {
    this.sortOrder.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private loadEvents(): void {
    this.eventService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.loading = loading;
    });

    this.eventService.events$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(events => {
      this.events = events;
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    let filtered = [...this.events];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply visibility filter
    const visibility = this.visibilityFilter.value;
    if (visibility !== null) {
      const isPublic = visibility === 'public';
      filtered = filtered.filter(event => event.isPublic === isPublic);
    }

    // Apply sorting
    const sortOrder = this.sortOrder.value;
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDateTime).getTime();
      const dateB = new Date(b.startDateTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.filteredEvents = filtered;
    this.total = filtered.length;
  }

  onCreateEvent(): void {
    this.router.navigate(['/p/events/create']);
  }

  onEditEvent(event: Event): void {
    this.router.navigate(['/p/events/edit', event.id]);
  }

  onViewEvent(event: Event): void {
    this.router.navigate(['/p/events/details', event.id]);
  }

  onDeleteEvent(event: Event): void {
    this.eventService.deleteEvent(event.id).subscribe(success => {
      if (success) {
        this.message.success('Event deleted successfully');
        this.applyFilters();
      } else {
        this.message.error('Failed to delete event');
      }
    });
  }

  onRefresh(): void {
    this.eventService.refreshEvents();
  }

  getEventStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'draft':
        return 'orange';
      default:
        return 'default';
    }
  }

  getEventVisibilityTag(isPublic: boolean | undefined): { text: string; color: string } {
    if (isPublic) {
      return { text: 'Public', color: 'blue' };
    } else {
      return { text: 'Private', color: 'orange' };
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
