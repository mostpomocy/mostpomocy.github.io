import { rows } from "../../lib/content";
import { visible } from "../../lib/schema.mjs";
import { eventCalendar } from "../../lib/calendar.mjs";
export function getStaticPaths() {
  return rows("events")
    .filter((e) => visible(e))
    .map((event) => ({ params: { id: event.id }, props: { event } }));
}
export function GET({ props }: any) {
  return new Response(eventCalendar(props.event), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
