// =======================================
//  Load Your Lambda Functions from the sam-app/src directory
// =======================================
import { lambdaHandler as $connectRouteKeyLambdaHandler } from "../sam-app/src/connect-route-function/index";
import { lambdaHandler as customActionRouteKeyLambdaHandler } from "../sam-app/src/customAction-route-function/index";
import { lambdaHandler as $disconnectRouteKeyLambdaHandler } from "../sam-app/src/disconnect-route-function/index";
import { lambdaHandler as $defaultRouteKeyLambdaHandler } from "../sam-app/src/default-route-function/index";

// =======================================
//  ⬆️ Append more Lambda functions here as needed
//  Define new WebSocket route handlers following this structure
// =======================================

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { parse } from "url";
import env from "dotenv";

import invokeLambdaFunction from "./lib/invokeLambdaFunction";

import {
  connectEvent,
  defaultEvent,
  disconnectEvent,
} from "./events/websocketEvents";

env.config({
  path: "./.env.development",
});

const PORT = Number(process.env.PORT) || 8080;
const server = createServer(); // Create an HTTP server for handling WebSocket upgrades

// =======================================
//  🔄 WebSocket Server in "noServer" Mode
//  This prevents unauthorized connections before they are fully established
// =======================================
const wss = new WebSocketServer({ noServer: true });

// =======================================
//  🛑 WebSocket Upgrade Interception
//  Handles incoming WebSocket upgrade requests BEFORE connection establishment
// =======================================
server.on("upgrade", async (request, socket, head) => {
  try {
    // =======================================
    //  🔗 WebSocket Route: "$connect"
    //  Invoked before allowing the connection
    // =======================================
    if (connectEvent.headers) {
      connectEvent.headers.Origin = request.headers.origin;
    }
    if (connectEvent.requestContext) {
      connectEvent.requestContext.domainName = request.headers.host;
    }
    // Parse query params
    const parsedUrl = parse(request.url || "", true); // Parse URL with query
    const queryParams = parsedUrl.query as Record<string, string | string[]>; // Extract query params

    // Append single-value query parameters
    connectEvent.queryStringParameters = {
      ...connectEvent.queryStringParameters, // Preserve existing values
      ...Object.fromEntries(
        Object.entries(queryParams).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value, // Convert arrays to single values
        ])
      ),
    };

    // Append multi-value query parameters
    connectEvent.multiValueQueryStringParameters = {
      ...connectEvent.multiValueQueryStringParameters, // Preserve existing values
      ...Object.fromEntries(
        Object.entries(queryParams).map(([key, value]) => [
          key,
          Array.isArray(value) ? value : [value], // Ensure all values are arrays
        ])
      ),
    };

    // =======================================
    //  🔗 WebSocket Route: "$connect"
    //  Triggered when a client connects
    // =======================================
    const connectResponse = await $connectRouteKeyLambdaHandler(connectEvent);

    // =======================================
    //  🛑 Deny Connection if Unauthorized
    // =======================================
    if (
      (connectResponse as any).statusCode &&
      [403, 401, 500, 502, 503, 504].includes(
        (connectResponse as any).statusCode
      )
    ) {
      console.log("❌ Connection rejected by $connect Lambda.");
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); // Send 401 response
      socket.destroy();
      return;
    }

    // =======================================
    //  🔄 Upgrade WebSocket Connection
    //  Only proceed if Lambda allows the connection
    // =======================================
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    console.error("🚨 Error during $connect Lambda execution:", error);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    socket.destroy();
  }
});

// =======================================
//  🎯 WebSocket Connection Event
//  This executes only for authorized connections
// =======================================
wss.on("connection", async (ws, req) => {
  ws.on("message", async (message) => {
    const body = JSON.parse(message.toString());
    const messageEvent: WebSocketEvent = {
      ...defaultEvent,
      body: JSON.stringify({ ...body, action: undefined }),
      requestContext: {
        ...defaultEvent.requestContext,
        routeKey: body.action,
      },
    };

    // =======================================
    //  🔄 Dynamic WebSocket Route Handling
    //  Routes messages based on body.action
    // =======================================
    switch (body.action) {
      // =======================================
      //  🎯 WebSocket Route: "customAction"
      // =======================================
      case "customAction":
        await invokeLambdaFunction(
          ws,
          customActionRouteKeyLambdaHandler,
          messageEvent
        );
        break;

      // =======================================
      //  🔧 WebSocket Route: "customAction2" (Placeholder)
      //  Uncomment and modify to add new routes
      // =======================================
      // case "customAction2":
      //   await invokeLambdaFunction(
      //     ws,
      //     customAction2RouteKeyLambdaHandler,
      //     messageEvent
      //   );
      //   break;

      // =======================================
      //  🌎 WebSocket Route: "$default"
      //  Handles unmatched routes
      // =======================================
      default:
        await invokeLambdaFunction(
          ws,
          $defaultRouteKeyLambdaHandler,
          messageEvent
        );
    }
  });

  // =======================================
  //  ❌ WebSocket Route: "$disconnect"
  //  Triggered when a client disconnects
  // =======================================
  ws.on("close", async () => {
    await $disconnectRouteKeyLambdaHandler(disconnectEvent);
  });
});

// =======================================
//  🚀 Start WebSocket Server
// =======================================
server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});
