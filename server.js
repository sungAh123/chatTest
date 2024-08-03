import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import chatRouter from "./chat/chat.js";

// 서버 포트
const app = express();
const PORT = 9998;
const httpServer = createServer(app);

/** 환경설정:상수 경로 설정 */
const __dirname = path.resolve();

/** 메인 라우터 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 정적 파일 제공 설정
app.use("/chat", express.static(path.join(__dirname, "chat")));

const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${PORT}`,
  },
});

// 시스템 시작
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
