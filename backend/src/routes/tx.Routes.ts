import { Router } from "express";
import { getTransactionStatus } from "../controllers/tx.Controller";
import { onPlatformEvent } from "../services/eventBus";

const router = Router();

router.get("/status/:txHash", getTransactionStatus);

router.get("/events/stream", (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (type: string, payload: unknown) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent("connected", { ok: true, timestamp: new Date().toISOString() });

  const unsubscribe = onPlatformEvent((event) => {
    sendEvent(event.type, event);
  });

  const keepAlive = setInterval(() => {
    sendEvent("heartbeat", { timestamp: new Date().toISOString() });
  }, 20000);

  _req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
    res.end();
  });
});

export default router;
