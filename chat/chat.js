import express from "express";
import path from "path";

const __dirname = path.resolve();
const router = express.Router();

// 기존 라우트
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat/index.html"));
});

// 새로 추가된 라우트
router.get("/index2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat/index2.html"));
});

// 정적 파일 제공 설정
router.use("/css", express.static(path.join(__dirname, "chat/css")));
router.use("/js", express.static(path.join(__dirname, "chat/js")));

export default router;
