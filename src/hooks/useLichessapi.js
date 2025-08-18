import { useState } from "react";
import axios from "axios";

export function useLichessApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPlayer(username) {
    setLoading(true);
    setError(null);

    try {
      const profileRes = await axios.get(`https://lichess.org/api/user/${username}`);
      const gamesRes = await axios.get(
        `https://lichess.org/api/games/user/${username}`,
        {
          params: {
            max: 50,
            opening: true,
            analysed: true,
            moves: true,
            pgnInJson: true,
            format: "json",
          },
          headers: { Accept: "application/x-ndjson" },
        }
      );

      // Parse NDJSON response (each line = game JSON)
      const games = gamesRes.data
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));

      return { profile: profileRes.data, games };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { fetchPlayer, loading, error };
}
