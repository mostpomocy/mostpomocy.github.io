import { settings, discoverable, siteURL } from "../lib/discovery";
export function GET() {
  const config = settings();
  const text =
    config.allow_ai_search && config.allow_indexing
      ? `# ${config.title}\n\n> ${config.description}\n\nAutorski serwis edukacyjny o pracy socjalnej i wsparciu. Lokalne informacje dotyczą Sosnowca. Artykuły nie zastępują indywidualnej porady ani potwierdzenia warunków pomocy w instytucji.\n\n## Publiczne materiały\n` +
        discoverable()
          .map((p) => `- [${p.path}](${siteURL(p.path)})`)
          .join("\n") +
        "\n"
      : "# MostPomocy\n\nSpis dla narzędzi AI został wyłączony.\n";
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
