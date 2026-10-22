import sharp from "sharp";
import { published, settings } from "../../lib/content";
import { xml } from "../../lib/discovery";
export function getStaticPaths() {
  return [
    {
      params: { slug: "mostpomocy" },
      props: { title: "O pomaganiu. Po ludzku.", topic: "WIEDZA, KTÓRA ŁĄCZY" },
    },
    ...published().map((post) => ({
      params: { slug: post.slug },
      props: {
        title: post.title,
        topic:
          post.scope === "sosnowiec"
            ? "SOSNOWIEC · MOSTPOMOCY"
            : "CZYTELNIA · MOSTPOMOCY",
      },
    })),
  ];
}
export async function GET({
  props,
}: {
  props: { title: string; topic: string };
}) {
  const words = props.title.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).length > 34 && line) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#faf8f2"/><rect x="0" y="0" width="20" height="630" fill="#174d3e"/><circle cx="1130" cy="60" r="240" fill="#e1e9dd"/><path d="M1010 75Q1070 5 1130 75M1010 75V100M1130 75V100M1070 40V95" fill="none" stroke="#174d3e" stroke-width="8"/><text x="70" y="78" fill="#496b55" font-family="sans-serif" font-weight="bold" font-size="22">${xml(props.topic)}</text>${lines
    .slice(0, 5)
    .map(
      (l, i) =>
        `<text x="70" y="${225 + i * 65}" fill="#163f35" font-family="Georgia,serif" font-size="56">${xml(l)}</text>`,
    )
    .join(
      "",
    )}<line x1="70" y1="535" x2="1130" y2="535" stroke="#bdcabc"/><text x="70" y="585" fill="#163f35" font-family="sans-serif" font-weight="bold" font-size="26">mostpomocy.pl</text><text x="1130" y="585" text-anchor="end" fill="#496b55" font-family="sans-serif" font-size="25">${xml(settings().author_name)}</text></svg>`;
  return new Response(
    new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer()),
    { headers: { "Content-Type": "image/png" } },
  );
}
