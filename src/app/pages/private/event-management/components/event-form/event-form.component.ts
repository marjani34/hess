import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

// Ant Design Components
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';

// Models and Services
import { Event, CreateEventRequest, UpdateEventRequest } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzUploadModule,
    NzSwitchModule,
    NzSelectModule,
    NzCardModule,
    NzSpinModule,
    NzIconModule,
    NzDividerModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnDestroy {
  eventForm!: FormGroup;
  loading = false;
  isEditMode = false;
  eventId: string | null = null;
  currentEvent: Event | null = null;
  
  private destroy$ = new Subject<void>();

  // Upload configuration
  primaryImageUrl = '';
  coverImageUrl = '';

  // Timezone options
  timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      startDate: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      venueName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      venueAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      venueCity: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      venueState: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      venueCountry: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      venuePostalCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      primaryImageUrl: ['', [Validators.required]],
      coverImageUrl: ['', [Validators.required]],
      isPublic: [true]
    });

    // Add cross-field validation for end date/time
    this.eventForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateDateTime();
    });
  }

  private checkEditMode(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventId;

    if (this.isEditMode && this.eventId) {
      this.loadEventForEdit();
    }
  }

  private loadEventForEdit(): void {
    this.loading = true;
    this.eventService.getEventById(this.eventId!).subscribe(event => {
      if (event) {
        this.currentEvent = event;
        this.populateForm(event);
      } else {
        this.message.error('Event not found');
        this.router.navigate(['/p/events/list']);
      }
      this.loading = false;
    });
  }

  private populateForm(event: Event): void {
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startDate: startDate,
      startTime: startDate,
      endDate: endDate,
      endTime: endDate,
      timezone: event.timezone,
      venueName: event.venue.venueName,
      venueAddress: event.venue.address1,
      venueCity: event.venue.city,
      venueState: event.venue.state,
      venueCountry: event.venue.country,
      venuePostalCode: event.venue.postalZip,
      primaryImageUrl: event.primaryImageUrl,
      coverImageUrl: event.coverImageUrl,
      isPublic: event.isPublic ?? true
    });

    this.primaryImageUrl = event.primaryImageUrl;
    this.coverImageUrl = event.coverImageUrl;
  }

  private validateDateTime(): void {
    const startDate = this.eventForm.get('startDate')?.value;
    const startTime = this.eventForm.get('startTime')?.value;
    const endDate = this.eventForm.get('endDate')?.value;
    const endTime = this.eventForm.get('endTime')?.value;

    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

      if (endDateTime <= startDateTime) {
        this.eventForm.get('endDate')?.setErrors({ invalidEndDate: true });
        this.eventForm.get('endTime')?.setErrors({ invalidEndTime: true });
      } else {
        this.eventForm.get('endDate')?.setErrors(null);
        this.eventForm.get('endTime')?.setErrors(null);
      }
    }
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.loading = true;
      const formValue = this.eventForm.value;

      // Combine date and time
      const startDateTime = this.combineDateTime(formValue.startDate, formValue.startTime);
      const endDateTime = this.combineDateTime(formValue.endDate, formValue.endTime);

      const eventData = {
        title: formValue.title,
        description: formValue.description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        timezone: formValue.timezone,
        venue: {
          venueName: formValue.venueName,
          address1: formValue.venueAddress,
          city: formValue.venueCity,
          state: formValue.venueState,
          country: formValue.venueCountry,
          postalZip: formValue.venuePostalCode
        },
        primaryImageUrl: formValue.primaryImageUrl,
        coverImageUrl: formValue.coverImageUrl,
        isPublic: formValue.isPublic
      };

      if (this.isEditMode && this.eventId) {
        const updateData = { ...eventData, id: this.eventId };
        this.eventService.updateEvent(this.eventId, updateData).subscribe(
          (updatedEvent) => {
            if (updatedEvent) {
              this.message.success('Event updated successfully');
              this.router.navigate(['/p/events/list']);
            } else {
              this.message.error('Failed to update event');
            }
            this.loading = false;
          },
          (error) => {
            this.message.error('Error updating event');
            this.loading = false;
          }
        );
      } else {
        this.eventService.createEvent(eventData).subscribe(
          (newEvent) => {
            this.message.success('Event created successfully');
            this.router.navigate(['/p/events/list']);
            this.loading = false;
          },
          (error) => {
            this.message.error('Error creating event');
            this.loading = false;
          }
        );
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private combineDateTime(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/p/events/list']);
  }

  // Upload handlers
  handlePrimaryImageUpload = (item: any): boolean => {
    // Simulate upload - in real app, you'd upload to server
    this.primaryImageUrl = item.url || 'https://api.slingacademy.com/public/sample-photos/1.jpeg';
    this.eventForm.patchValue({ primaryImageUrl: this.primaryImageUrl });
    return false; // Prevent default upload behavior
  }

  handleCoverImageUpload = (item: any): boolean => {
    // Simulate upload - in real app, you'd upload to server
    this.coverImageUrl = item.url || 'https://api.slingacademy.com/public/sample-photos/2.jpeg';
    this.eventForm.patchValue({ coverImageUrl: this.coverImageUrl });
    return false; // Prevent default upload behavior
  }

  getPageTitle(): string {
    return this.isEditMode ? 'Edit Event' : 'Create Event';
  }
}
