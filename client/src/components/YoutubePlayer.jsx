import { useMemo, useState } from "react";
import YouTube from "react-youtube";
import "./YoutubePlayer.css";

function YouTubePlayer() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [playlist, setPlaylist] = useState([]);

  const extractVideoId = (link) => {
    if (!link) return null;

    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/i,
      /youtu\.be\/([^?&]+)/i,
      /youtube\.com\/shorts\/([^?&]+)/i,
      /youtube\.com\/embed\/([^?&]+)/i,
    ];

    for (const p of patterns) {
      const match = link.match(p);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const currentIndex = useMemo(() => {
    return playlist.findIndex((item) => item.videoId === videoId);
  }, [playlist, videoId]);

  const handleAddToPlaylist = () => {
    const id = extractVideoId(url.trim());
    if (!id) {
      alert("Invalid YouTube link. Please paste a valid YouTube URL.");
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      url: url.trim(),
      videoId: id,
      title: `Video ${playlist.length + 1}`,
      addedAt: Date.now(),
    };

    setPlaylist((prev) => [...prev, newItem]);

    // auto start if nothing playing
    if (!videoId) setVideoId(id);

    setUrl("");
  };

  const handlePlay = () => {
    const id = extractVideoId(url.trim());
    if (!id) {
      alert("Invalid YouTube link.");
      return;
    }
    setVideoId(id);
  };

  const handlePlayFromList = (id) => setVideoId(id);

  const handleDelete = (itemId) => {
    setPlaylist((prev) => {
      const deletedItem = prev.find((x) => x.id === itemId);
      const nextList = prev.filter((x) => x.id !== itemId);

      // if deleting current, jump to first remaining
      if (deletedItem?.videoId === videoId) {
        setVideoId(nextList[0]?.videoId || "");
      }
      return nextList;
    });
  };

  // ✅ AUTO PLAY NEXT
  const handleEnd = () => {
    if (playlist.length === 0) return;
    if (currentIndex === -1) return;

    const nextItem = playlist[currentIndex + 1];
    if (nextItem) {
      setVideoId(nextItem.videoId);
    } else {
      // end of list behavior: loop back to first
      setVideoId(playlist[0]?.videoId || "");
      // if you want STOP instead:
      // setVideoId("");
    }
  };

  // small "TV" player sizing
  const playerOpts = {
    width: "500",  // matches your TV box width
    height: "280", // TV-style ratio inside 500px container
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="ytWrap">
      {/* Controls */}
      <div className="ytControls">
        <input
          className="ytInput"
          type="text"
          placeholder="Paste YouTube link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="ytBtn" onClick={handlePlay}>
          Play
        </button>
        <button className="ytBtn ytBtnPrimary" onClick={handleAddToPlaylist}>
          + Add
        </button>
      </div>

      {/* Main layout: TV + Playlist */}
      <div className="ytLayout">
        {/* TV box */}
        <div className="ytTV">
          <div className="ytTVHeader">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="ytTVTitle">Mini Player</span>
          </div>

          <div className="ytTVScreen">
            {videoId ? (
              <YouTube videoId={videoId} opts={playerOpts} onEnd={handleEnd} />
            ) : (
              <div className="ytEmpty">
                Add a link then press <b>Play</b> or <b>+ Add</b>.
              </div>
            )}
          </div>
        </div>

        {/* Tiny playlist (scrollable) */}
        <div className="ytListPanel">
          <div className="ytListHeader">
            <div className="ytListTitle">Playlist</div>
            <div className="ytListCount">{playlist.length}</div>
          </div>

          <div className="ytListScroll">
            {playlist.length === 0 ? (
              <div className="ytListEmpty">No videos yet.</div>
            ) : (
              playlist.map((item, index) => (
                <div
                  key={item.id}
                  className={`ytListItem ${item.videoId === videoId ? "active" : ""}`}
                >
                  <button
                    className="ytListPlay"
                    title="Play"
                    onClick={() => handlePlayFromList(item.videoId)}
                  >
                    ▶
                  </button>

                  <div className="ytListText">
                    <div className="ytListName">
                      {index + 1}. {item.title}
                    </div>
                    <div className="ytListUrl" title={item.url}>
                      {item.url}
                    </div>
                  </div>

                  <button
                    className="ytListDel"
                    title="Delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouTubePlayer;