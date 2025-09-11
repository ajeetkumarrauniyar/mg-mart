import app from "./src/app.js";

const start = (): void => {
  try {
    const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    const host: string = process.env.HOST || "0.0.0.0";
    const env = process.env.NODE_ENV || "development";

    app.listen(port, host, () => {
      // eslint-disable-next-line no-console
      console.log(
        `🚀 Server listening on ${host}:${port} in 📍${env.toUpperCase()} mode at ⏰ ${new Date().toLocaleTimeString()}`
      );
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

start();
