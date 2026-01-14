import gql from "graphql-tag";

export const typeDefs = gql`
  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
  }

  enum OrderStatus {
    CREATED
    PROCESSING
    SHIPPED
    DELIVERED
  }

  union PaymentMethod = CreditCard | DebitCard | PayPal

  type CreditCard {
    type: String!
    last4: String!
  }

  type DebitCard {
    type: String!
    bank: String!
  }

  type PayPal {
    email: String!
  }

  input PaymentMethodInput {
    # CreditCard fields
    type: String
    last4: String
    # DebitCard fields
    bank: String
    # PayPal fields
    email: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    status: UserStatus!
    description: String
    metadata: JSON
    tags: [String!]!
    paymentMethod: PaymentMethod!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    category: String!
    inStock: Boolean!
    specifications: [ProductSpec!]!
  }

  type ProductSpec {
    key: String!
    value: String!
  }

  type Location {
    street: String!
    city: String!
  }

  type Postal {
    zipCode: String!
    country: String!
  }

  type Address {
    location: Location!
    postal: Postal!
  }

  type Order {
    id: ID!
    userId: ID!
    productIds: [ID!]!
    status: OrderStatus!
    total: Float!
    discountCode: String
    shippingAddress: Address!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    order(id: ID!): Order
    orders: [Order!]!
    products: [Product!]!
  }

  type Mutation {
    createUser(
      email: String!
      name: String!
      status: UserStatus!
      description: String
      metadata: JSON
      tags: [String!]!
      paymentMethod: PaymentMethodInput!
    ): User!
    updateUser(
      id: ID!
      email: String!
      name: String!
      status: UserStatus!
      description: String
      metadata: JSON
      tags: [String!]!
      paymentMethod: PaymentMethodInput!
    ): User!
    deleteUser(id: ID!): Boolean!
    createProduct(
      name: String!
      price: Float!
      category: String!
      inStock: Boolean!
      specifications: [ProductSpecInput!]!
    ): Product!
    updateProduct(
      id: ID!
      name: String!
      price: Float!
      category: String!
      inStock: Boolean!
      specifications: [ProductSpecInput!]!
    ): Product!
    deleteProduct(id: ID!): Boolean!
    createOrder(
      userId: ID!
      productIds: [ID!]!
      status: OrderStatus!
      total: Float!
      discountCode: String
      shippingAddress: AddressInput!
    ): Order!
    updateOrder(
      id: ID!
      userId: ID!
      productIds: [ID!]!
      status: OrderStatus!
      total: Float!
      discountCode: String
      shippingAddress: AddressInput!
    ): Order!
    deleteOrder(id: ID!): Boolean!
  }

  input ProductSpecInput {
    key: String!
    value: String!
  }

  input LocationInput {
    street: String!
    city: String!
  }

  input PostalInput {
    zipCode: String!
    country: String!
  }

  input AddressInput {
    location: LocationInput!
    postal: PostalInput!
  }

  scalar JSON
`;

