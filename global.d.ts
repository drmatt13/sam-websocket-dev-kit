interface WebSocketEvent {
  headers?: {
    Host?: string;
    Origin?: string;
    Pragma?: string;
    "Cache-Control"?: string;
    "Accept-Encoding"?: string;
    "Accept-Language"?: string;
    "Sec-WebSocket-Extensions"?: string;
    "Sec-WebSocket-Key"?: string;
    "Sec-WebSocket-Version"?: string;
    "User-Agent"?: string;
    "X-Amzn-Trace-Id"?: string;
    "X-Forwarded-For"?: string;
    "X-Forwarded-Port"?: string;
    "X-Forwarded-Proto"?: string;
    "x-api-key"?: string;
    "x-restapi"?: string;
  };
  multiValueHeaders?: {
    Host?: string[];
    Origin?: string[];
    Pragma?: string[];
    "Cache-Control"?: string[];
    "Accept-Encoding"?: string[];
    "Accept-Language"?: string[];
    "Sec-WebSocket-Extensions"?: string[];
    "Sec-WebSocket-Key"?: string[];
    "Sec-WebSocket-Version"?: string[];
    "User-Agent"?: string[];
    "X-Amzn-Trace-Id"?: string[];
    "X-Forwarded-For"?: string[];
    "X-Forwarded-Port"?: string[];
    "X-Forwarded-Proto"?: string[];
    "x-api-key"?: string[];
    "x-restapi"?: string[];
  };
  requestContext: {
    routeKey: "$connect" | "$disconnect" | "$default" | "customAction"; // Includes custom routeKeys
    eventType: "CONNECT" | "DISCONNECT" | "MESSAGE"; // Type of event, all custom routes will be "MESSAGE"
    extendedRequestId?: string;
    requestTime?: string;
    messageDirection?: string;
    stage?: string;
    connectedAt?: number;
    requestTimeEpoch?: number;
    identity?: {
      userAgent?: string;
      sourceIp?: string;
    };
    requestId?: string;
    domainName?: string;
    connectionId: string;
    apiId?: string;

    // Fields specific to disconnect events
    disconnectStatusCode?: number;
    disconnectReason?: string;
  };
  body?: string; // Only exists for MESSAGE events
  isBase64Encoded: boolean;
}
