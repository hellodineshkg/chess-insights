# Chess Insights

A React-based web application that provides detailed insights into Lichess players, including profile statistics, recent games, historical rating trends, and in-depth game analysis.

---

## Features

### Dashboard

- **Player Search:** Search for any Lichess username.
- **Profile Summary:** Displays total games, wins, losses, draws, and most played opening.
- **Games Table:** View recent games with basic details.
- **Rating Graph:** Visualize the player's rating history over time with interactive charts.
- **Skeleton Loading:** Smooth UI with placeholders while fetching data.

### Game Detail Page

- **Chess Board Visualization:** Shows the board state and highlights the last move.
- **Move Navigation:** Step through moves using buttons or arrow keys.
- **Opening Analysis:** Detects the opening used and identifies deviations from standard theory.
- **Tactical Moments:** Highlights tactical moves such as inaccuracy, blunders, or excellent moves.
- **Error Handling:** Gracefully handles loading errors with retry options.
- **Skeleton Loading:** Placeholder UI for loading moves, tactics, and opening data.

---


## Technologies Used

- **React** – Frontend framework
- **Chart.js** – Interactive rating charts
- **Date-fns** – Date formatting for rating timeline
- **Lucide Icons** – Icons for UI elements
- **Lichess API** – Fetch user profile, rating history, and game data
- **CSS / Tailwind** – Styling and layout
- **NDJSON Parsing** – Handle Lichess game streams efficiently

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chess-insights.git
cd chess-insights
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:5173` in your browser.

---

## Usage

### Dashboard

1. Enter a Lichess username in the search bar.
2. View:
   - Profile statistics (games played, wins/losses, draws, most played opening)
   - Recent games in table format
   - Historical rating graph with time-based X-axis

### Game Detail

1. Click a game from the dashboard or select a sample game.
2. Explore:
   - Board visualization
   - Navigate moves with buttons or arrow keys
   - Analyze openings and deviations
   - Inspect tactical moments highlighted in the game
   - View full move list

---

## API Endpoints Used

- **User Profile:** `https://lichess.org/api/user/{username}`
- **Rating History:** `https://lichess.org/api/user/{username}/rating-history`
- **Recent Games (NDJSON):** `https://lichess.org/api/games/user/{username}?max=50&opening=true`
- **Opening Stats:** `https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz&player={username}`

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit (`git commit -m "Add some feature"`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

---

## License

MIT License

---

## Acknowledgements

- [Lichess API](https://lichess.org/api)
- [Chart.js](https://www.chartjs.org/)
- [React](https://reactjs.org/)
- [Date-fns](https://date-fns.org/)
- [Lucide Icons](https://lucide.dev/)

