import { useEffect, useState } from "react";
import "./App.css";
import Song from "./Song/Song";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogInPage, setIsLogInPage] = useState(false);
  const [currentSong, setCurrentSong] = useState();
  const [currentLyrics, setCurrentLyrics] = useState();
  const [authUrl, setAuthUrl] = useState();
  const baseUrl = "https://radiant-meadow-01573.herokuapp.com";
  const fetchOptions = {
    method: "GET",
    mode: "cors",
    headers: {
      "Access-Control-Request-Private-Network": true,
    },
  };

  useEffect(() => {
    if (!currentSong && !isLogInPage) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [currentSong, isLogInPage]);

  useEffect(() => {
    const getAuthUrl = async () => {
      const response = await fetch(`${baseUrl}/login`, fetchOptions);

      const result = await response.text();
      setAuthUrl(result);
    };
    const getToken = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const response = await fetch(
        `${baseUrl}/access-token?code=${code}`,
        fetchOptions
      );
      const result = await response.json();
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
    };
    const getCurrentSong = async () => {
      const songResponse = await fetch(
        `${baseUrl}/current-song?token=${localStorage.getItem("access_token")}`,
        fetchOptions
      );

      const songResult = await songResponse.json();
      const artist = songResult.item.artists[0].name;
      const title = songResult.item.name;
      const lyricsResponse = await fetch(
        `${baseUrl}/lyrics?artist=${artist}&title=${title}`,
        fetchOptions
      );
      const lyricsResult = await lyricsResponse.text();
      setCurrentLyrics(JSON.parse(lyricsResult).lyrics);
      setCurrentSong(songResult);
    };
    //if we already have an access token then we can just get song info
    if (localStorage.access_token) {
      getCurrentSong();
    } else if (localStorage.refresh_token) {
      console.log("time to refresh token???", localStorage);
    }
    //otherwise if user has already authorized, then lets get the tokens
    else if (window.location.search.length) {
      getToken();
    } else {
      //otherwise get user to authorize
      getAuthUrl();
      setIsLogInPage(true);
    }
  }, []);

  return isLoading ? (
    <Loading />
  ) : isLogInPage ? (
    <LogIn authUrl={authUrl} />
  ) : (
    <>
      <Song song={currentSong} />
      <p className="current-lyrics">{currentLyrics}</p>
    </>
  );
}

function Loading() {
  return <div>loading...</div>;
}

function LogIn(props) {
  return <a href={props.authUrl}>Log in to Spotify to continue...</a>;
}

export default App;
