import { useEffect, useState } from "react";
import "./App.css";
import Song from "./Song/Song";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogInPage, setIsLogInPage] = useState(false);
  const [currentSong, setCurrentSong] = useState();
  const [currentLyrics, setCurrentLyrics] = useState();
  const [authUrl, setAuthUrl] = useState();
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : "https://radiant-meadow-01573.herokuapp.com";
  const fetchOptions = {
    method: "GET",
    mode: "cors",
  };

  useEffect(() => {
    //set up use effect for below code to run when current song changes
    const getLyrics = async () => {
      const artist = currentSong.item.artists[0].name;
      const title = currentSong.item.name;
      const lyricsResponse = await fetch(
        `${baseUrl}/lyrics?artist=${artist}&title=${title}`,
        fetchOptions
      );
      const lyricsResult = await lyricsResponse.json();
      console.log("lyrics:", lyricsResult);
      setCurrentLyrics(lyricsResult.lyrics);
    };
    if (currentSong) getLyrics();
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong && !isLogInPage) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [currentSong, isLogInPage]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");

    const getAuthUrl = async () => {
      const response = await fetch(`${baseUrl}/login`, fetchOptions);

      const result = await response.text();
      setAuthUrl(result);
    };
    const refreshToken = async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      const response = await fetch(
        `${baseUrl}/refresh_token?refresh_token=${refreshToken}`,
        fetchOptions
      );
      const result = await response.json();
      localStorage.setItem("access_token", result.access_token);
      getCurrentSong();
    };
    const getToken = async (code) => {
      const response = await fetch(
        `${baseUrl}/access-token?code=${code}`,
        fetchOptions
      );
      window.history.replaceState({}, document.title, "/");

      const result = await response.json();
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      //now proceed with getting song

      getCurrentSong();
    };
    const getCurrentSong = async () => {
      const songResponse = await fetch(
        `${baseUrl}/current-song?token=${localStorage.getItem("access_token")}`,
        fetchOptions
      );

      const songResult = await songResponse.json();
      if (songResult.error) {
        if (songResult.error === "invalid or expired token") refreshToken();
      } else {
        setCurrentSong(songResult);
      }
    };
    //if we already have an access token then we can just get song info
    if (localStorage.access_token) {
      console.log("token");
      getCurrentSong();
    }
    //otherwise if user has already authorized, then lets get the tokens
    else if (window.location.search.length) {
      console.log("need tokens!");
      getToken(code);
    } else {
      console.log("let's get auth!");
      //otherwise get user to authorize
      getAuthUrl();
      setIsLogInPage(true);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
  };

  return isLoading ? (
    <Loading />
  ) : isLogInPage ? (
    <LogIn authUrl={authUrl} />
  ) : (
    <>
      <div className="header">
        <Song song={currentSong} />
        <a href="/" onClick={logout}>
          logout
        </a>
      </div>
      <Lyrics lyrics={currentLyrics} />
    </>
  );
}

function Loading() {
  return <div>loading...</div>;
}

function LogIn(props) {
  return <a href={props.authUrl}>Log in to Spotify to continue...</a>;
}

function Lyrics(props) {
  return props.lyrics ? (
    <p className="current-lyrics">{props.lyrics}</p>
  ) : (
    <p>loading...</p>
  );
}

export default App;
