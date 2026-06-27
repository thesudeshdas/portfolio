'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent
} from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import * as THREE from 'three';

import { cn } from '@/lib/utils';

import V2DevPanel from './V2DevPanel';
import V2LocationContentPanel from './V2LocationContentPanel';
import {
  createBorderLineSegments,
  disposeBorderLineSegments,
  getCountryBorderPaths,
  getDetailedBorderPaths
} from './v2-globe-borders';
import {
  DEFAULT_BORDER_COLOR,
  DEFAULT_GLOBE_COLOR,
  DEFAULT_OUTLINE_DETAIL,
  DEFAULT_ROTATION_SPEED,
  GLOBE_FADE_IN_MS,
  INDIA_HOVER_BORDER_COLOR,
  INDIA_HOVER_GLOBE_COLOR,
  INTRO_FLIGHT_MS,
  INTRO_START_ZOOM,
  INTRO_STATE_SYNC_MS,
  IS_DEV_PANEL_ENABLED,
  LOCATION_CALLOUT_CLOSE_MS,
  LOCATION_CONTENT_CLOSE_EVENT,
  LOCATION_CONTENT_REVEAL_MS,
  LOCATION_CONTENT_TRANSITION_MS,
  LOCATION_FOCUS_TRANSITION_MS,
  LOCATION_MARKER_ALTITUDE,
  LOCATION_MARKER_WHEEL_EVENT,
  LOCATION_MODAL_HEIGHT_RATIO,
  LOCATION_MODAL_RIGHT_OFFSET_RATIO,
  LOCATION_MODAL_WIDTH_RATIO,
  LOCATION_SELECT_EVENT,
  LOW_FPS_RENDER_PIXEL_RATIO,
  MADRID_VIEW,
  MAX_DISPLAY_ZOOM,
  MAX_OUTLINE_DETAIL,
  MAX_ROTATION_SPEED,
  MIN_DISPLAY_ZOOM,
  MIN_OUTLINE_DETAIL,
  MIN_ROTATION_SPEED,
  SKIP_INITIAL_TRANSITION_STORAGE_KEY,
  STAGE_THEME_TRANSITION_MS,
  TARGET_RENDER_PIXEL_RATIO,
  V2_COLOR_TOKENS
} from './v2-globe.constants';
import { V2_GLOBE_LOCATIONS, type V2GlobeLocation } from './v2-globe-locations';
import {
  createLocationMarkerElement,
  getLocationMarkerLineEndpoint,
  resetLocationMarkerState,
  updateLocationMarkerScale
} from './v2-location-marker';
import {
  clampLatitude,
  easeInOutCubic,
  getAltitudeFromDisplayZoom,
  getAltitudeFromZoom,
  getDisplayZoomFromAltitude,
  getIntroPointOfView,
  getInterpolatedHexColor,
  normalizeLongitude,
  setMaterialColor
} from './v2-globe-math';
import type {
  CountryBorderPath,
  DevPanelDragState,
  DevPanelPosition,
  GlobeDirection,
  GlobePointOfView,
  LocationMarkerWheelEvent,
  LocationSelectEvent,
  MapLinesGeoJson,
  RotationDirection,
  ScreenPoint,
  V2FlowControl,
  V2FlowStep
} from './v2-globe.types';

const Globe = dynamic<
  GlobeProps & { ref?: MutableRefObject<GlobeMethods | undefined> }
>(() => import('react-globe.gl'), { ssr: false });

function getLocationContentLayout(
  size: { width: number; height: number },
  anchor: ScreenPoint | null
) {
  const desiredModalWidth = Math.max(
    320,
    Math.min(
      1100,
      anchor?.calloutWidth ?? size.width * LOCATION_MODAL_WIDTH_RATIO
    )
  );
  const modalWidth = anchor
    ? anchor.calloutSide === 'left'
      ? Math.min(desiredModalWidth, Math.max(320, size.width - anchor.x - 24))
      : Math.min(desiredModalWidth, Math.max(320, anchor.x - 24))
    : desiredModalWidth;
  const modalHeight = Math.max(320, size.height * LOCATION_MODAL_HEIGHT_RATIO);
  const modalRightOffset = size.width * LOCATION_MODAL_RIGHT_OFFSET_RATIO;
  const fallbackLeft = Math.max(24, size.width - modalRightOffset - modalWidth);
  const modalLeft = anchor
    ? anchor.calloutSide === 'left'
      ? Math.max(24, Math.min(size.width - modalWidth - 24, anchor.x))
      : Math.max(
          24,
          Math.min(size.width - modalWidth - 24, anchor.x - modalWidth)
        )
    : fallbackLeft;
  const centeredTop = (size.height - modalHeight) / 2;
  const anchorTop = anchor ? anchor.y - modalHeight / 2 : centeredTop;
  const modalTop = Math.max(
    24,
    Math.min(size.height - modalHeight - 24, anchorTop)
  );
  const lineY = modalTop + modalHeight / 2;
  const lineStartX = anchor?.x ?? modalLeft;

  return {
    lineStartX,
    lineY,
    modalHeight,
    modalLeft,
    modalTop,
    modalWidth
  };
}

export default function V2Globe({
  activeStep,
  flowSteps = [],
  isActive,
  onStepChange
}: {
  activeStep?: V2FlowStep;
  flowSteps?: V2FlowControl[];
  isActive: boolean;
  onStepChange?: (step: V2FlowStep) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const introTimeoutsRef = useRef<number[]>([]);
  const introAnimationFrameRef = useRef<number | null>(null);
  const borderLineRef = useRef<THREE.LineSegments | null>(null);
  const borderLineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const isSecondStageRef = useRef(false);
  const themeAnimationFrameRef = useRef<number | null>(null);
  const themeProgressRef = useRef(0);
  const devPanelDragRef = useRef<DevPanelDragState | null>(null);
  const locationContentAnimationFrameRef = useRef<number | null>(null);
  const locationContentTimeoutRef = useRef<number | null>(null);
  const locationContentRevealTimeoutRef = useRef<number | null>(null);
  const isLocationContentClosingRef = useRef(false);
  const previousLocationPovRef = useRef<GlobePointOfView | null>(null);
  const currentPovRef = useRef<GlobePointOfView>({
    ...MADRID_VIEW,
    altitude: getAltitudeFromZoom(INTRO_START_ZOOM)
  });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [borderPaths, setBorderPaths] = useState<CountryBorderPath[]>([]);
  const [fps, setFps] = useState(0);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [isGlobeVisible, setIsGlobeVisible] = useState(false);
  const [currentPov, setCurrentPov] = useState<GlobePointOfView>(
    currentPovRef.current
  );
  const [outlineDetail, setOutlineDetail] = useState(DEFAULT_OUTLINE_DETAIL);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [rotationDirection, setRotationDirection] =
    useState<RotationDirection>('west');
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);
  const [devPanelPosition, setDevPanelPosition] =
    useState<DevPanelPosition | null>(null);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
  const [hasLoadedDevPreferences, setHasLoadedDevPreferences] = useState(
    !IS_DEV_PANEL_ENABLED
  );
  const [shouldSkipInitialTransition, setShouldSkipInitialTransition] =
    useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<V2GlobeLocation | null>(null);
  const [selectedLocationAnchor, setSelectedLocationAnchor] =
    useState<ScreenPoint | null>(null);
  const [locationContentProgress, setLocationContentProgress] = useState(0);
  const [isLocationContentVisible, setIsLocationContentVisible] =
    useState(false);

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: DEFAULT_GLOBE_COLOR
      }),
    []
  );
  const updatePointOfView = useCallback(
    (pov: GlobePointOfView, transitionMs = 0) => {
      currentPovRef.current = pov;
      setCurrentPov(pov);
      updateLocationMarkerScale(pov.altitude);
      globeRef.current?.pointOfView(pov, transitionMs);
    },
    []
  );
  const visibleBorderPaths = useMemo(
    () => getDetailedBorderPaths(borderPaths, outlineDetail),
    [borderPaths, outlineDetail]
  );
  const isSecondStage = getDisplayZoomFromAltitude(currentPov.altitude) >= 100;
  const locationMarkers = useMemo(
    () =>
      V2_GLOBE_LOCATIONS.map((location) => ({
        ...location,
        altitude: LOCATION_MARKER_ALTITUDE
      })),
    []
  );
  const visibleLocationMarkers = useMemo(
    () => (isSecondStage ? locationMarkers : []),
    [isSecondStage, locationMarkers]
  );
  const locationContentLayout = useMemo(
    () => getLocationContentLayout(size, selectedLocationAnchor),
    [selectedLocationAnchor, size]
  );
  const applyThemeProgress = useCallback(
    (progress: number) => {
      const nextGlobeColor = getInterpolatedHexColor(
        DEFAULT_GLOBE_COLOR,
        INDIA_HOVER_GLOBE_COLOR,
        progress
      );
      const nextBorderColor = getInterpolatedHexColor(
        DEFAULT_BORDER_COLOR,
        INDIA_HOVER_BORDER_COLOR,
        progress
      );

      themeProgressRef.current = progress;
      setMaterialColor(globeMaterial, nextGlobeColor);
      if (borderLineMaterialRef.current) {
        setMaterialColor(borderLineMaterialRef.current, nextBorderColor);
      }
    },
    [globeMaterial]
  );

  const clearIntroTimeouts = useCallback(() => {
    introTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    introTimeoutsRef.current = [];

    if (introAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
      introAnimationFrameRef.current = null;
    }

    if (themeAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(themeAnimationFrameRef.current);
      themeAnimationFrameRef.current = null;
    }
  }, []);

  const startIntroFlight = useCallback(() => {
    if (introAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
    }

    const startTime = performance.now();
    let lastStateSyncTime = startTime;

    const animate = (currentTime: number) => {
      const elapsedMs = currentTime - startTime;
      const progress = Math.min(1, elapsedMs / INTRO_FLIGHT_MS);
      const nextPov = getIntroPointOfView(progress);

      currentPovRef.current = nextPov;
      updateLocationMarkerScale(nextPov.altitude);
      globeRef.current?.pointOfView(nextPov, 0);

      if (
        currentTime - lastStateSyncTime >= INTRO_STATE_SYNC_MS ||
        progress === 1
      ) {
        setCurrentPov(nextPov);
        lastStateSyncTime = currentTime;
      }

      if (progress < 1) {
        introAnimationFrameRef.current = window.requestAnimationFrame(animate);
      }
    };

    introAnimationFrameRef.current = window.requestAnimationFrame(animate);
  }, []);

  const queueIntroFlight = useCallback(
    (delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        startIntroFlight();
      }, delayMs);

      introTimeoutsRef.current.push(timeoutId);
    },
    [startIntroFlight]
  );

  const moveGlobe = useCallback(
    (direction: GlobeDirection) => {
      const currentPov = currentPovRef.current;
      const nextPov = {
        ...currentPov,
        lat:
          direction === 'up'
            ? clampLatitude(currentPov.lat + 8)
            : direction === 'down'
            ? clampLatitude(currentPov.lat - 8)
            : currentPov.lat,
        lng:
          direction === 'left'
            ? normalizeLongitude(currentPov.lng - 12)
            : direction === 'right'
            ? normalizeLongitude(currentPov.lng + 12)
            : currentPov.lng
      };

      updatePointOfView(nextPov, 520);
    },
    [updatePointOfView]
  );

  const handleZoomChange = (value: number) => {
    updatePointOfView(
      {
        ...currentPovRef.current,
        altitude: getAltitudeFromDisplayZoom(value)
      },
      0
    );
  };
  const animateLocationContentProgress = useCallback(
    (from: number, to: number, durationMs: number, onComplete?: () => void) => {
      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
        locationContentAnimationFrameRef.current = null;
      }

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedMs = currentTime - startTime;
        const progress = Math.min(1, elapsedMs / durationMs);
        const nextProgress = from + (to - from) * progress;

        setLocationContentProgress(nextProgress);

        if (progress < 1) {
          locationContentAnimationFrameRef.current =
            window.requestAnimationFrame(animate);
          return;
        }

        setLocationContentProgress(to);
        locationContentAnimationFrameRef.current = null;
        onComplete?.();
      };

      setLocationContentProgress(from);
      locationContentAnimationFrameRef.current =
        window.requestAnimationFrame(animate);
    },
    []
  );
  const openLocationContent = useCallback(
    (location: V2GlobeLocation, anchor: ScreenPoint) => {
      clearIntroTimeouts();

      if (locationContentTimeoutRef.current !== null) {
        window.clearTimeout(locationContentTimeoutRef.current);
        locationContentTimeoutRef.current = null;
      }
      isLocationContentClosingRef.current = false;

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
        locationContentRevealTimeoutRef.current = null;
      }

      if (!selectedLocation && !previousLocationPovRef.current) {
        previousLocationPovRef.current = currentPovRef.current;
      }

      setIsLocationContentVisible(false);
      setLocationContentProgress(0);
      setSelectedLocation(null);
      setSelectedLocationAnchor(null);
      updatePointOfView(
        {
          lat: location.focusView.lat,
          lng: location.focusView.lng,
          altitude: getAltitudeFromDisplayZoom(location.focusView.zoom)
        },
        LOCATION_FOCUS_TRANSITION_MS
      );

      locationContentRevealTimeoutRef.current = window.setTimeout(() => {
        const liveAnchor = getLocationMarkerLineEndpoint(location.id) ?? anchor;
        const containerRect = containerRef.current?.getBoundingClientRect();
        const relativeAnchor = containerRect
          ? {
              calloutSide: liveAnchor.calloutSide,
              calloutWidth: liveAnchor.calloutWidth,
              x: liveAnchor.x - containerRect.left,
              y: liveAnchor.y - containerRect.top
            }
          : liveAnchor;

        setSelectedLocation(location);
        setSelectedLocationAnchor(relativeAnchor);
        window.requestAnimationFrame(() => {
          setIsLocationContentVisible(true);
          animateLocationContentProgress(0, 1, LOCATION_CONTENT_REVEAL_MS);
        });
        locationContentRevealTimeoutRef.current = null;
      }, LOCATION_FOCUS_TRANSITION_MS);
    },
    [
      animateLocationContentProgress,
      clearIntroTimeouts,
      selectedLocation,
      updatePointOfView
    ]
  );
  const closeLocationContent = useCallback(() => {
    if (!selectedLocation || isLocationContentClosingRef.current) {
      return;
    }

    if (locationContentRevealTimeoutRef.current !== null) {
      window.clearTimeout(locationContentRevealTimeoutRef.current);
      locationContentRevealTimeoutRef.current = null;
    }

    const closingLocation = selectedLocation;
    const previousPov = previousLocationPovRef.current;
    isLocationContentClosingRef.current = true;

    setIsLocationContentVisible(false);
    animateLocationContentProgress(
      locationContentProgress,
      0,
      LOCATION_CONTENT_TRANSITION_MS,
      () => {
        window.dispatchEvent(
          new CustomEvent(LOCATION_CONTENT_CLOSE_EVENT, {
            detail: {
              id: closingLocation.id
            }
          })
        );
        resetLocationMarkerState();

        locationContentTimeoutRef.current = window.setTimeout(() => {
          setSelectedLocation(null);
          setSelectedLocationAnchor(null);

          if (previousPov) {
            updatePointOfView(previousPov, LOCATION_FOCUS_TRANSITION_MS);
            previousLocationPovRef.current = null;
          }

          isLocationContentClosingRef.current = false;
          locationContentTimeoutRef.current = null;
        }, LOCATION_CALLOUT_CLOSE_MS);
      }
    );
  }, [
    animateLocationContentProgress,
    locationContentProgress,
    selectedLocation,
    updatePointOfView
  ]);
  const handleDevPanelDragStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }

      const panel = event.currentTarget.closest('[data-v2-dev-control="true"]');

      if (!(panel instanceof HTMLElement)) {
        return;
      }

      const rect = panel.getBoundingClientRect();

      devPanelDragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top
      };
      setDevPanelPosition({ x: rect.left, y: rect.top });
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    []
  );
  const handleDevPanelDragMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = devPanelDragRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const maxX = Math.max(0, window.innerWidth - dragState.width);
      const maxY = Math.max(0, window.innerHeight - dragState.height);

      setDevPanelPosition({
        x: Math.max(0, Math.min(maxX, event.clientX - dragState.offsetX)),
        y: Math.max(0, Math.min(maxY, event.clientY - dragState.offsetY))
      });
    },
    []
  );
  const handleDevPanelDragEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = devPanelDragRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      devPanelDragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    []
  );
  const handleSkipInitialTransitionChange = useCallback(
    (isChecked: boolean) => {
      setShouldSkipInitialTransition(isChecked);
      window.localStorage.setItem(
        SKIP_INITIAL_TRANSITION_STORAGE_KEY,
        isChecked ? 'true' : 'false'
      );
    },
    []
  );
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      setSize({ width, height });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isActive || borderPaths.length > 0) {
      return;
    }

    const controller = new AbortController();

    fetch('/data/countries.geojson', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load country boundaries');
        }

        return (await response.json()) as MapLinesGeoJson;
      })
      .then((data) => {
        setBorderPaths(getCountryBorderPaths(data.features));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        throw error;
      });

    return () => {
      controller.abort();
    };
  }, [borderPaths.length, isActive]);

  useEffect(() => {
    if (!IS_DEV_PANEL_ENABLED) {
      return;
    }

    setShouldSkipInitialTransition(
      window.localStorage.getItem(SKIP_INITIAL_TRANSITION_STORAGE_KEY) ===
        'true'
    );
    setHasLoadedDevPreferences(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
        locationContentAnimationFrameRef.current = null;
      }

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
        locationContentRevealTimeoutRef.current = null;
      }

      setIsLocationContentVisible(false);
      setLocationContentProgress(0);
      setSelectedLocation(null);
      setSelectedLocationAnchor(null);
      isLocationContentClosingRef.current = false;
      previousLocationPovRef.current = null;
      resetLocationMarkerState();
      return;
    }

    const handleLocationSelect = (event: Event) => {
      const { anchor, id: locationId } = (event as LocationSelectEvent).detail;
      const location = V2_GLOBE_LOCATIONS.find(
        (candidateLocation) => candidateLocation.id === locationId
      );

      if (!location) {
        return;
      }

      openLocationContent(location, anchor);
    };

    window.addEventListener(LOCATION_SELECT_EVENT, handleLocationSelect);

    return () => {
      window.removeEventListener(LOCATION_SELECT_EVENT, handleLocationSelect);
    };
  }, [isActive, openLocationContent]);

  useEffect(() => {
    return () => {
      if (locationContentTimeoutRef.current !== null) {
        window.clearTimeout(locationContentTimeoutRef.current);
      }

      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
      }

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isGlobeReady || visibleBorderPaths.length === 0) {
      return;
    }

    const globe = globeRef.current;
    const scene = globe?.scene();

    if (!globe || !scene) {
      return;
    }

    disposeBorderLineSegments(borderLineRef.current);

    const { lines, material } = createBorderLineSegments(
      visibleBorderPaths,
      globe.getCoords.bind(globe),
      getInterpolatedHexColor(
        DEFAULT_BORDER_COLOR,
        INDIA_HOVER_BORDER_COLOR,
        themeProgressRef.current
      )
    );

    borderLineRef.current = lines;
    borderLineMaterialRef.current = material;
    scene.add(lines);

    return () => {
      scene.remove(lines);
      disposeBorderLineSegments(lines);

      if (borderLineRef.current === lines) {
        borderLineRef.current = null;
        borderLineMaterialRef.current = null;
      }
    };
  }, [isGlobeReady, visibleBorderPaths]);

  useEffect(() => {
    if (themeAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(themeAnimationFrameRef.current);
      themeAnimationFrameRef.current = null;
    }

    const targetProgress = isSecondStage ? 1 : 0;
    const shouldEaseTheme = isSecondStage || isSecondStageRef.current;

    isSecondStageRef.current = isSecondStage;

    if (!shouldEaseTheme) {
      applyThemeProgress(targetProgress);
      return;
    }

    const startProgress = themeProgressRef.current;
    const startTime = performance.now();

    const animateTheme = (currentTime: number) => {
      const elapsedMs = currentTime - startTime;
      const progress = Math.min(1, elapsedMs / STAGE_THEME_TRANSITION_MS);
      const nextProgress =
        startProgress +
        (targetProgress - startProgress) * easeInOutCubic(progress);

      applyThemeProgress(nextProgress);

      if (progress < 1) {
        themeAnimationFrameRef.current =
          window.requestAnimationFrame(animateTheme);
      }
    };

    themeAnimationFrameRef.current = window.requestAnimationFrame(animateTheme);

    return () => {
      if (themeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(themeAnimationFrameRef.current);
        themeAnimationFrameRef.current = null;
      }
    };
  }, [applyThemeProgress, isSecondStage]);

  useEffect(() => {
    if (!isGlobeReady || (IS_DEV_PANEL_ENABLED && !hasLoadedDevPreferences)) {
      return;
    }

    const controls = globeRef.current?.controls();

    if (controls) {
      controls.autoRotate = false;
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.55;
      controls.minDistance = 80;
      controls.maxDistance = 420;
    }

    globeRef.current?.renderer().setPixelRatio(TARGET_RENDER_PIXEL_RATIO);

    if (!isActive) {
      clearIntroTimeouts();
      setIsGlobeVisible(false);
      return;
    }

    clearIntroTimeouts();
    setIsGlobeVisible(false);
    if (controls) {
      controls.autoRotate = false;
    }

    if (IS_DEV_PANEL_ENABLED && shouldSkipInitialTransition) {
      updatePointOfView(getIntroPointOfView(1), 0);
      applyThemeProgress(1);
      setIsGlobeVisible(true);
      return;
    }

    updatePointOfView(
      {
        ...MADRID_VIEW,
        altitude: getAltitudeFromZoom(INTRO_START_ZOOM)
      },
      0
    );

    const fadeTimeoutId = window.setTimeout(() => {
      setIsGlobeVisible(true);
    }, 80);
    introTimeoutsRef.current.push(fadeTimeoutId);

    queueIntroFlight(GLOBE_FADE_IN_MS);

    return () => {
      clearIntroTimeouts();
    };
  }, [
    clearIntroTimeouts,
    hasLoadedDevPreferences,
    isActive,
    isGlobeReady,
    applyThemeProgress,
    queueIntroFlight,
    shouldSkipInitialTransition,
    updatePointOfView
  ]);

  useEffect(() => {
    if (!isGlobeReady || !isActive) {
      return;
    }

    const controls = globeRef.current?.controls();

    if (!controls) {
      return;
    }

    controls.autoRotate = isRotationEnabled;
    controls.autoRotateSpeed =
      rotationDirection === 'east' ? rotationSpeed : -rotationSpeed;

    return () => {
      controls.autoRotate = false;
    };
  }, [
    isActive,
    isGlobeReady,
    isRotationEnabled,
    rotationDirection,
    rotationSpeed
  ]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('[data-v2-dev-control="true"]')
      ) {
        return;
      }

      if (
        event.key !== 'ArrowUp' &&
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight'
      ) {
        return;
      }

      event.preventDefault();
      const direction = event.key.replace('Arrow', '').toLowerCase();
      moveGlobe(direction as GlobeDirection);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, moveGlobe]);

  useEffect(() => {
    updateLocationMarkerScale(currentPov.altitude);
  }, [currentPov.altitude, visibleLocationMarkers.length]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleLocationMarkerWheel = (event: Event) => {
      const { deltaY } = (event as LocationMarkerWheelEvent).detail;
      const currentZoom = getDisplayZoomFromAltitude(
        currentPovRef.current.altitude
      );
      const nextZoom = Math.max(
        MIN_DISPLAY_ZOOM,
        Math.min(MAX_DISPLAY_ZOOM, currentZoom - deltaY * 0.08)
      );

      updatePointOfView(
        {
          ...currentPovRef.current,
          altitude: getAltitudeFromDisplayZoom(nextZoom)
        },
        0
      );
    };

    window.addEventListener(
      LOCATION_MARKER_WHEEL_EVENT,
      handleLocationMarkerWheel
    );

    return () => {
      window.removeEventListener(
        LOCATION_MARKER_WHEEL_EVENT,
        handleLocationMarkerWheel
      );
    };
  }, [isActive, updatePointOfView]);

  useEffect(() => {
    if (!isGlobeReady || !isActive || fps === 0) {
      return;
    }

    if (fps < 30) {
      globeRef.current?.renderer().setPixelRatio(LOW_FPS_RENDER_PIXEL_RATIO);
      setOutlineDetail((currentDetail) =>
        currentDetail === MIN_OUTLINE_DETAIL
          ? currentDetail
          : Math.max(MIN_OUTLINE_DETAIL, Math.floor(currentDetail * 0.5))
      );
      return;
    }

    globeRef.current?.renderer().setPixelRatio(TARGET_RENDER_PIXEL_RATIO);
  }, [fps, isActive, isGlobeReady]);

  useEffect(() => {
    let animationFrameId = 0;
    let frameCount = 0;
    let lastSampleTime = performance.now();

    const measureFps = (currentTime: number) => {
      frameCount += 1;

      if (currentTime - lastSampleTime >= 1000) {
        setFps(
          Math.round((frameCount * 1000) / (currentTime - lastSampleTime))
        );
        frameCount = 0;
        lastSampleTime = currentTime;
      }

      animationFrameId = window.requestAnimationFrame(measureFps);
    };

    animationFrameId = window.requestAnimationFrame(measureFps);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className='relative min-h-screen overflow-hidden bg-black'
    >
      <div
        className={cn(
          'transition-opacity duration-700',
          isActive && isGlobeVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {size.width > 0 && size.height > 0 && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor='rgba(0,0,0,0)'
            globeMaterial={globeMaterial}
            showAtmosphere={false}
            htmlElementsData={visibleLocationMarkers}
            htmlLat='lat'
            htmlLng='lng'
            htmlAltitude='altitude'
            htmlElement={createLocationMarkerElement}
            htmlTransitionDuration={400}
            enablePointerInteraction
            onGlobeReady={() => {
              setIsGlobeReady(true);
            }}
            onZoom={(pov) => {
              currentPovRef.current = pov;
              setCurrentPov(pov);
              updateLocationMarkerScale(pov.altitude);
            }}
          />
        )}
      </div>

      {IS_DEV_PANEL_ENABLED && (
        <div className='absolute top-5 left-5 z-[12000] rounded-md border border-white/15 bg-black/75 px-3 py-2 font-mono text-xs text-white shadow-2xl backdrop-blur-md'>
          <span className='text-white/45'>FPS</span>{' '}
          <span className='tabular-nums'>{fps}</span>
        </div>
      )}

      {selectedLocation && (
        <V2LocationContentPanel
          closeLocationContent={closeLocationContent}
          isLocationContentVisible={isLocationContentVisible}
          locationContentLayout={locationContentLayout}
          locationContentProgress={locationContentProgress}
          selectedLocation={selectedLocation}
        />
      )}

      {IS_DEV_PANEL_ENABLED && (
        <V2DevPanel
          activeStep={activeStep}
          currentPov={currentPov}
          devPanelPosition={devPanelPosition}
          flowSteps={flowSteps}
          getDisplayZoomFromAltitude={getDisplayZoomFromAltitude}
          handleDevPanelDragEnd={handleDevPanelDragEnd}
          handleDevPanelDragMove={handleDevPanelDragMove}
          handleDevPanelDragStart={handleDevPanelDragStart}
          handleSkipInitialTransitionChange={handleSkipInitialTransitionChange}
          handleZoomChange={handleZoomChange}
          isColorsModalOpen={isColorsModalOpen}
          isDevPanelOpen={isDevPanelOpen}
          isRotationEnabled={isRotationEnabled}
          isSecondStage={isSecondStage}
          maxDisplayZoom={MAX_DISPLAY_ZOOM}
          maxOutlineDetail={MAX_OUTLINE_DETAIL}
          maxRotationSpeed={MAX_ROTATION_SPEED}
          minDisplayZoom={MIN_DISPLAY_ZOOM}
          minOutlineDetail={MIN_OUTLINE_DETAIL}
          minRotationSpeed={MIN_ROTATION_SPEED}
          onStepChange={onStepChange}
          outlineDetail={outlineDetail}
          rotationDirection={rotationDirection}
          rotationSpeed={rotationSpeed}
          setIsColorsModalOpen={setIsColorsModalOpen}
          setIsDevPanelOpen={setIsDevPanelOpen}
          setIsRotationEnabled={setIsRotationEnabled}
          setOutlineDetail={setOutlineDetail}
          setRotationDirection={setRotationDirection}
          setRotationSpeed={setRotationSpeed}
          shouldSkipInitialTransition={shouldSkipInitialTransition}
          v2ColorTokens={V2_COLOR_TOKENS}
        />
      )}
    </section>
  );
}
