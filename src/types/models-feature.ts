// User model with BREAKING CHANGES for testing
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  // PENDING removed - BREAKING CHANGE
  SUSPENDED = "SUSPENDED", // Added - BREAKING CHANGE for strictly typed clients
}

export enum OrderStatus {
  CREATED = "CREATED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export enum PaymentMethod {
  // Changed from union type to enum - BREAKING CHANGE
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER", // Added - BREAKING CHANGE
}

export interface User {
  id: number;
  emailAddress: string; // Renamed from 'email' - BREAKING CHANGE
  name: string;
  status: UserStatus;
  description: string; // Changed from nullable to required - BREAKING CHANGE
  // metadata removed - BREAKING CHANGE
  tag: string; // Changed from tags: string[] to single tag - BREAKING CHANGE (array structure changed)
  paymentMethod: PaymentMethod;
  phoneNumber: string; // Added required field - BREAKING CHANGE
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  specifications: ProductSpec[]; // array of objects
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Order {
  id: number;
  userId: number;
  productIds: number[]; // array structure
  status: OrderStatus;
  total: number;
  discountCode: string | null; // nullable
  shippingAddress: Address | null; // Changed from required to nullable - BREAKING CHANGE
}

export interface Address {
  street: string;
  city: string;
  postalCode: string; // Changed from zipCode + country to postalCode - BREAKING CHANGE (object structure changed)
  // zipCode removed
  // country removed
}

