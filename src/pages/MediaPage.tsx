import React from 'react';
import { MediaGallery } from "../components/MediaGallery";

export const MediaPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">Upload, organize, and optimize your digital assets.</p>
        </div>
      </div>

      <div className="panel-glass">
        <MediaGallery />
      </div>
    </div>
  );
};

export default MediaPage;
