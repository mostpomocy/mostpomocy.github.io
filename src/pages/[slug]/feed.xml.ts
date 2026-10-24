import { pages } from "../../lib/content";
import { pageFeed } from "../../lib/page-feed";
export function getStaticPaths() {
  return pages()
    .filter((page) => page.section !== "sosnowiec" && !page.noindex)
    .map((page) => ({ params: { slug: page.slug }, props: { page } }));
}
export function GET({ props }: any) {
  return pageFeed(props.page);
}
