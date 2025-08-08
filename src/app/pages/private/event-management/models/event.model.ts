export interface Event {
  id: string;
  title: string;
  status: string;
  organizer: {
    id: string;
    businessName: string;
  };
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  description: string;
  primaryImageUrl: string;
  coverImageUrl: string;
  imageGalleryUrls: string[];
  venue: Venue;
  tickets: Ticket[];
  leads: Lead[];
  dateAdded: string;
  dateUpdated: string | null;
  dateDeleted: string | null;
  isPublic?: boolean; // Added for public/private toggle
}

export interface Venue {
  id: string;
  email: string;
  venueName: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  postalZip: string;
  latitude: number;
  longitude: number;
  imageGalleryUrls: string[];
}

export interface Ticket {
  id: string;
  prefix: string;
  postfix: string;
  ticketName: string;
  price: number;
  currency: string;
  capacity: number;
  coupons: Coupon[];
  ticketPurchases: TicketPurchase[];
  dateAdded: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
}

export interface TicketPurchase {
  id: string;
  person: {
    id: string;
    firstName: string;
  };
  quantity: number;
  purchaseDate: string;
  totalPrice: number;
}

export interface Lead {
  id: string;
  status: string;
  organization: {
    id: string;
  };
  person: {
    id: string;
    email: string;
    status: string;
  };
  handlerLinks: HandlerLink[];
}

export interface HandlerLink {
  id: string;
  user: {
    id: string;
  };
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  venue: {
    venueName: string;
    address1: string;
    city: string;
    state: string;
    country: string;
    postalZip: string;
  };
  primaryImageUrl: string;
  coverImageUrl: string;
  isPublic: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}
