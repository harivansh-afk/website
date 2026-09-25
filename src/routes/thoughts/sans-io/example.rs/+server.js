import request from "../request.rs?raw";

export const prerender = true;

export function GET() {
  return new Response(request, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
