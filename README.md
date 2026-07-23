# 📡 Flipper Signal DB

A community-maintained database of Sub-GHz signal files (`.sub`) recorded with the [Flipper Zero](https://flipperzero.one/). Browse, download, and contribute signals through a clean static web interface — no backend required.

**Live site:** [og34.github.io/flipper-signal-db](https://og34.github.io/flipper-signal-db)

---

## Features

- 🔍 **Search** by signal name, frequency, or protocol
- 🏷️ **Filter** by category (garage doors, car keys, intercoms, weather stations, custom)
- 📥 **Download** `.sub` files directly from the browser
- 📬 **Contribute** new signals via Pull Request

---

## Repository Structure

```
flipper-signal-db/
├── index.html        # Single-page web app
├── signals.json      # Signal metadata (source of truth)
├── signals/          # Raw .sub files
│   ├── garage_door_433.sub
│   ├── car_keyfob_315.sub
│   ├── intercom_bell_433.sub
│   ├── acurite_weather_433.sub
│   └── custom_ism_868.sub
└── README.md
```

---

## Signal Categories

| Category | Key in JSON |
|---|---|
| Garage Doors | `garage_doors` |
| Car Keys | `car_keys` |
| Intercoms | `intercoms` |
| Weather Stations | `weather_stations` |
| Custom / Unknown | `custom` |

---

## signals.json Format

Each signal is an object in the top-level array:

```json
{
  "name":        "Generic Garage Door 433MHz",
  "frequency":   "433.92 MHz",
  "protocol":    "OOK",
  "description": "Common single-channel remote at 433 MHz.",
  "category":    "garage_doors",
  "region":      "eu",
  "contributor": "your_github_username",
  "filename":    "garage_door_433.sub"
}
```

| Field | Description |
|---|---|
| `name` | Short, human-readable signal name |
| `frequency` | e.g. `"433.92 MHz"` or `"315.00 MHz"` |
| `protocol` | e.g. `"OOK"`, `"Princeton"`, `"RAW"`, `"Acurite-609TXC"` |
| `description` | One or two sentences about what was captured and where |
| `category` | One of the category keys above |
| `region` | `"eu"` (433/868 MHz), `"us"` (315/433/915 MHz), or `"global"` |
| `contributor` | Your GitHub username |
| `filename` | Basename of the `.sub` file inside `signals/` |

### Regions & Frequencies

| Region | Common Frequencies | Key |
|---|---|---|
| 🇪🇺 Europe | 433.92 MHz, 868.35 MHz | `eu` |
| 🇺🇸 North America | 315 MHz, 433.92 MHz, 915 MHz | `us` |
| 📡 Global | Works in both regions | `global` |

---

## How to Contribute

### Option A — GitHub web UI (easiest)

1. [Fork this repository](https://github.com/og34/flipper-signal-db/fork).
2. Upload your `.sub` file to the `signals/` folder via the GitHub file editor.
3. Edit `signals.json` and append a new entry for your signal.
4. Open a Pull Request against `main`.

### Option B — Git CLI

```bash
git clone https://github.com/<YOUR_USERNAME>/flipper-signal-db.git
cd flipper-signal-db

# Copy your .sub file
cp ~/path/to/my_signal.sub signals/

# Edit signals.json to add your entry, then:
git add signals/my_signal.sub signals.json
git commit -m "feat: add My Signal 433MHz"
git push origin main
```

Then open a Pull Request on GitHub.

### Guidelines

- ✅ Include accurate frequency and protocol information.
- ✅ Use a descriptive `filename` (e.g. `brand_model_freq.sub`).
- ✅ Write a clear `description` — what device, what action, where captured.
- ❌ Do not submit signals for devices or frequencies you do not own or have explicit permission to capture.
- ❌ Do not submit rolling-code signals that could compromise real-world security systems.
- ❌ No personally identifiable information in signal files.

---

## Running Locally

Because the page fetches `signals.json` and `signals_files.json` via `fetch()`, you need a local HTTP server (not `file://`):

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# Then open http://localhost:8080
```

---

## Signal Synchronization & Validation

We use automated scripts to ensure that the site stays in sync and files are correctly mapped:

- `npm run sync-signals`: Scans the `signals/` directory and updates `signals_files.json` (the list of existing `.sub` files).
- `npm run validate-signals`: Performs full checks to ensure every signal has a valid metadata entry, no duplicate names/filenames exist, and all files are accounted for.

Before submitting a Pull Request, please run:
```bash
npm run sync-signals
npm run validate-signals
```

A GitHub Action will automatically run these validation checks on every Push and Pull Request to prevent broken configurations.

---

## Hosting on GitHub Pages

1. Go to **Settings → Pages** in your fork.
2. Set Source to **Deploy from a branch** → `main` → `/ (root)`.
3. Your site will be live at `https://<username>.github.io/flipper-signal-db`.

---

## Legal & Ethical Use

This database is provided for **educational and research purposes only**.  
Always comply with local radio frequency regulations (FCC, CE, OFCOM, etc.).  
Only transmit on frequencies you are licensed or legally permitted to use.  
The maintainers are not responsible for misuse of any files in this repository.

---

## License

[MIT](LICENSE) — contributions welcome!
