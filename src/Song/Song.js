export default function Song(props) {
  if (!props.song) return;
  const { item: song } = props.song;
  const { name, album, artists } = song;
  const track = { name, link: song.external_urls.spotify };
  const albumObj = {
    name: album.name,
    link: album.external_urls.spotify,
    img: album.images[1].url,
  };

  return (
    <div className="current-song">
      <Album album={albumObj} />
      <div className="text-container">
        <a className="song-name" href={track.link}>
          {track.name}
        </a>
        <Artists artists={artists} />
      </div>
    </div>
  );
}

const Album = (props) => {
  return (
    <a className="album-container" href={props.album.link}>
      <img src={props.album.img} alt={props.album.name} />
    </a>
  );
};

const Artists = (props) => {
  return (
    <div className="artists-container">
      {props.artists.map((artist, i) => {
        return (
          <a key={i} href={artist.external_urls.spotify}>
            {artist.name}
          </a>
        );
      })}
    </div>
  );
};
