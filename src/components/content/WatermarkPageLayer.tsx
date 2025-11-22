import React, { useEffect } from 'react';
import { RenderPageProps } from '@react-pdf-viewer/core';
import { styled } from '@mui/material/styles';

// Styled components
const WatermarkOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  mix-blend-mode: multiply;
`;

const WatermarkTopLeft = styled('div')`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.6;
  color: #ff0000;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const WatermarkBottomRight = styled('div')`
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 12px;
  opacity: 0.6;
  color: #ff0000;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const WatermarkCenter = styled('div')`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 32px;
  font-weight: bold;
  opacity: 0.15;
  color: #ff0000;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  width: 100%;
  text-align: center;
`;

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

interface WatermarkPageLayerProps {
  renderPageProps: RenderPageProps;
  user?: User | null;
}

export const WatermarkPageLayer: React.FC<WatermarkPageLayerProps> = ({ renderPageProps, user }) => {
  useEffect(() => {
    // Mark the page rendered when the canvas and text layers are rendered
    if (renderPageProps.canvasLayerRendered && renderPageProps.textLayerRendered) {
      renderPageProps.markRendered(renderPageProps.pageIndex);
    }
  }, [renderPageProps.canvasLayerRendered, renderPageProps.textLayerRendered, renderPageProps.markRendered, renderPageProps.pageIndex]);

  // Fallback for debugging if user is null
  const displayUser = user || {
    email: 'preview@example.com',
    username: 'Preview User',
    attributes: { given_name: 'Preview', family_name: 'User' }
  };

  const userName = displayUser?.attributes?.given_name && displayUser?.attributes?.family_name
    ? `${displayUser.attributes.given_name} ${displayUser.attributes.family_name}`
    : displayUser?.email || displayUser?.username || 'User';
  const userEmail = displayUser?.email || displayUser?.username || '';

  return (
    <>
      {renderPageProps.canvasLayer.children}
      {renderPageProps.annotationLayer.children}
      {renderPageProps.textLayer.children}
      <WatermarkOverlay>
        <WatermarkTopLeft>{userName}</WatermarkTopLeft>
        <WatermarkBottomRight>{userEmail}</WatermarkBottomRight>
        <WatermarkCenter>{userEmail}</WatermarkCenter>
      </WatermarkOverlay>
    </>
  );
};
