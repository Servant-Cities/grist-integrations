import Fastify from "fastify";
import path from "path";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

const fastify = Fastify();
fastify.register(fastifyCors, {
  origin: "*",
});

fastify.get("/proxy", async (request, reply) => {
  const { url } = request.query as { url: string };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      redirect: "follow", // Ensure redirects are followed
    });

    // Check if the response is HTML
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) {
      console.log("Non-HTML response received, returning URL instead.");
      return reply.send(url);  // Just return the URL if it's not HTML
    }

    const body = await response.text();
    
    // Log the body of the response for debugging purposes
    console.log("Received body:", body.substring(0, 500));  // Log the first 500 chars for inspection

    reply.type("text/html").send(body);
  } catch (error) {
    console.error("Error fetching URL:", error);
    reply.code(500).send("Failed to fetch URL");
  }
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
