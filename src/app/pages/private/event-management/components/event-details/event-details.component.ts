import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

// Ant Design Components
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

// Models and Services
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzCardModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzImageModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzDividerModule,
    NzEmptyModule
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  loading = false;
  eventId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEventDetails();
    } else {
      this.message.error('Event ID not provided');
      this.router.navigate(['/p/events/list']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEventDetails(): void {
    this.loading = true;
    this.eventService.getEventById(this.eventId!).subscribe(event => {
      if (event) {
        this.event = event;
      } else {
        this.message.error('Event not found');
        this.router.navigate(['/p/events/list']);
      }
      this.loading = false;
    });
  }

  onEditEvent(): void {
    if (this.event) {
      this.router.navigate(['/p/events/edit', this.event.id]);
    }
  }

  onBackToList(): void {
    this.router.navigate(['/p/events/list']);
  }

  onCopyPublicLink(): void {
    if (this.event && this.event.isPublic) {
      const publicLink = `${window.location.origin}/events/${this.event.id}`;
      navigator.clipboard.writeText(publicLink).then(() => {
        this.message.success('Public link copied to clipboard!');
      }).catch(() => {
        this.message.error('Failed to copy link');
      });
    }
  }

  onShareEvent(): void {
    if (this.event && this.event.isPublic) {
      const shareData = {
        title: this.event.title,
        text: this.event.description,
        url: `${window.location.origin}/events/${this.event.id}`
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          this.onCopyPublicLink();
        });
      } else {
        this.onCopyPublicLink();
      }
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getTicketCount(): number {
    return this.event?.tickets?.length || 0;
  }

  getLeadCount(): number {
    return this.event?.leads?.length || 0;
  }

  getTotalTicketCapacity(): number {
    return this.event?.tickets?.reduce((total, ticket) => total + ticket.capacity, 0) || 0;
  }

  getTotalTicketSales(): number {
    return this.event?.tickets?.reduce((total, ticket) => {
      return total + ticket.ticketPurchases.reduce((purchaseTotal, purchase) => purchaseTotal + purchase.quantity, 0);
    }, 0) || 0;
  }

  getVenueFullAddress(): string {
    if (!this.event?.venue) return '';
    
    const venue = this.event.venue;
    return `${venue.address1}, ${venue.city}, ${venue.state} ${venue.postalZip}, ${venue.country}`;
  }
}
