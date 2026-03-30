import gql from "graphql-tag";

export const typeDefs = gql`
  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
    SUSPENDED
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
    description: String!
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

  type Address {
    street: String!
    city: String!
    zipCode: String!
    country: String!
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
      description: String!
      tags: [String!]!
      paymentMethod: PaymentMethodInput!
    ): User!
    updateUser(
      id: ID!
      email: String!
      name: String!
      status: UserStatus!
      description: String!
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

  input AddressInput {
    street: String!
    city: String!
    zipCode: String!
    country: String!
  }

  scalar JSON
`;

