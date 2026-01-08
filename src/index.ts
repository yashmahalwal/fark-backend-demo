import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import * as grpc from "@grpc/grpc-js";
import { getDatabase } from "./database/db";
import restRoutes from "./rest/routes";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getGrpcService } from "./grpc/service";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

// Initialize database
getDatabase();

// CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// REST API
app.use(express.json());
app.use("/api", restRoutes);

// GraphQL API
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await apolloServer.start();

  app.use("/graphql", express.json(), expressMiddleware(apolloServer));

  // Start REST/GraphQL server
  app.listen(PORT, () => {
    console.log(`REST API running on http://localhost:${PORT}/api`);
    console.log(`GraphQL API running on http://localhost:${PORT}/graphql`);
  });

  // Start gRPC server
  const PROTO_PATH = join(__dirname, "grpc/user.proto");
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

  const server = new grpc.Server();
  server.addService(userProto.user.UserService.service, getGrpcService());

  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("gRPC server failed to start:", err);
        return;
      }
      server.start();
      console.log(`gRPC API running on 0.0.0.0:${port}`);
    }
  );
}

startServer().catch(console.error);
