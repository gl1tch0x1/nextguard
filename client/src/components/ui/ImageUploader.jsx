import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Check, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { processAndUploadImage, formatBytes, parseGoogleDriveUrl } from '../../lib/imageOptimization.js';

export default function ImageUploader({
  value = '',
  onChange,
  label = 'Asset Image',
  description = 'Supports PNG, JPG, WebP from local filesystem or Google Drive sharing link.',
  required = false
}) {
  const [mode, setMode] = useState('local'); // 'local' | 'gdrive'
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setTelemetry(null);

    try {
      const result = await processAndUploadImage({
        file,
        name: file.name.replace(/\.[^/.]+$/, '')
      });

      if (onChange) {
        onChange(result.url);
      }

      setTelemetry({
        originalSize: result.originalSize,
        webpSize: result.size,
        savingsPercent: result.savingsPercent,
        format: 'webp',
        width: result.width,
        height: result.height
      });
    } catch (err) {
      setError(err.message || 'Failed to convert and upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDriveUrlSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!driveUrlInput.trim()) return;

    setError('');
    setUploading(true);
    setTelemetry(null);

    try {
      const result = await processAndUploadImage({
        url: driveUrlInput.trim(),
        name: 'gdrive_asset'
      });

      if (onChange) {
        onChange(result.url);
      }

      setTelemetry({
        format: 'webp',
        isGoogleDrive: true,
        size: result.size || null
      });
      setDriveUrlInput('');
    } catch (err) {
      setError(err.message || 'Invalid Google Drive link or unable to fetch.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (onChange) onChange('');
    setTelemetry(null);
    setError('');
  };

  return (
    <div className="space-y-2 text-left">
      {/* Label and Info */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase flex items-center space-x-1.5">
          <ImageIcon size={13} className="text-cyan-400" />
          <span>{label} {required && <span className="text-rose-400">*</span>}</span>
        </label>
        {value && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
            <CheckCircle2 size={11} />
            <span>WEBP STREAMING ACTIVE</span>
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-400 font-sans leading-relaxed">{description}</p>
      )}

      {/* Current Image Preview (if present) */}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950/90 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all">
          <div className="relative aspect-video max-h-56 w-full flex items-center justify-center bg-black/40 overflow-hidden">
            <img
              src={value}
              alt="Uploaded Asset"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            
            {/* Top-Right Action Controls */}
            <div className="absolute top-2 right-2 flex items-center space-x-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded border border-slate-700/60 transition-colors"
                title="View full resolution in new tab"
              >
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-500/40 transition-colors"
                title="Remove image"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Bottom-Left Optimization Telemetry Badge */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <Sparkles size={11} className="text-cyan-400" />
              <span>FORMAT: .WEBP</span>
              {telemetry?.savingsPercent ? (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400">-{telemetry.savingsPercent}% COMPRESSED</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Choice between Local Browse or Google Drive */
        <div className="rounded-lg border border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/40 transition-all p-3.5 space-y-3">
          {/* Tab Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950/60 border border-slate-800 rounded-md">
            <button
              type="button"
              onClick={() => setMode('local')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded text-xs font-mono transition-all ${
                mode === 'local'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive size={13} />
              <span>Browse Local File</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('gdrive')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded text-xs font-mono transition-all ${
                mode === 'gdrive'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon size={13} />
              <span>Google Drive Link</span>
            </button>
          </div>

          {/* Mode 1: Local File Browse */}
          {mode === 'local' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-6 px-4 cursor-pointer hover:bg-cyan-950/20 rounded-md border border-slate-800/80 hover:border-cyan-500/30 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/bmp, image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="p-3 bg-cyan-950/50 group-hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 rounded-full mb-2 transition-transform group-hover:scale-105">
                <UploadCloud size={20} />
              </div>
              <p className="text-xs font-medium text-slate-200">
                {uploading ? 'Compressing & Converting to .webp...' : 'Click to browse or drop image here'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Auto-converts all images into ultra-compact, high-speed <b className="text-cyan-400">.webp</b>
              </p>
            </div>
          )}

          {/* Mode 2: Google Drive URL Input */}
          {mode === 'gdrive' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                    value={driveUrlInput}
                    onChange={(e) => setDriveUrlInput(e.target.value)}
                    disabled={uploading}
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDriveUrlSubmit}
                  disabled={uploading || !driveUrlInput.trim()}
                  className="px-3 py-2 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 disabled:opacity-50 text-xs font-mono rounded font-medium transition-all"
                >
                  {uploading ? 'Processing...' : 'Link WebP'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Supports sharing links from Google Drive; automatically parses file ID and resolves direct streamable WebP.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
