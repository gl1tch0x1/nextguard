import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  ShieldCheck, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';

export default function PocImageManager({
  images = [],
  onChange,
  label = 'Proof-of-Concept (PoC) Visual Evidence & Screenshots',
  description = 'Add multiple step-by-step verification screenshots, architecture diagrams, or exploit payloads. Automatically converted to .webp.'
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImage, setNewImage] = useState({
    url: '',
    title: '',
    caption: ''
  });

  const handleAddImage = (e) => {
    if (e) e.preventDefault();
    if (!newImage.url) return;

    const updated = [
      ...images,
      {
        url: newImage.url,
        title: newImage.title.trim() || `PoC Evidence ${String(images.length + 1).padStart(2, '0')}`,
        caption: newImage.caption.trim()
      }
    ];

    if (onChange) onChange(updated);
    setNewImage({ url: '', title: '', caption: '' });
    setShowAddForm(false);
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    if (onChange) onChange(updated);
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    if (onChange) onChange(copy);
  };

  const handleUpdateItem = (index, field, value) => {
    const copy = [...images];
    copy[index] = { ...copy[index], [field]: value };
    if (onChange) onChange(copy);
  };

  return (
    <div className="space-y-3 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase flex items-center space-x-1.5">
            <Layers size={13} className="text-cyan-400" />
            <span>{label} ({images.length})</span>
          </label>
          {description && (
            <p className="text-xs text-slate-400 font-sans mt-0.5">{description}</p>
          )}
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-mono bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded transition-all shadow-sm"
          >
            <Plus size={13} />
            <span>Add PoC Screenshot</span>
          </button>
        )}
      </div>

      {/* Add New PoC Form Modal/Inline Card */}
      {showAddForm && (
        <div className="p-4 rounded-lg border border-cyan-500/40 bg-slate-950/95 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-300 font-medium flex items-center space-x-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              <span>New Proof-of-Concept Artifact (Figure {String(images.length + 1).padStart(2, '0')})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewImage({ url: '', title: '', caption: '' });
              }}
              className="text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <ImageUploader
            value={newImage.url}
            onChange={(url) => setNewImage((prev) => ({ ...prev, url }))}
            label="PoC Image (Local or Google Drive)"
            description="Auto-converts to WebP for lightning-fast gallery rendering."
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">
              Figure Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Figure 01: Reverse Shell Shellcode Injection"
              value={newImage.title}
              onChange={(e) => setNewImage((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded px-3 py-1.5 text-xs font-sans text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">
              Technical Description / Exploit Caption
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wireshark trace showing decrypted TLS 1.3 handshake with leaked ephemeral keys."
              value={newImage.caption}
              onChange={(e) => setNewImage((prev) => ({ ...prev, caption: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded px-3 py-1.5 text-xs font-sans text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={!newImage.url}
              onClick={handleAddImage}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-semibold text-xs font-mono rounded shadow transition-all"
            >
              Attach PoC Image
            </button>
          </div>
        </div>
      )}

      {/* List of Attached PoC Images */}
      {images.length > 0 ? (
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-12 rounded overflow-hidden bg-black/50 border border-slate-700/60 flex-shrink-0">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-0 right-0 bg-slate-950/80 text-[9px] font-mono text-cyan-400 px-1 py-0.2 rounded-tl">
                  WEBP
                </span>
              </div>

              {/* Title & Caption Editors */}
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  value={img.title || ''}
                  onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                  placeholder={`Figure ${String(idx + 1).padStart(2, '0')}`}
                  className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 text-xs font-mono text-slate-200 outline-none py-0.5"
                />
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={(e) => handleUpdateItem(idx, 'caption', e.target.value)}
                  placeholder="Add brief technical caption..."
                  className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 text-[11px] font-sans text-slate-400 outline-none py-0.5"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  type="button"
                  title="Move up"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                >
                  <ChevronDown size={14} />
                </button>
                <a
                  href={img.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Preview in new tab"
                  className="p-1 text-slate-400 hover:text-cyan-300"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  title="Delete image"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showAddForm && (
          <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
            <p className="text-xs font-mono text-slate-500">No Proof-of-Concept images attached yet.</p>
          </div>
        )
      )}
    </div>
  );
}
