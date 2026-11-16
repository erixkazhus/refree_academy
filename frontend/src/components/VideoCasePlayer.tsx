import React, { useEffect, useRef, useState } from 'react';
import { ShotClockIcon } from './CourtMotifs';

interface VideoCasePlayerProps {
  videoUrl: string | null;
  ruleReference: string;
  category: string;
}

export const VideoCasePlayer: React.FC<VideoCasePlayerProps> = ({
  videoUrl,
  ruleReference,
  category,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);

  useEffect(() => {
    setSpeed(1.0);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  };

  const handleSpeed = (nextSpeed: number) => {
    setSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="bg-[#1b1a15] border border-[#26251e] rounded-xl overflow-hidden text-white">
      {/* Replay Monitor Header */}
      <div className="px-4 py-2.5 bg-[#26251e] border-b border-[#3d3b31] flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono-clock uppercase tracking-wider text-[#e6e5e0]">
          <span className="w-2 h-2 rounded-full bg-[#f54e00] inline-block" />
          IRS Replay Monitor · {category}
        </span>
        <span className="text-[11px] font-mono-clock text-[#cfcdc4]">
          {ruleReference}
        </span>
      </div>

      <div className="relative bg-black aspect-video w-full overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            controls
            playsInline
            muted
            loop
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video playback.
          </video>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
            <span className="text-sm font-medium">No video clip attached yet</span>
            <span className="text-xs text-[#a09c92] mt-1">
              An Admin can upload an MP4/WebM foul clip for this rule in Admin Studio.
            </span>
          </div>
        )}
      </div>

      {/* Court Replay Controls */}
      <div className="p-4 bg-[#fafaf7] text-[#26251e] border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            disabled={!videoUrl}
            className="btn-primary !h-9 !px-4 !text-xs"
          >
            ↻ Replay Clip
          </button>
          <button
            type="button"
            onClick={() => handleSpeed(0.5)}
            disabled={!videoUrl}
            className={`filter-chip !py-1.5 !px-3.5 !text-xs ${speed === 0.5 ? 'filter-chip-active' : ''}`}
          >
            0.5x Slow-Mo
          </button>
          <button
            type="button"
            onClick={() => handleSpeed(1.0)}
            disabled={!videoUrl}
            className={`filter-chip !py-1.5 !px-3.5 !text-xs ${speed === 1.0 ? 'filter-chip-active' : ''}`}
          >
            1.0x Normal
          </button>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono-clock text-[#5a5852]">
          <ShotClockIcon className="text-[#26251e]" />
          Foul &amp; Violation Clip
        </span>
      </div>
    </div>
  );
};
