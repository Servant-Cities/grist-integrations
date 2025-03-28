import Fastify from "fastify";
import path from "path";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

const fastify = Fastify();
fastify.register(fastifyCors, {
  origin: "*",
});

const widgetsDir = path.resolve("../widgets");

fastify.register(fastifyStatic, {
  root: widgetsDir,
  prefix: "/",
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: "0.0.0.0" });
    console.log("Server running at http://localhost:4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
