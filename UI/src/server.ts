import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getDynamicHomeRemedies } from "./lib/home-remedies";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data: https://tiles.openfreemap.org",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.googleapis.com https://maps.gstatic.com https://*.google.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://unpkg.com https://tiles.openfreemap.org https://*.openfreemap.org",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasestorage.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.google-analytics.com https://*.analytics.google.com wss://*.firebaseio.com https://lovable.dev https://*.lovable.dev https://nominatim.openstreetmap.org https://api.open-meteo.com https://air-quality-api.open-meteo.com https://api.groq.com https://tiles.openfreemap.org https://*.openfreemap.org",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev",
  ].join("; "),
};

function applySecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(key, value);
  }
  newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

async function handleAiRequest(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { prompt?: string; context?: any };
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 2000) : "";
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read GROQ_API_KEY from environment safely - NEVER exposed to frontend
    const groqApiKey = (process.env.GROQ_API_KEY || (env as any)?.GROQ_API_KEY || "").trim();

    if (!groqApiKey || groqApiKey === "gsk_your_groq_api_key_here") {
      const guidance = getDynamicHomeRemedies(
        prompt,
        body.context?.topic,
        body.context?.campus || "SRM Kattankulathur"
      );
      return new Response(
        JSON.stringify({
          text: guidance,
          model: "Syncare AI (Home Care Guidance)",
          isFallback: true,
          success: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Official Groq API request with llama-3.3-70b-versatile
    const systemPrompt = `You are Syncare AI, a supportive, student-focused health and wellness companion at SRM Kattankulathur.
You provide clear, practical, evidence-grounded lifestyle, sleep, hydration, mental relaxation, and environmental precautions for university students.
Rules:
- Keep advice concise, actionable, and encouraging (1-2 clear paragraphs or bullet points).
- Contextualize for student life in a warm tropical campus environment.
- Always include a brief note that you provide educational self-care guidance, not a clinical diagnosis or medical prescription.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User wellness context: ${JSON.stringify(body.context || {})}\n\nStudent question: ${prompt}` },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn("Groq API error, falling back to dynamic home remedies:", groqResponse.status, errText);
      const guidance = getDynamicHomeRemedies(
        prompt,
        body.context?.topic,
        body.context?.campus || "SRM Kattankulathur"
      );
      return new Response(
        JSON.stringify({
          text: guidance,
          model: "Syncare AI (Home Care Guidance)",
          isFallback: true,
          success: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = (await groqResponse.json()) as any;
    const aiText = data.choices?.[0]?.message?.content || "No response generated.";

    return new Response(
      JSON.stringify({
        text: aiText,
        model: data.model || "llama-3.3-70b-versatile",
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Error handling AI request:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error processing AI guidance." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Handle server-side AI endpoints securely without exposing GROQ_API_KEY
      if (url.pathname === "/api/ai") {
        const aiResponse = await handleAiRequest(request, env);
        return applySecurityHeaders(aiResponse);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      );
    }
  },
};
