import { APIGatewayProxyResultV2 } from "aws-lambda";

export const lambdaHandler = async (
  event: WebSocketEvent
): Promise<APIGatewayProxyResultV2> => {
  const parsedEvent = {
    routeKey: event.requestContext.routeKey,
    connectionId: event.requestContext.connectionId,
  };

  // Here you can handle the disconnection logic if needed
  //
  // For example, you might want to clean up any resources associated with the connectionId
  //
  //
  //

  return {
    statusCode: 200,
  };
};
