"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";

export default function ImageUploader() {
  const [images, setImages] = useState([]); // アップロードされた画像を保存
  const [photographer, setPhotographer] = useState(""); // 写真家の名前
  const [watermarkEnabled, setWatermarkEnabled] = useState(false); // 透かしのON/OFF
  const canvasRef = useRef(null); // Canvasの参照

  // 【画像を追加する関数です】
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file, // ファイルオブジェクトを保持
      photographer: photographer,
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // 【画像を削除する関数】
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 【透かしの適用ON/OFF】
  const toggleWatermark = () => {
    setWatermarkEnabled(!watermarkEnabled);
  };

  // 【1枚の画像をダウンロード】
  const downloadImage = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;

    img.onload = () => {
      // キャンバスのサイズを画像に合わせる
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      if (watermarkEnabled) {
        ctx.font = `${img.width * 0.02}px Arial`; // 画像の2%のフォントサイズ
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "right";
        ctx.fillText(image.photographer, img.width * 0.98, img.height * 0.98);
      }

      // 画像をダウンロード
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "watermarked_image.png";
      link.click();
    };
  };

  // 【複数枚の画像を一括ダウンロード】
  const downloadAllImages = () => {
    images.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image);
      }, index * 500); // 各画像を0.5秒ずつずらしてダウンロード
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📸 画像アップロード</h1>

      {/* 写真家の名前を入力するフォーム */}
      <input
        type="text"
        placeholder="写真家の名前を入力"
        value={photographer}
        onChange={(e) => setPhotographer(e.target.value)}
        className={styles.photographerInput}
      />

      {/* 画像選択ボタン */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className={styles.fileInput}
      />

      {/* 透かし適用ボタン */}
      <button onClick={toggleWatermark} className={styles.watermarkButton}>
        {watermarkEnabled ? "透かしを解除" : "透かしを適用"}
      </button>

      {/* 一括ダウンロードボタン */}
      {images.length > 0 && (
        <button onClick={downloadAllImages} className={styles.downloadAllButton}>
          すべてダウンロード
        </button>
      )}

      {/* 画像プレビュー */}
      <div className={styles.imagePreview}>
        {images.map((image, index) => (
          <div key={index} className={styles.imageContainer}>
            <img src={image.url} alt={`Uploaded ${index}`} className={styles.image} />
            {watermarkEnabled && (
              <span className={styles.photographerName}>{image.photographer}</span>
            )}
            <button onClick={() => removeImage(index)} className={styles.deleteButton}>×</button>
            <button onClick={() => downloadImage(image)} className={styles.downloadButton}>
              ⬇️
            </button>
          </div>
        ))}
      </div>

      {/* Canvas（見えない状態） */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
}
