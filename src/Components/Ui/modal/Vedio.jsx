// Components/Ui/modal/Vedio.jsx
import React, { useRef, useState } from 'react';
import styles from '../../../Styles/components/vedioPlayer.module.css';

const EnhancedVideoShowcase = ({ showCaseData }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  // Debug log to see what we're getting
  console.log('EnhancedVideoShowcase received:', {
    showCaseData,
    hasUrl: showCaseData?.url,
    fullUrl: showCaseData?.url ? `http://localhost:1337${showCaseData.url}` : 'none'
  });

  // Construct URLs - Use same API_BASE_URL as your SingleProperty component
  const API_BASE_URL = 'http://localhost:1337';
  
  // If no video data, show placeholder
  if (!showCaseData || !showCaseData.url) {
    return (
      <div className={styles.noVideoContainer}>
        <div className={styles.videoPlaceholder}>
          <div className={styles.placeholderIcon}>📹</div>
          <p className={styles.placeholderText}>No showcase video available</p>
          <p className={styles.placeholderSubtext}>
            This property doesn't have a virtual tour yet
          </p>
        </div>
      </div>
    );
  }

  // Construct video URL
  const videoUrl = showCaseData.url.startsWith('http') 
    ? showCaseData.url 
    : `${API_BASE_URL}${showCaseData.url}`;
  
  console.log('Video URL constructed:', videoUrl);

  // Video error handling
  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setError('Failed to load video. The file may be corrupted or the URL is incorrect.');
  };

  // Video control functions
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Play failed:', err);
        setError('Cannot play video. Please check your internet connection.');
      });
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  return (
    <div className={styles.videoContainer}>
      {/* Video Header */}
      <div className={styles.videoHeader}>
        <h3 className={styles.videoTitle}>
          Virtual Tour {showCaseData.alternativeText && `- ${showCaseData.alternativeText}`}
        </h3>
        <button 
          className={styles.toggleControlsBtn}
          onClick={toggleControls}
          type="button"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* Video Player */}
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.videoElement}
          controls={false}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          onClick={handleVideoClick}
          onError={handleVideoError}
          onLoadedMetadata={handleLoadedMetadata}
          crossOrigin="anonymous"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          <source src={videoUrl.replace('.mp4', '.ogg')} type="video/ogg" />
          Your browser does not support HTML5 video.
        </video>

        {/* Play/Pause Overlay Button */}
        {!isPlaying && !error && (
          <button 
            className={styles.playOverlayBtn}
            onClick={togglePlay}
            type="button"
            aria-label="Play video"
          >
            ▶️
          </button>
        )}

        {/* Loading indicator */}
        {!duration && !error && (
          <div className={styles.loadingIndicator}>
            Loading video...
          </div>
        )}
      </div>

      {/* Custom Video Controls */}
      {showControls && !error && (
        <div className={styles.customControls}>
          {/* Play/Pause Button */}
          <button 
            className={styles.controlBtn}
            onClick={togglePlay}
            type="button"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Time Controls */}
          <div className={styles.timeSection}>
            <span className={styles.timeText}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={styles.seekSlider}
              disabled={!duration}
            />
            <span className={styles.timeText}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Controls */}
          <div className={styles.volumeSection}>
            <span className={styles.volumeIcon}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
            <span className={styles.volumeText}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Playback Speed */}
          <div className={styles.speedSection}>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                className={`${styles.speedBtn} ${playbackRate === speed ? styles.activeSpeed : ''}`}
                onClick={() => handlePlaybackRateChange(speed)}
                type="button"
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Stats */}
      <div className={styles.videoStats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Status:</span>
            <span className={styles.statValue}>
              {error ? 'Error' : isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Speed:</span>
            <span className={styles.statValue}>{playbackRate}x</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Volume:</span>
            <span className={styles.statValue}>{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoShowcase;