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

import {
  connectEvent,
  defaultEvent,
  disconnectEvent,
} from "./events/websocketEvents";

import invokeLambdaFunction from "./lib/invokeLambdaFunction";

import { Server } from "ws";

const PORT = Number(process.env.PORT) || 8080;

// Always use `wss` for the WebSocket server variable name (wss:// required in production for HTTPS).
const wss = new Server({ port: PORT });

// Reentrant Execution – Each call to on("message") executes separately without interfering with others.
wss.on("connection", async (ws) => {
  // Event-Driven Concurrency – Each connection operates independently via event listeners.

  // =======================================
  //  🔗 WebSocket Route: "$connect"
  //  Triggered when a client connects
  // =======================================
  await invokeLambdaFunction(ws, $connectRouteKeyLambdaHandler, connectEvent);

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

console.log(`WebSocket server is running at ws://localhost:${PORT}`);
