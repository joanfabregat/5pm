export const dynamic = "force-static";

export function GET() {
  return Response.json({
    tag: process.env.NEXT_PUBLIC_GIT_TAG,
    commit: process.env.NEXT_PUBLIC_GIT_COMMIT,
  });
}
