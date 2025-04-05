import Fastify from "fastify";
import path from "path";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

const fastify = Fastify();

// Enable CORS for all origins
fastify.register(fastifyCors, {
  origin: "*",
});

const MAX_REDIRECTS = 5; // Maximum number of redirects to follow

// Function to fetch a URL and handle redirects
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
      redirect: "manual", // Do not follow redirects automatically
    });

    const contentType = response.headers.get("Content-Type") || "";
    // If it's an HTML page, check for redirects
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("Location");
      if (redirectUrl) {
        // Follow the redirect URL
        return fetchWithRedirects(redirectUrl, redirects + 1);
      } else {
        throw new Error('Redirect URL missing');
      }
    }

    // Return the body as text if it's not a redirect
    if (contentType.includes("text/html")) {
      return await response.text();
    } else {
      return url; // If the content is not HTML, return the URL as is
    }
  } catch (error) {
    throw new Error(`Error fetching URL: ${error.message}`);
  }
}

// Proxy route to handle fetching URLs
fastify.get("/proxy", async (request, reply) => {
  const { url } = request.query as { url: string };
  if (!url) {
    return reply.code(400).send("URL parameter is required");
  }

  try {
    const htmlContent = await fetchWithRedirects(url); // Fetch the content, handling redirects
    reply.type("text/html").send(htmlContent);
  } catch (error) {
    console.error("Error:", error.message);
    reply.code(500).send(`Failed to fetch URL: ${error.message}`);
  }
});

// Static file serving (for widgets, etc.)
const widgetsDir = path.resolve("../widgets");

fastify.register(fastifyStatic, {
  root: widgetsDir,
  prefix: "/",
});

// Start the server
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
