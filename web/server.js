const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001; // Change to 3001 to avoid conflicts if 3000 is used
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a private room for user-specific events
    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    // Chat room for trainer-client pair
    socket.on("join_chat", (conversationId) => {
      socket.join(`chat_${conversationId}`);
    });

    socket.on("send_message", (data) => {
      // Broadcast to the chat room
      io.to(`chat_${data.conversationId}`).emit("receive_message", data);
      
      // Send notification to the receiver's personal room
      io.to(`user_${data.receiverId}`).emit("notification", {
        type: "NEW_MESSAGE",
        message: "You have a new message"
      });
    });

    // Handle server-side emissions (from Server Actions)
    socket.on("server_emit_notification", (data) => {
      if (data.userId) {
        io.to(`user_${data.userId}`).emit("notification", data);
        console.log(`Forwarded notification to user_${data.userId}`);
      }
    });

    socket.on("typing", (data) => {
      socket.to(`chat_${data.conversationId}`).emit("user_typing", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
