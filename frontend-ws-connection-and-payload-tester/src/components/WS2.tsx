"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import parseJson from "parse-json";
const ReactJsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

const isValidJson = (str: string): boolean => {
  try {
    parseJson(str);
    return true;
  } catch (e) {
    return false;
  }
};

function isValidURL(str: string) {
  try {
    new URL(str); // Throws if the URL is invalid
    return true;
  } catch (e) {
    return false;
  }
}

interface Props {
  initialConnectionURL: string;
}

const WS2 = ({ initialConnectionURL }: Props) => {
  const [initialComponentLoad, setInitialComponentLoad] = useState(true);
  const [wsUrl, setWsUrl] = useState(initialConnectionURL);
  const [URLisValid, setURLisValid] = useState(false);
  const [payload, setPayload] = useState("");
  const [validPayload, setValidPayload] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);

  useEffect(() => {
    if (isValidURL(wsUrl)) {
      setURLisValid(true);
    } else {
      setURLisValid(false);
    }
  }, [wsUrl]);

  // Check for scrollbar in textarea
  useEffect(() => {
    const checkScrollbar = () => {
      if (textareaRef.current) {
        const { scrollHeight, clientHeight } = textareaRef.current;
        setHasScrollbar(scrollHeight > clientHeight);
      }
    };

    checkScrollbar();
    window.addEventListener("resize", checkScrollbar);

    return () => {
      window.removeEventListener("resize", checkScrollbar);
    };
  }, []);

  useEffect(() => {
    if (isValidJson(payload)) {
      setValidPayload(true);
    } else {
      setValidPayload(false);
    }
  }, [payload]);

  useEffect(() => {}, [ws]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const handleIconClick = useCallback(() => {
    if (ws) {
      ws.send(payload);
    }
  }, [ws, payload]);

  // disconnect from WebSocket on component on button click
  const disconnectWebSocket = useCallback(() => {
    setWs(null);
    setPayload("");
    setLoadingConnection(false);

    if (!ws) {
      setMessages((prev) => [...prev, { failedConnectionEvent: true }]);
      return;
    } // Prevents multiple calls when already disconnected

    ws.onclose = null; // Prevent triggering onclose event callback again
    ws.close();

    setMessages((prev) => [...prev, { disconnectionEvent: true }]);
  }, [ws]);

  // connect to WebSocket on component on button click
  const connectWebSocket = useCallback(() => {
    if (loadingConnection) return;

    setLoadingConnection(true);

    if (ws) {
      ws.close();
    }

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setWs(socket);
      setLoadingConnection(false);
      setMessages((prev) => [...prev, { connectionEvent: true }]);
      setPayload(`{
  "action": "customAction",
  "message": "your message here"
}`);
    };

    socket.onmessage = (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.onclose = () => {
      disconnectWebSocket();
    };
  }, [wsUrl, disconnectWebSocket, loadingConnection]);

  // on initial page load, connect to WebSocket if initialConnectionURL is provided
  useEffect(() => {
    if (initialComponentLoad && initialConnectionURL) {
      setInitialComponentLoad(false);
      connectWebSocket();
    }
  }, [initialComponentLoad, initialConnectionURL, connectWebSocket]);

  return (
    <div className="h-full flex-1">
      <div className="h-full flex flex-col gap-3">
        {/* WebSocket URL Input */}
        <div className="h-9 w-full flex gap-3">
          {!ws ? (
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://"
              className={`${
                loadingConnection && "animate-pulse"
              } text-white/70 h-full w-full bg-white/10 p-3 outline-none text-sm rounded-md`}
              disabled={!!ws}
            />
          ) : (
            <div
              className={`text-green-600 h-full w-full bg-white/10 p-3 outline-none text-sm rounded-md pointer-events-none`}
            >
              <p className="line-clamp-1 -translate-y-1 select-none">{wsUrl}</p>
            </div>
          )}
          <button
            className={`${
              loadingConnection || !wsUrl || !URLisValid
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : `${
                    !ws
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-red-700 hover:bg-red-600"
                  } cursor-pointer`
            } rounded-md w-32 text-xs duration-75 hover:duration-100 ease-in hover:ease-out`}
            onClick={() => (!ws ? connectWebSocket() : disconnectWebSocket())}
            disabled={loadingConnection || !wsUrl || !URLisValid}
          >
            {!ws ? "Connect" : "Disconnect"}
          </button>
        </div>

        {/* Payload Input */}
        <p className="ml-1.5 text-sm">Send Payload:</p>
        <div className="flex-1/4 h-full w-full bg-white/10 rounded-lg overflow-hidden scheme-dark relative">
          <textarea
            ref={textareaRef}
            value={loadingConnection || !ws ? "" : payload}
            onChange={(e) => {
              setPayload(e.target.value);
              const { scrollHeight, clientHeight } = textareaRef.current!;
              setHasScrollbar(scrollHeight > clientHeight);
            }}
            className="h-full w-full bg-transparent p-3 outline-none resize-none text-xs relative overflow-y-auto"
            placeholder={
              !ws || loadingConnection
                ? "You must establish a websocket connection first..."
                : "Enter your JSON payload here..."
            }
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            disabled={!ws || loadingConnection}
          />
          <div
            className={`absolute bottom-1.5 transition-all duration-100`}
            style={{ right: hasScrollbar ? "23px" : "10px" }}
          >
            <div
              className={`${
                validPayload
                  ? "opacity-100 duration-100 ease-in pointer-events-auto"
                  : "opacity-0 duration-200 ease-out pointer-events-none"
              } bottom-1.5 transition-all `}
            >
              <i
                onClick={handleIconClick}
                className="fa-solid fa-paper-plane text-white/30 transition-colors hover:text-blue-400 duration-75 hover:duration-100 ease-in hover:ease-out cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Messages Display */}
        <p className="ml-1.5 text-sm">Messages:</p>
        <div className="flex-1/2 h-full w-full bg-white/10 rounded-lg overflow-hidden scheme-dark">
          <div
            ref={messagesRef}
            className="h-full w-full overflow-y-auto p-3 flex flex-col gap-2"
          >
            {messages.map((msg, index) => (
              <div key={index} className="text-xs">
                {msg.connectionEvent ||
                msg.disconnectionEvent ||
                msg.failedConnectionEvent ? (
                  <div
                    className={`
                    ${msg.connectionEvent ? "text-green-600" : "text-red-600"}
                  `}
                  >
                    {msg.connectionEvent
                      ? "Connected to WebSocket"
                      : msg.disconnectionEvent
                      ? "Disconnected from WebSocket"
                      : "Failed to connect to WebSocket"}
                  </div>
                ) : (
                  <ReactJsonView
                    theme={"ocean"}
                    collapsed={0}
                    enableClipboard={false}
                    style={{ backgroundColor: "transparent" }}
                    src={{ ...msg }}
                    name={null}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WS2;
