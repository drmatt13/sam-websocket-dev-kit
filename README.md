# **sam-websocket-dev-kit**  

The **sam-websocket-dev-kit** is a development framework designed to streamline the testing and development of AWS WebSocket API Gateway integrations within the **AWS Serverless Application Model (SAM)**. Since AWS SAM lacks built-in tools for locally testing WebSocket API Gateway events, this project provides a **local WebSocket server** that mimics API Gateway’s behavior, allowing developers to build and debug WebSocket-based Lambda functions efficiently.  

## **Project Structure**  
The project consists of three separate but interconnected components:  
- **`/sam-app`** → Contains the AWS SAM framework and WebSocket API Gateway with Lambda functions.  
- **`/local-ws-server`** → A local WebSocket server that emulates API Gateway's behavior for real-time function testing.  
- **`/frontend-ws-connection-and-payload-tester`** → A frontend tool to test WebSocket connections and payloads for both local and live environments.  

## **Key Features**  

### **1. WebSocket API Gateway with AWS SAM**  
The project includes an **AWS SAM** template that sets up a WebSocket API Gateway with four routes:  
- **$connect** → Handles new WebSocket connections.  
- **$disconnect** → Handles client disconnections.  
- **$default** → Catches all unmatched routes.  
- **customAction** → Handles custom client-defined actions.  

Each route is backed by a **TypeScript Lambda function**, enabling structured and scalable serverless WebSocket interactions.  

### **2. Local WebSocket Server for Development**  
The **local WebSocket server** emulates API Gateway’s behavior, allowing developers to invoke Lambda functions as if they were running in AWS. This server:  
- Handles **WebSocket connections, disconnections, and custom actions** identically to API Gateway.  
- Invokes the corresponding TypeScript Lambda functions for **real-time local testing**.  
- Returns responses in the same format as AWS API Gateway WebSockets, ensuring **identical behavior** in local and live environments.  
- Can be configured via the **`.env.development`** file to set the active WebSocket port.  

### **3. Live-Reload & Seamless Local Development**  
- Uses **Nodemon with ts-node** to **watch for file changes** and automatically restart the WebSocket server when Lambda functions are updated.  
- Eliminates the need for repeated deployments when iterating on WebSocket logic.  

### **4. Dual Testing with Automated Connection Switching**  
The **frontend tester** allows developers to **connect to both local and live WebSocket environments simultaneously**, controlled via **environment variables**.  
- Developers can send WebSocket payloads and compare responses from **both local and deployed AWS versions** side by side.  
- Provides a clear way to validate Lambda function behavior before deployment.  

## **Getting Started**  

### **1. Set Up the AWS SAM Application**  
Navigate into the `sam-app` directory:  
```bash  
cd sam-app  
sam build  
sam deploy --guided  
```

Lambda functions are located in **`sam-app/src/...functions`**. Use **`sam sync`** to deploy updates without a full redeployment.  

### **2. Start the Local WebSocket Server**  
Navigate into `local-ws-server`:  
```bash  
cd ../local-ws-server  
npm install  
npm run dev  
```
Optionally, configure the **`.env.development`** file to set the WebSocket server port.  

### **3. Start the Frontend WebSocket Tester**  
Navigate into `frontend-ws-connection-and-payload-tester`:  
```bash  
cd ../frontend-ws-connection-and-payload-tester  
npm install  
```
Optionally, update **`.env.development`** to include WebSocket URLs for the deployed SAM app and local WebSocket server.  

### **4. Local Development Workflow**  
- Edit Lambda functions inside `sam-app/src/...functions`.  
- Immediately invoke them via the **local WebSocket server** without deploying to AWS.  
- Use `sam sync` to push changes to AWS when ready.  
- If you install npm packages for any Lambda function, also install them in `local-ws-server`, since it invokes the functions in its own environment.  

### **5. Adding New WebSocket Routes**  
- Define new WebSocket routes and corresponding Lambda functions in `sam-app`.  
- Follow the commented instructions in `local-ws-server/index.ts` to enable invocation of the new function.  

## **Use Case**  
This kit is ideal for **serverless developers** who need an efficient WebSocket development workflow. By eliminating the deployment cycle during development, it speeds up testing, debugging, and feature iteration for WebSocket API-based applications.  

## **Technology Stack**  
- **AWS SAM** for infrastructure as code  
- **TypeScript** for Lambda functions  
- **WebSocket API Gateway** for real-time communication  
- **Node.js & ts-node** for local WebSocket emulation  
- **Nodemon** for live-reloading Lambda functions  
- **Frontend WebSocket Tester** for validating API interactions  

## **Contributing**  
Contributions are welcome! Feel free to submit issues or pull requests to improve this project.  

## **License**  
This project is licensed under the MIT License.  

---  
This project effectively bridges the gap between local development and AWS WebSocket APIs, making serverless WebSocket development significantly more manageable. 🚀
