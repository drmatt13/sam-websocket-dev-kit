import { APIGatewayProxyResultV2 } from "aws-lambda";

export const lambdaHandler = async (
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> => {
  const parsedEvent = {
    routeKey: event.requestContext.routeKey,
    connectionId: event.requestContext.connectionId,
  };

  // Here you can handle any initial connection logic if needed
  //
  // For example, you might want to store the connectionId in a database or perform some other setup.
  //
  // Keep in mind YOU CANNOT send a message back to the client at this point, as the connection is still being established.
  //

  // Simply return success to accept the connection
  return {
    statusCode: 200,
  };
};
