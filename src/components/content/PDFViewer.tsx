'use client';

import React, { useState, useEffect } from 'react';
import { Worker, Viewer, SpecialZoomLevel, RenderPageProps } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useIsMobile } from '@/hooks/useIsMobile';
import { WatermarkPageLayer } from './WatermarkPageLayer';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface User {
  id: string;
  email?: string;
  username?: string;
  attributes?: {
    given_name?: string;
    family_name?: string;
    [key: string]: unknown;
  };
}

interface PDFViewerProps {
  fileUrl: string;
  title?: string;
  onContentReady?: () => void;
  user?: User | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onContentReady, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isIOS } = useIsMobile();
  
  // Custom page renderer with watermarks
  const renderPage = (props: RenderPageProps): React.ReactElement => (
    <WatermarkPageLayer renderPageProps={props} user={user} />
  );
  
  // Create the default layout plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (_defaultTabs) => [], // Remove sidebar for cleaner look
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { 
            ZoomIn, ZoomOut, NumberOfPages, CurrentPageInput, 
            GoToNextPage, GoToPreviousPage, EnterFullScreen 
          } = slots;
          return (
            <>
              <div style={{ padding: '0px 2px', display: 'flex', alignItems: 'center' }}>
                <GoToPreviousPage />
                <CurrentPageInput /> / <NumberOfPages />
                <GoToNextPage />
              </div>
              <div style={{ padding: '0px 2px', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <ZoomOut />
                <ZoomIn />
                {!isIOS && <EnterFullScreen />}
              </div>
            </>
          );
        }}
      </Toolbar>
    ),
  });

  useEffect(() => {
    // Reset state when fileUrl changes
    setError(null);
    setLoading(true);
  }, [fileUrl]);

  const handleDocumentLoad = (): void => {
    setLoading(false);
    if (onContentReady) {
      onContentReady();
    }
  };


  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent): boolean => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      // Disable Ctrl+P (print) and Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
    };

    // Override window.print
    const originalPrint = window.print;
    window.print = () => {
      // Do nothing - printing is disabled
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.print = originalPrint;
    };
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        '& .rpv-core__viewer': {
          height: '100%',
          '--scale-factor': '1',
        },
        '& .rpv-core__page-layer': {
          userSelect: 'none !important',
        },
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: '#4c51bf' }} />
          <Typography variant="h6" color="text.secondary">
            Loading PDF document...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {!error && fileUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Box sx={{ height: '100%', width: '100%' }}>
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.ActualSize}
              plugins={[defaultLayoutPluginInstance]}
              onDocumentLoad={handleDocumentLoad}
              renderPage={renderPage}
            />
          </Box>
        </Worker>
      )}
    </Box>
  );
};

export default PDFViewer;