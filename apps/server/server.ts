import app from "./src/app";

const start = async (): Promise<void> => {
  try {
    const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    const host: string = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
    app.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
