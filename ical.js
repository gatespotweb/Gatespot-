export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const ICAL_URL = 'https://www.airbnb.com/calendar/ical/1518812605367217724.ics?t=5e99f75c9cc24939b0b04e32f01c671c&locale=fr';

  try {
    const response = await fetch(ICAL_URL);
    if (!response.ok) throw new Error('Erreur fetch iCal');
    const icsText = await response.text();

    const events = [];
    const eventBlocks = icsText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    for (const block of eventBlocks) {
      const dtstart = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/)?.[1];
      const dtend   = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/)?.[1];

      if (dtstart && dtend) {
        const start = `${dtstart.slice(0,4)}-${dtstart.slice(4,6)}-${dtstart.slice(6,8)}`;
        const end   = `${dtend.slice(0,4)}-${dtend.slice(4,6)}-${dtend.slice(6,8)}`;
        const current = new Date(start);
        const endDate = new Date(end);
        while (current < endDate) {
          events.push(current.toISOString().slice(0, 10));
          current.setDate(current.getDate() + 1);
        }
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({ bookedDates: events });

  } catch (err) {
    res.status(500).json({ error: err.message, bookedDates: [] });
  }
}
