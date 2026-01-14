// User model with various field types for testing
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

export enum OrderStatus {
  CREATED = "CREATED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL";

export interface User {
  id: number;
  email: string;
  name: string;
  status: UserStatus;
  description: string | null; // nullable field
  metadata: Record<string, any>; // object structure
  tags: string[]; // array structure
  paymentMethod: PaymentMethod; // union type (will extend)
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
  shippingAddress: Address; // nested object
}

export interface Address {
  location: {
    street: string;
    city: string;
  };
  postal: {
    zipCode: string;
    country: string;
  };
}

