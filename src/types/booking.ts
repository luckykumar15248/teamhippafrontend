export interface BookingParticipant {
  participantId?: number;
  bookingId?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface BookingAddon {
  addonId?: number;
  groupName: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
}

export interface CampBooking {
  bookingId: number;
  campId: number;
  campTitle: string;
  campSlug: string;
  sessionId: number;
  sessionName: string;
  sessionStartDate: string;
  sessionEndDate: string;
  basePrice: number;
  totalAmount: number;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  participantCount: number;
  participants: BookingParticipant[];
  addons: BookingAddon[];
  customer: {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  notes?: string;
}

export interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  campId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}