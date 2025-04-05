import Fastify from "fastify";
import path from "path";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

const fastify = Fastify();

fastify.register(fastifyCors, {
  origin: "*",
});

const MAX_REDIRECTS = 5;

async function fetchWithRedirects(url: string, redirects = 0): Promise<string> {
  if (redirects >= MAX_REDIRECTS) {
    throw new Error('Too many redirects');
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      redirect: "manual",
    });

    const contentType = response.headers.get("Content-Type") || "";
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("Location");
      console.log("redirect ", url, "to : ", redirectUrl)
      if (redirectUrl) {
        return fetchWithRedirects(redirectUrl, redirects + 1);
      } else {
        throw new Error('Redirect URL missing');
      }
    }

    if (contentType.includes("text/html")) {
      return await response.text();
    } else {
      return url;
    }
  } catch (error) {
    throw new Error(`Error fetching URL: ${error.message}`);
  }
}

fastify.get("/proxy", async (request, reply) => {
  const { url } = request.query as { url: string };
  console.log("proxy requested for : ", url)
  if (!url) {
    return reply.code(400).send("URL parameter is required");
  }

  try {
    const htmlContent = await fetchWithRedirects(url);
    reply.type("text/html").send(htmlContent);
  } catch (error) {
    console.error("Error:", error.message);
    reply.code(500).send(`Failed to fetch URL: ${error.message}`);
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
