const escape = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
const stamp = (value) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
export function eventCalendar(e) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MostPomocy//Wydarzenia//PL",
    "BEGIN:VEVENT",
    `UID:${e.id}@mostpomocy.pl`,
    `DTSTAMP:${stamp(e.updated_at || e.published_at || e.starts_at)}`,
    `DTSTART:${stamp(e.starts_at)}`,
    ...(e.ends_at ? [`DTEND:${stamp(e.ends_at)}`] : []),
    `SUMMARY:${escape(e.title)}`,
    `DESCRIPTION:${escape(e.excerpt)}`,
    `LOCATION:${escape(e.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // Fold at UTF-8 byte boundaries, preserving non-ASCII Polish characters.
  return (
    lines
      .map((line) => {
        let result = "",
          length = 0;
        for (const character of line) {
          const n = new TextEncoder().encode(character).length;
          if (length + n > 74) {
            result += "\r\n ";
            length = 1;
          }
          result += character;
          length += n;
        }
        return result;
      })
      .join("\r\n") + "\r\n"
  );
}
