import { useState, useRef, useEffect, useCallback } from "react";

const VIEWPORT_SIZE = 260; // ukuran area crop yang ditampilkan ke user
const OUTPUT_SIZE = 320;   // resolusi akhir foto yang disimpan

export default function ImageCropper({ imageSrc, onConfirm, onCancel }) {
  const [naturalSize, setNaturalSize] = useState(null); // {width, height}
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);
  const imgRef = useRef(null);

  // Begitu gambar asli selesai dimuat, hitung skala minimum supaya
  // gambar selalu menutupi seluruh area lingkaran (tidak ada celah kosong)
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const min = VIEWPORT_SIZE / Math.min(img.width, img.height);
      setNaturalSize({ width: img.width, height: img.height });
      setMinScale(min);
      setScale(min);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const clampOffset = useCallback((x, y, currentScale) => {
    if (!naturalSize) return { x: 0, y: 0 };
    const scaledW = naturalSize.width * currentScale;
    const scaledH = naturalSize.height * currentScale;
    const maxX = Math.max(0, (scaledW - VIEWPORT_SIZE) / 2);
    const maxY = Math.max(0, (scaledH - VIEWPORT_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, [naturalSize]);

  function handleScaleChange(newScale) {
    setScale(newScale);
    setOffset((prev) => clampOffset(prev.x, prev.y, newScale));
  }

  function startDrag(clientX, clientY) {
    dragState.current = { startX: clientX, startY: clientY, origin: offset };
  }
  function moveDrag(clientX, clientY) {
    if (!dragState.current) return;
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    const next = {
      x: dragState.current.origin.x + dx,
      y: dragState.current.origin.y + dy,
    };
    setOffset(clampOffset(next.x, next.y, scale));
  }
  function endDrag() {
    dragState.current = null;
  }

  function handleConfirm() {
    if (!naturalSize) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;
    const drawW = naturalSize.width * scale * ratio;
    const drawH = naturalSize.height * scale * ratio;

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2 + offset.x * ratio, OUTPUT_SIZE / 2 + offset.y * ratio);
    ctx.drawImage(imgRef.current, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    onConfirm(canvas.toDataURL("image/jpeg", 0.88));
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(20,33,61,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: "1.5rem",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)", borderRadius: "var(--radius-card)",
          padding: "1.5rem", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "1.25rem", maxWidth: "340px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1rem", margin: 0, textAlign: "center" }}>Sesuaikan Foto</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0", textAlign: "center" }}>
            Geser untuk atur posisi, pakai slider untuk zoom
          </p>
        </div>

        <div
          style={{
            width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, borderRadius: "50%",
            overflow: "hidden", position: "relative",
            background: "var(--color-surface-muted)",
            cursor: "grab", touchAction: "none",
            border: "2px solid var(--color-border)",
          }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => { if (dragState.current) moveDrag(e.clientX, e.clientY); }}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={endDrag}
        >
          {naturalSize && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Pratinjau foto profil"
              draggable={false}
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: naturalSize.width * scale,
                height: naturalSize.height * scale,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        <input
          type="range"
          min={minScale}
          max={minScale * 3}
          step={minScale / 100}
          value={scale}
          onChange={(e) => handleScaleChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />

        <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
          <button onClick={onCancel} style={cancelBtnStyle}>Batal</button>
          <button onClick={handleConfirm} style={confirmBtnStyle}>Gunakan Foto Ini</button>
        </div>
      </div>
    </div>
  );
}

const cancelBtnStyle = {
  flex: 1, padding: "0.65rem", borderRadius: "var(--radius-control)",
  border: "1px solid var(--color-border)", background: "var(--color-surface)",
  color: "var(--color-text-secondary)", fontSize: "0.85rem", cursor: "pointer",
};

const confirmBtnStyle = {
  flex: 1, padding: "0.65rem", borderRadius: "var(--radius-control)",
  border: "none", background: "var(--color-primary)",
  color: "white", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
};
