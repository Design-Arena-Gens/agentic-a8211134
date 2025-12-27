'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setVideoUrl(null);
      setStatus('idle');
    } else {
      setStatusMessage('لطفاً فقط فایل تصویری انتخاب کنید');
      setStatus('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const generateVideo = async () => {
    if (!imageFile) {
      setStatusMessage('لطفاً ابتدا یک تصویر انتخاب کنید');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setStatusMessage('در حال ساخت ویدیو... این ممکن است چند دقیقه طول بکشد');
    setVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setStatus('success');
        setStatusMessage('ویدیو با موفقیت ساخته شد!');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'خطا در ساخت ویدیو');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('خطا در ارتباط با سرور');
      console.error('Error:', error);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImageFile(null);
    setPrompt('');
    setVideoUrl(null);
    setStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="container">
      <h1>🎬 ساخت ویدیو از عکس</h1>

      <div className="instructions">
        <p>📸 عکس خود را آپلود کنید و با هوش مصنوعی آن را به ویدیو تبدیل کنید</p>
        <p>می‌توانید توضیحات اضافی برای نحوه حرکت در ویدیو بنویسید</p>
      </div>

      <div
        className={`upload-section ${dragOver ? 'dragover' : ''}`}
        onClick={() => document.getElementById('fileInput')?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📤</div>
        <p>کلیک کنید یا عکس را اینجا بکشید</p>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {selectedImage && (
        <div className="preview-section">
          <h3>پیش‌نمایش تصویر:</h3>
          <img src={selectedImage} alt="Preview" className="preview-image" />
        </div>
      )}

      <div className="prompt-section">
        <label htmlFor="prompt">توضیحات حرکت (اختیاری):</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: دوربین آهسته به سمت راست حرکت کند، zoom out شود، حرکت سینمایی به جلو"
        />
      </div>

      <button
        className="generate-button"
        onClick={generateVideo}
        disabled={!selectedImage || status === 'processing'}
      >
        {status === 'processing' ? '⏳ در حال ساخت...' : '🎥 ساخت ویدیو'}
      </button>

      {status !== 'idle' && statusMessage && (
        <div className={`status-message ${status}`}>
          {statusMessage}
          {status === 'processing' && <div className="spinner"></div>}
        </div>
      )}

      {videoUrl && (
        <div className="result-section">
          <h3>✅ ویدیوی شما آماده است:</h3>
          <video
            src={videoUrl}
            controls
            className="result-video"
            autoPlay
            loop
          />
          <a
            href={videoUrl}
            download="generated-video.mp4"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 30px',
              background: '#28a745',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            💾 دانلود ویدیو
          </a>
        </div>
      )}

      {(selectedImage || videoUrl) && (
        <div style={{ textAlign: 'center' }}>
          <button className="clear-button" onClick={clearAll}>
            🔄 شروع مجدد
          </button>
        </div>
      )}
    </div>
  );
}
