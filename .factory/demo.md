# Demo sandbox

- URLs: `https://bills-due-board.sociobot.in/demo` and `https://bills-due-board.sociobot.in/?demo=1` (local: `http://localhost:5173/?demo=1`)
- The sample has six realistic bills: five planned and one paid. Their dates stay relative to the day the demo resets.
- Select **Reset demo** in the persistent banner to delete and reseed the sample.
- Select **Start for real** to open the separate, empty real board.
- Demo records use the browser database `demo:bills-due-board:v1`. Real records use `bills-due-board:v1`.
- Both databases encrypt the bill document with AES-GCM before writing it.
- The service worker includes the sample app shell, so the demo reloads offline after its first visit.
