'use client';

import Image from 'next/image';
import { type CSSProperties, useEffect, useRef } from 'react';

import styles from './V2SpotlightMosaic.module.css';
import type { V2SpotlightSettings } from './v2-spotlight.settings';

interface BlobPoint {
  x: number;
  y: number;
}

interface BlobTarget extends BlobPoint {
  directionX: number;
  directionY: number;
}

const BLOB_FOLLOW_SPEEDS = [0.48, 0.2, 0.12];
const POINTER_STOP_THRESHOLD_MS = 80;

const UNSPLASH_IMAGE_BASE_URL = 'https://images.unsplash.com';
const UNSPLASH_IMAGE_PARAMS = '?auto=format&fit=crop&w=800&q=82';

const mosaicImages = [
  'photo-1720727226792-96093dc8cadb',
  'photo-1720727226811-44865cb31c23',
  'photo-1689268573450-e8506b8d31d9',
  'photo-1717501219402-4444fcef55e7',
  'photo-1715464881691-414b4028c0a0',
  'photo-1715464502545-090ee1dc122f',
  'photo-1714911463721-193701866e58',
  'photo-1715465115490-3048d08ca12b',
  'photo-1705973483661-552b4be318c6',
  'photo-1621974639426-4cbecbd347eb',
  'photo-1685871286419-58e4fc0de8e1',
  'photo-1674381553426-48184d934c4c',
  'photo-1674492959000-437090de3acc',
  'photo-1674488961498-352eef9e4ea6',
  'photo-1632516643720-e7f5d7d6ecc9',
  'photo-1665355307573-fdf3a2f79a83',
  'photo-1634186612805-06d3bd15376b',
  'photo-1634515870103-d741817c25b4',
  'photo-1618005182384-a83a8bd57fbe',
  'photo-1669295384050-a1d4357bd1d7',
  'photo-1604079628040-94301bb21b91',
  'photo-1620121692029-d088224ddc74',
  'photo-1567095761054-7a02e69e5c43',
  'photo-1618005198919-d3d4b5a92ead'
].map(
  (imageId) => `${UNSPLASH_IMAGE_BASE_URL}/${imageId}${UNSPLASH_IMAGE_PARAMS}`
);

export default function V2SpotlightMosaic({
  isEnabled,
  isSuppressed,
  isVisibleWhenIdle,
  settings
}: {
  isEnabled: boolean;
  isSuppressed: boolean;
  isVisibleWhenIdle: boolean;
  settings: V2SpotlightSettings;
}) {
  const idleTimeoutRef = useRef<number | null>(null);
  const isBlobInitializedRef = useRef(false);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const blobPointsRef = useRef<BlobPoint[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);
  const pointerTargetRef = useRef<BlobTarget>({
    directionX: 1,
    directionY: 0,
    x: 0,
    y: 0
  });

  useEffect(() => {
    const mosaic = mosaicRef.current;

    if (!mosaic) {
      return;
    }

    if (!isEnabled) {
      mosaic.classList.remove(styles.visible);
      isBlobInitializedRef.current = false;
      return;
    }

    let bounds = mosaic.getBoundingClientRect();

    const clearIdleHide = () => {
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };

    const hideSpotlight = () => {
      clearIdleHide();
      mosaic.classList.remove(styles.visible);
    };

    const scheduleSpotlightHide = () => {
      clearIdleHide();
      idleTimeoutRef.current = window.setTimeout(
        hideSpotlight,
        POINTER_STOP_THRESHOLD_MS + settings.idleHideDelay
      );
    };

    const positionBlob = () => {
      const target = pointerTargetRef.current;
      const perpendicularX = -target.directionY;
      const perpendicularY = target.directionX;
      const targets: BlobPoint[] = [
        { x: target.x, y: target.y },
        {
          x: target.x - target.directionX * settings.blobStretch,
          y: target.y - target.directionY * settings.blobStretch
        },
        {
          x:
            target.x -
            target.directionX * settings.blobStretch * 1.65 +
            perpendicularX * settings.blobStretch * 0.4,
          y:
            target.y -
            target.directionY * settings.blobStretch * 1.65 +
            perpendicularY * settings.blobStretch * 0.4
        }
      ];
      let remainingDistance = 0;

      blobPointsRef.current.forEach((point, index) => {
        const pointTarget = targets[index];
        const nextX =
          point.x + (pointTarget.x - point.x) * BLOB_FOLLOW_SPEEDS[index];
        const nextY =
          point.y + (pointTarget.y - point.y) * BLOB_FOLLOW_SPEEDS[index];

        remainingDistance +=
          Math.abs(pointTarget.x - nextX) + Math.abs(pointTarget.y - nextY);
        point.x = nextX;
        point.y = nextY;
      });

      const [lead, trail, tail] = blobPointsRef.current;

      mosaic.style.setProperty('--v2-spotlight-x', `${lead.x}px`);
      mosaic.style.setProperty('--v2-spotlight-y', `${lead.y}px`);
      mosaic.style.setProperty('--v2-spotlight-trail-x', `${trail.x}px`);
      mosaic.style.setProperty('--v2-spotlight-trail-y', `${trail.y}px`);
      mosaic.style.setProperty('--v2-spotlight-tail-x', `${tail.x}px`);
      mosaic.style.setProperty('--v2-spotlight-tail-y', `${tail.y}px`);

      if (remainingDistance > 0.5) {
        pointerFrameRef.current = window.requestAnimationFrame(positionBlob);
        return;
      }

      pointerFrameRef.current = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      const nextX = event.clientX - bounds.left;
      const nextY = event.clientY - bounds.top;
      const deltaX = nextX - pointerTargetRef.current.x;
      const deltaY = nextY - pointerTargetRef.current.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > 0.5) {
        pointerTargetRef.current.directionX = deltaX / distance;
        pointerTargetRef.current.directionY = deltaY / distance;
      }

      pointerTargetRef.current.x = nextX;
      pointerTargetRef.current.y = nextY;

      if (!isBlobInitializedRef.current) {
        blobPointsRef.current.forEach((point) => {
          point.x = nextX;
          point.y = nextY;
        });
        isBlobInitializedRef.current = true;
      }

      clearIdleHide();
      mosaic.classList.add(styles.visible);

      if (pointerFrameRef.current === null) {
        pointerFrameRef.current = window.requestAnimationFrame(positionBlob);
      }

      if (!isVisibleWhenIdle) {
        scheduleSpotlightHide();
      }
    };

    const handleResize = () => {
      bounds = mosaic.getBoundingClientRect();
    };

    if (isVisibleWhenIdle) {
      if (!isBlobInitializedRef.current) {
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        pointerTargetRef.current.x = centerX;
        pointerTargetRef.current.y = centerY;
        blobPointsRef.current.forEach((point) => {
          point.x = centerX;
          point.y = centerY;
        });
        isBlobInitializedRef.current = true;
      }

      mosaic.classList.add(styles.visible);

      if (pointerFrameRef.current === null) {
        pointerFrameRef.current = window.requestAnimationFrame(positionBlob);
      }
    } else if (isBlobInitializedRef.current) {
      scheduleSpotlightHide();
    }

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true
    });
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseleave', hideSpotlight);

    return () => {
      clearIdleHide();

      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', hideSpotlight);
    };
  }, [
    isEnabled,
    isVisibleWhenIdle,
    settings.blobStretch,
    settings.idleHideDelay
  ]);

  const spotlightStyle = {
    '--v2-spotlight-contrast': `${settings.contrast}%`,
    '--v2-spotlight-core': `${settings.revealCore}%`,
    '--v2-spotlight-fade-duration': `${settings.fadeDuration}ms`,
    '--v2-spotlight-gap': `${settings.gap}px`,
    '--v2-spotlight-radius': `${settings.radius}px`,
    '--v2-spotlight-saturation': `${settings.saturation}%`,
    '--v2-spotlight-tile-radius': `${settings.tileRadius}px`
  } as CSSProperties;

  return (
    <div
      ref={mosaicRef}
      aria-hidden='true'
      className={`${styles.root} ${isSuppressed ? styles.suppressed : ''}`}
      style={spotlightStyle}
    >
      {mosaicImages.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={styles.tile}
        >
          <Image
            alt=''
            className={styles.image}
            height={900}
            priority={index === 0}
            sizes='(max-width: 639px) 33vw, 17vw'
            src={image}
            width={1600}
          />
        </div>
      ))}
    </div>
  );
}
