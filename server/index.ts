import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import devicesRouter from "./routes/devices";
import accountsRouter from "./routes/accounts";

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.SERVER_PORT || 2400;

app.use("/api/devices", devicesRouter);
app.use("/api/accounts", accountsRouter);

io.on("connection", (socket) => {
    console.log("a user connected");
});


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`)
})

export default app;