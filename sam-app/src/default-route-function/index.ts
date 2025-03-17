import { APIGatewayProxyResultV2 } from "aws-lambda";

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

// create client
const client = process.env.PRODUCTION
  ? new ApiGatewayManagementApiClient({
      apiVersion: "2020-11-20",
      endpoint: `https://${process.env.API_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.STAGE}`,
    })
  : undefined;

export const lambdaHandler = async (
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> => {
  const parsedEvent = {
    routeKey: event.requestContext.routeKey,
    ...(event.body && {
      body: JSON.parse(event.body) as { message: string },
    }),
    connectionId: event.requestContext.connectionId,
  };

  if (process.env.PRODUCTION && !client) {
    throw new Error("API Gateway Management API client is not initialized.");
  }

  const Data = JSON.stringify({
    message: "$default route has been triggered by API Gateway.",
    connectionId: parsedEvent.connectionId,
  });

  // A client is only available in production environment
  if (client) {
    try {
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: parsedEvent.connectionId,
        Data,
      });
      await client.send(postToConnectionCommand);
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        statusCode: 500,
      };
    }
    // Local development environment
  }
  if (!client) {
    return {
      statusCode: 200,
      body: Data,
    };
  }

  // If we get here, something went wrong
  return {
    statusCode: 500,
  };
};
