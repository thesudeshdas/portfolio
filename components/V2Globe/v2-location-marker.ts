import {
  ACTIVE_LOCATION_MARKER_DATA_KEY,
  LOCATION_CALLOUT_BASE_FRACTION,
  LOCATION_CALLOUT_CLOSE_MS,
  LOCATION_CALLOUT_EXTENSION_END,
  LOCATION_CALLOUT_EXTENSION_LENGTH,
  LOCATION_CALLOUT_OPEN_MS,
  LOCATION_CONTENT_CLOSE_EVENT,
  LOCATION_FOCUS_TIMING_FUNCTION,
  LOCATION_MARKER_COLOR,
  LOCATION_MARKER_CALLOUT_EVENT,
  LOCATION_MARKER_OPEN_EVENT,
  LOCATION_MARKER_HINT_PULSE_COUNT,
  LOCATION_MARKER_PULSE_DURATION_MS,
  LOCATION_MARKER_PULSE_KEYFRAMES,
  LOCATION_MARKER_RESET_EVENT,
  LOCATION_MARKER_SELECTED_EVENT,
  LOCATION_MARKER_WHEEL_EVENT,
  LOCATION_SELECT_EVENT,
  STAGE_THEME_TRANSITION_MS
} from './v2-globe.constants';
import type { V2GlobeLocation } from './v2-globe-locations';
import { getLocationMarkerScale } from './v2-globe-math';
import type {
  LocationContentCloseEvent,
  LocationMarkerSelectedEvent,
  ScreenPoint
} from './v2-globe.types';

let currentLocationMarkerScale = 1;
let activeLocationMarkerId: string | null = null;

type V2GlobeLocationMarker = V2GlobeLocation & {
  altitude: number;
};

export function updateLocationMarkerScale(altitude: number) {
  const markerScale = getLocationMarkerScale(altitude);
  currentLocationMarkerScale = markerScale;

  document
    .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
    .forEach((markerElement) => {
      markerElement.style.setProperty(
        '--location-marker-scale',
        markerScale.toFixed(3)
      );
    });
}

export function getLocationMarkerLineEndpoint(locationId: string) {
  const markerElement = document.querySelector<HTMLElement>(
    `[data-v2-location-id="${locationId}"]`
  );

  if (!markerElement) {
    return null;
  }

  const markerRect = markerElement.getBoundingClientRect();
  const markerScale = Number(
    markerElement.style.getPropertyValue('--location-marker-scale') || 1
  );
  const calloutSide: ScreenPoint['calloutSide'] =
    markerElement.dataset.v2LocationCalloutSide === 'left' ? 'left' : 'right';
  const directionMultiplier = calloutSide === 'left' ? -1 : 1;

  return {
    calloutSide,
    calloutWidth: LOCATION_CALLOUT_EXTENSION_LENGTH * markerScale,
    x:
      markerRect.left +
      directionMultiplier * (LOCATION_CALLOUT_EXTENSION_END + 2) * markerScale,
    y: markerRect.top - 37 * markerScale
  };
}

function getNearestLocationMarkerElement(event: PointerEvent) {
  let nearestMarker: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  document
    .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
    .forEach((markerElement) => {
      const rect = markerElement.getBoundingClientRect();
      const markerScale = Number(
        markerElement.style.getPropertyValue('--location-marker-scale') || 1
      );
      const hitRadius = 14 * markerScale;
      const distance = Math.hypot(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      if (distance > hitRadius || distance >= nearestDistance) {
        return;
      }

      nearestMarker = markerElement;
      nearestDistance = distance;
    });

  return nearestMarker;
}

function getActiveLocationMarkerId() {
  return (
    document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY] ??
    activeLocationMarkerId
  );
}

function setActiveLocationMarkerId(locationId: string | null) {
  activeLocationMarkerId = locationId;

  if (locationId) {
    document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY] =
      locationId;
    return;
  }

  delete document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY];
}

export function resetLocationMarkerState() {
  setActiveLocationMarkerId(null);
  window.dispatchEvent(new CustomEvent(LOCATION_MARKER_RESET_EVENT));
}

export function showLocationMarkerCallout(locationId: string) {
  document
    .querySelector<HTMLElement>(`[data-v2-location-id="${locationId}"]`)
    ?.dispatchEvent(new CustomEvent(LOCATION_MARKER_CALLOUT_EVENT));
}

export function openLocationMarker(locationId: string) {
  document
    .querySelector<HTMLElement>(`[data-v2-location-id="${locationId}"]`)
    ?.dispatchEvent(new CustomEvent(LOCATION_MARKER_OPEN_EVENT));
}

export function createLocationMarkerElement(data: object) {
  const pin = data as V2GlobeLocationMarker;
  const calloutSide = pin.calloutSide ?? 'right';
  const isLeftCallout = calloutSide === 'left';
  const isClickHintEnabled = pin.showClickHint !== false;
  const directionMultiplier = isLeftCallout ? -1 : 1;
  const element = document.createElement('div');
  const style = document.createElement('style');
  const marker = document.createElement('div');
  const hitArea = document.createElement('div');
  const pulseSquare = document.createElement('div');
  const square = document.createElement('div');
  const clickHint = document.createElement('div');
  const clickHintText = document.createElement('span');
  const clickHintLine = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const clickHintPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  const callout = document.createElement('div');
  const calloutLine = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const calloutPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  const content = document.createElement('div');
  const title = document.createElement('div');
  const date = document.createElement('div');
  const location = document.createElement('div');
  const coordinates = document.createElement('div');

  element.setAttribute('role', 'button');
  element.setAttribute(
    'aria-label',
    `${pin.title}. ${pin.location}. ${pin.coordinates}`
  );
  element.dataset.v2LocationMarker = 'true';
  element.dataset.v2LocationId = pin.id;
  element.dataset.v2LocationCalloutSide = calloutSide;
  element.style.setProperty(
    '--location-marker-scale',
    currentLocationMarkerScale.toFixed(3)
  );
  element.tabIndex = 0;
  element.style.position = 'relative';
  element.style.width = '0';
  element.style.height = '0';
  element.style.pointerEvents = 'auto';
  element.style.cursor = 'pointer';
  element.style.opacity = '0';
  element.style.outline = 'none';
  element.style.transition = `opacity ${STAGE_THEME_TRANSITION_MS}ms ease`;

  style.textContent = `
    @keyframes ${LOCATION_MARKER_PULSE_KEYFRAMES} {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        background: rgba(47, 29, 19, 0.16);
      }

      50% {
        transform: translate(-50%, -50%) scale(2);
        background: rgba(47, 29, 19, 0.22);
      }
    }
  `;

  window.requestAnimationFrame(() => {
    element.style.opacity = '1';
  });

  marker.style.position = 'absolute';
  marker.style.left = '0';
  marker.style.top = '0';
  marker.style.width = '220px';
  marker.style.height = '112px';
  marker.style.pointerEvents = 'none';
  marker.style.transform = 'scale(var(--location-marker-scale))';
  marker.style.transformOrigin = '0 0';
  marker.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';

  hitArea.style.position = 'absolute';
  hitArea.style.top = '0';
  hitArea.style.left = '0';
  hitArea.style.display = 'grid';
  hitArea.style.width = '40px';
  hitArea.style.height = '40px';
  hitArea.style.placeItems = 'center';
  hitArea.style.cursor = 'pointer';
  hitArea.style.pointerEvents = 'auto';
  hitArea.style.transform = 'translate(-50%, -50%)';
  hitArea.style.transition = 'transform 260ms ease';

  pulseSquare.style.position = 'absolute';
  pulseSquare.style.top = '50%';
  pulseSquare.style.left = '50%';
  pulseSquare.style.width = '12px';
  pulseSquare.style.height = '12px';
  pulseSquare.style.background = 'rgba(47, 29, 19, 0.16)';
  pulseSquare.style.pointerEvents = 'none';
  pulseSquare.style.transform = 'translate(-50%, -50%)';
  pulseSquare.style.animation = `${LOCATION_MARKER_PULSE_KEYFRAMES} ${LOCATION_MARKER_PULSE_DURATION_MS}ms ease-in-out infinite`;
  pulseSquare.style.transition =
    'opacity 260ms ease, transform 260ms ease, background 260ms ease';

  clickHint.style.position = 'absolute';
  clickHint.style.left = '-210px';
  clickHint.style.top = '-104px';
  clickHint.style.width = '212px';
  clickHint.style.height = '104px';
  clickHint.style.color = LOCATION_MARKER_COLOR;
  clickHint.style.display = isClickHintEnabled ? 'block' : 'none';
  clickHint.style.opacity = '0';
  clickHint.style.cursor = 'pointer';
  clickHint.style.pointerEvents = 'auto';
  clickHint.style.transform = 'translate3d(8px, 0, 0)';
  clickHint.style.transition =
    'opacity 360ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)';

  clickHintLine.setAttribute('viewBox', '0 0 212 104');
  clickHintLine.style.position = 'absolute';
  clickHintLine.style.left = '0';
  clickHintLine.style.top = '0';
  clickHintLine.style.width = '212px';
  clickHintLine.style.height = '104px';
  clickHintLine.style.overflow = 'visible';

  clickHintPath.setAttribute('d', 'M212 104 L148 67 L12 67');
  clickHintPath.setAttribute('fill', 'none');
  clickHintPath.setAttribute('stroke', LOCATION_MARKER_COLOR);
  clickHintPath.setAttribute('stroke-width', '2.5');
  clickHintPath.setAttribute('stroke-linecap', 'square');
  clickHintPath.setAttribute('stroke-linejoin', 'miter');
  clickHintPath.setAttribute('pathLength', '1');
  clickHintPath.style.filter = 'drop-shadow(0 0 12px rgba(47, 29, 19, 0.32))';
  clickHintPath.style.strokeDasharray = '1';
  clickHintPath.style.strokeDashoffset = '1';
  clickHintPath.style.transition =
    'stroke-dashoffset 680ms cubic-bezier(0.22, 1, 0.36, 1)';

  clickHintText.textContent = isClickHintEnabled ? 'Click me' : '';
  clickHintText.style.position = 'absolute';
  clickHintText.style.left = '12px';
  clickHintText.style.bottom = '48px';
  clickHintText.style.fontSize = '11px';
  clickHintText.style.fontWeight = '600';
  clickHintText.style.letterSpacing = '0.12em';
  clickHintText.style.lineHeight = '1';
  clickHintText.style.opacity = '0';
  clickHintText.style.textTransform = 'uppercase';
  clickHintText.style.transform = 'translate3d(0, 10px, 0)';
  clickHintText.style.transition =
    'opacity 360ms ease 700ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) 700ms';

  square.style.position = 'relative';
  square.style.width = '12px';
  square.style.height = '12px';
  square.style.background = LOCATION_MARKER_COLOR;
  square.style.border = '1px solid rgba(216, 199, 170, 0.85)';
  square.style.pointerEvents = 'none';
  square.style.transition =
    'background 260ms ease, width 260ms ease, height 260ms ease';

  callout.style.position = 'absolute';
  callout.style.left = '2px';
  callout.style.top = '-104px';
  callout.style.width = '212px';
  callout.style.height = '104px';
  callout.style.pointerEvents = 'none';

  calloutLine.setAttribute('viewBox', '0 0 212 104');
  calloutLine.style.position = 'absolute';
  calloutLine.style.left = '0';
  calloutLine.style.top = '0';
  calloutLine.style.width = '212px';
  calloutLine.style.height = '104px';
  calloutLine.style.overflow = 'visible';

  calloutPath.setAttribute(
    'd',
    `M0 104 L${64 * directionMultiplier} 67 L${
      LOCATION_CALLOUT_EXTENSION_END * directionMultiplier
    } 67`
  );
  calloutPath.setAttribute('fill', 'none');
  calloutPath.setAttribute('stroke', LOCATION_MARKER_COLOR);
  calloutPath.setAttribute('stroke-width', '2.5');
  calloutPath.setAttribute('stroke-linecap', 'square');
  calloutPath.setAttribute('stroke-linejoin', 'miter');
  calloutPath.setAttribute('pathLength', '1');
  calloutPath.style.filter = 'drop-shadow(0 0 12px rgba(47, 29, 19, 0.32))';
  calloutPath.style.strokeDasharray = `${LOCATION_CALLOUT_BASE_FRACTION} 1`;
  calloutPath.style.strokeDashoffset = `${LOCATION_CALLOUT_BASE_FRACTION}`;
  calloutPath.style.transition =
    'stroke-dasharray 680ms cubic-bezier(0.22, 1, 0.36, 1), stroke-dashoffset 680ms cubic-bezier(0.22, 1, 0.36, 1)';

  content.style.position = 'absolute';
  if (isLeftCallout) {
    content.style.right = '274px';
    content.style.textAlign = 'right';
  } else {
    content.style.left = '62px';
  }
  content.style.top = '0';
  content.style.height = '104px';
  content.style.minWidth = '360px';
  content.style.color = LOCATION_MARKER_COLOR;
  content.style.opacity = '0';
  content.style.transform = 'translate3d(0, 10px, 0)';
  content.style.transition = `opacity 360ms ease ${LOCATION_CALLOUT_CLOSE_MS}ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) ${LOCATION_CALLOUT_CLOSE_MS}ms`;

  title.textContent = pin.title;
  title.style.fontSize = '13px';
  title.style.fontWeight = '600';
  title.style.letterSpacing = '0';
  title.style.lineHeight = '1.2';
  title.style.position = 'absolute';
  title.style.bottom = pin.date ? '84px' : '68px';
  title.style.textTransform = 'none';
  if (isLeftCallout) {
    title.style.right = '0';
  } else {
    title.style.left = '0';
  }

  date.textContent = pin.date ?? '';
  date.style.display = pin.date ? 'block' : 'none';
  date.style.position = 'absolute';
  date.style.bottom = '70px';
  date.style.marginTop = '0';
  date.style.color = 'rgba(47, 29, 19, 0.72)';
  date.style.fontSize = '10px';
  date.style.lineHeight = '1.2';
  if (isLeftCallout) {
    date.style.right = '0';
  } else {
    date.style.left = '0';
  }

  location.textContent = pin.location;
  location.style.position = 'absolute';
  location.style.bottom = '45px';
  location.style.marginTop = '0';
  location.style.fontSize = '16px';
  location.style.fontWeight = '700';
  location.style.letterSpacing = '0.08em';
  location.style.lineHeight = '1.2';
  location.style.textTransform = 'uppercase';
  if (isLeftCallout) {
    location.style.right = '0';
  } else {
    location.style.left = '0';
  }

  coordinates.textContent = pin.coordinates;
  coordinates.style.position = 'absolute';
  coordinates.style.top = '75px';
  coordinates.style.marginTop = '0';
  coordinates.style.color = 'rgba(47, 29, 19, 0.62)';
  coordinates.style.fontSize = '10px';
  coordinates.style.fontWeight = '600';
  coordinates.style.lineHeight = '1.2';
  if (isLeftCallout) {
    coordinates.style.right = '0';
  } else {
    coordinates.style.left = '0';
  }

  content.append(title, date, location, coordinates);
  calloutLine.append(calloutPath);
  callout.append(calloutLine, content);
  clickHintLine.append(clickHintPath);
  if (isClickHintEnabled) {
    clickHint.append(clickHintLine, clickHintText);
  }
  hitArea.append(pulseSquare, square);
  marker.append(hitArea, ...(isClickHintEnabled ? [clickHint] : []), callout);
  element.append(style, marker);

  let isTooltipVisible = false;
  let isTooltipPinned = false;
  let isTooltipSuppressed = false;
  let isLocationContentOpen = false;
  let isCalloutRetracting = false;
  let calloutRetractTimeout: number | null = null;
  let pulseCount = 0;
  let isClickHintDismissed = !isClickHintEnabled;

  const stopPulse = () => {
    pulseSquare.style.animation = 'none';
    pulseSquare.style.opacity = '0';
  };
  const markContentSeen = () => {
    element.dataset.v2LocationSeen = 'true';
    stopPulse();
    square.style.width = '6px';
    square.style.height = '6px';
  };
  const showClickHint = () => {
    if (!isClickHintEnabled || isClickHintDismissed) {
      return;
    }

    clickHint.style.opacity = '1';
    clickHint.style.transform = 'translate3d(0, 0, 0)';
    clickHintPath.style.strokeDashoffset = '0';
    clickHintText.style.opacity = '1';
    clickHintText.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideClickHint = () => {
    if (!isClickHintEnabled) {
      return;
    }

    clickHint.style.opacity = '0';
    clickHint.style.transform = 'translate3d(8px, 0, 0)';
    clickHintPath.style.strokeDashoffset = '1';
    clickHintText.style.opacity = '0';
    clickHintText.style.transform = 'translate3d(0, 10px, 0)';
  };
  const setCalloutState = (
    state: 'hidden' | 'base' | 'full',
    durationMs: number,
    timingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)',
    delayMs = 0
  ) => {
    calloutPath.style.transition = [
      `stroke-dasharray ${durationMs}ms ${timingFunction} ${delayMs}ms`,
      `stroke-dashoffset ${durationMs}ms ${timingFunction} ${delayMs}ms`
    ].join(', ');

    if (state === 'full') {
      calloutPath.style.strokeDasharray = '1 0';
      calloutPath.style.strokeDashoffset = '0';
      return;
    }

    calloutPath.style.strokeDasharray = `${LOCATION_CALLOUT_BASE_FRACTION} 1`;
    calloutPath.style.strokeDashoffset =
      state === 'base' ? '0' : `${LOCATION_CALLOUT_BASE_FRACTION}`;
  };

  const showTooltip = () => {
    const selectedLocationMarkerId = getActiveLocationMarkerId();

    if (
      isTooltipVisible ||
      isTooltipSuppressed ||
      isCalloutRetracting ||
      (selectedLocationMarkerId !== null && selectedLocationMarkerId !== pin.id)
    ) {
      return;
    }

    isTooltipVisible = true;
    isClickHintDismissed = true;
    hideClickHint();
    square.style.background = LOCATION_MARKER_COLOR;
    setCalloutState('base', LOCATION_CALLOUT_CLOSE_MS);
    content.style.transition = `opacity 360ms ease ${LOCATION_CALLOUT_CLOSE_MS}ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) ${LOCATION_CALLOUT_CLOSE_MS}ms`;
    content.style.opacity = '1';
    content.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideTooltipContent = () => {
    content.style.transition =
      'opacity 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
    content.style.opacity = '0';
    content.style.transform = 'translate3d(0, 10px, 0)';
  };
  const retractCallout = (lockHover = false) => {
    if (calloutRetractTimeout !== null) {
      window.clearTimeout(calloutRetractTimeout);
      calloutRetractTimeout = null;
    }

    if (lockHover) {
      isCalloutRetracting = true;
      calloutRetractTimeout = window.setTimeout(() => {
        isCalloutRetracting = false;
        calloutRetractTimeout = null;
      }, LOCATION_CALLOUT_CLOSE_MS + 50);
    }

    isTooltipVisible = false;
    square.style.background = LOCATION_MARKER_COLOR;
    hideTooltipContent();
    setCalloutState(
      'hidden',
      LOCATION_CALLOUT_CLOSE_MS,
      LOCATION_FOCUS_TIMING_FUNCTION
    );
  };
  const hideTooltip = () => {
    if (isTooltipPinned) {
      return;
    }

    if (!isTooltipVisible) {
      return;
    }

    if (isLocationContentOpen) {
      hideTooltipContent();
      setCalloutState('full', LOCATION_CALLOUT_OPEN_MS);
      return;
    }

    retractCallout();
  };
  const handleWindowPointerMove = (event: PointerEvent) => {
    if (!element.isConnected) {
      if (calloutRetractTimeout !== null) {
        window.clearTimeout(calloutRetractTimeout);
      }

      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener(
        LOCATION_CONTENT_CLOSE_EVENT,
        handleLocationContentClose
      );
      window.removeEventListener(
        LOCATION_MARKER_SELECTED_EVENT,
        handleLocationMarkerSelected
      );
      window.removeEventListener(
        LOCATION_MARKER_RESET_EVENT,
        handleLocationMarkerReset
      );
      return;
    }

    if (isCalloutRetracting) {
      return;
    }

    const selectedLocationMarkerId = getActiveLocationMarkerId();

    if (
      selectedLocationMarkerId !== null &&
      selectedLocationMarkerId !== pin.id
    ) {
      retractCallout(true);
      return;
    }

    const nearestMarkerElement = getNearestLocationMarkerElement(event);

    if (nearestMarkerElement && nearestMarkerElement !== element) {
      hideTooltip();
      return;
    }

    if (nearestMarkerElement === element) {
      showTooltip();
      return;
    }

    if (isLocationContentOpen) {
      hideTooltipContent();
      setCalloutState('full', 0);
      return;
    }

    isTooltipSuppressed = false;

    if (document.activeElement !== element) {
      hideTooltip();
    }
  };
  const handleMarkerSelect = (event: Event) => {
    event.stopPropagation();
    if (calloutRetractTimeout !== null) {
      window.clearTimeout(calloutRetractTimeout);
      calloutRetractTimeout = null;
    }

    isCalloutRetracting = false;
    isClickHintDismissed = true;
    isTooltipPinned = false;
    isTooltipSuppressed = true;
    isLocationContentOpen = true;
    stopPulse();
    setActiveLocationMarkerId(pin.id);
    hideClickHint();
    isTooltipVisible = true;
    setCalloutState(
      'full',
      LOCATION_CALLOUT_OPEN_MS,
      LOCATION_FOCUS_TIMING_FUNCTION
    );
    hideTooltipContent();

    const elementRect = element.getBoundingClientRect();
    const markerScale = Number(
      element.style.getPropertyValue('--location-marker-scale') || 1
    );
    const anchor = {
      calloutSide,
      calloutWidth: LOCATION_CALLOUT_EXTENSION_LENGTH * markerScale,
      x:
        elementRect.left +
        directionMultiplier *
          (LOCATION_CALLOUT_EXTENSION_END + 2) *
          markerScale,
      y: elementRect.top - 37 * markerScale
    };

    window.dispatchEvent(
      new CustomEvent(LOCATION_MARKER_SELECTED_EVENT, {
        detail: {
          id: pin.id
        }
      })
    );

    window.dispatchEvent(
      new CustomEvent(LOCATION_SELECT_EVENT, {
        detail: {
          anchor,
          id: pin.id
        }
      })
    );
  };
  const handleMarkerWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    window.dispatchEvent(
      new CustomEvent(LOCATION_MARKER_WHEEL_EVENT, {
        detail: {
          deltaY: event.deltaY
        }
      })
    );
  };
  const handleHitAreaPointerEnter = (event: PointerEvent) => {
    if (getNearestLocationMarkerElement(event) !== element) {
      return;
    }

    showTooltip();
  };
  const handleMarkerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleMarkerSelect(event);
  };
  const handlePulseIteration = () => {
    if (!isClickHintEnabled || isClickHintDismissed) {
      return;
    }

    pulseCount += 1;

    if (
      !isClickHintDismissed &&
      pulseCount >= LOCATION_MARKER_HINT_PULSE_COUNT
    ) {
      showClickHint();
    }
  };
  const handleLocationContentClose = (event: Event) => {
    const { id: locationId } = (event as LocationContentCloseEvent).detail;

    if (locationId === getActiveLocationMarkerId()) {
      setActiveLocationMarkerId(null);
    }

    if (locationId !== pin.id) {
      return;
    }

    isTooltipSuppressed = true;
    isTooltipPinned = false;
    isLocationContentOpen = false;
    markContentSeen();
    retractCallout(true);
  };
  const handleLocationMarkerSelected = (event: Event) => {
    const { id: locationId } = (event as LocationMarkerSelectedEvent).detail;

    if (locationId === pin.id) {
      return;
    }

    isTooltipSuppressed = true;
    isTooltipPinned = false;
    isLocationContentOpen = false;
    retractCallout(true);
  };
  const handleLocationMarkerReset = () => {
    isTooltipPinned = false;
    isTooltipSuppressed = false;
    isLocationContentOpen = false;
    retractCallout(true);
  };
  const handleLocationMarkerCallout = () => {
    isTooltipPinned = true;
    isTooltipSuppressed = false;
    showTooltip();
  };

  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);
  element.addEventListener('keydown', handleMarkerKeyDown);
  element.addEventListener(
    LOCATION_MARKER_CALLOUT_EVENT,
    handleLocationMarkerCallout
  );
  element.addEventListener(LOCATION_MARKER_OPEN_EVENT, handleMarkerSelect);
  marker.addEventListener('mouseleave', hideTooltip);
  if (isClickHintEnabled) {
    clickHint.addEventListener('click', handleMarkerSelect);
  }
  hitArea.addEventListener('click', handleMarkerSelect);
  hitArea.addEventListener('pointerenter', handleHitAreaPointerEnter);
  hitArea.addEventListener('wheel', handleMarkerWheel, { passive: false });
  element.addEventListener('wheel', handleMarkerWheel, { passive: false });
  pulseSquare.addEventListener('animationiteration', handlePulseIteration);
  window.addEventListener(
    LOCATION_CONTENT_CLOSE_EVENT,
    handleLocationContentClose
  );
  window.addEventListener(
    LOCATION_MARKER_SELECTED_EVENT,
    handleLocationMarkerSelected
  );
  window.addEventListener(
    LOCATION_MARKER_RESET_EVENT,
    handleLocationMarkerReset
  );
  window.addEventListener('pointermove', handleWindowPointerMove, {
    passive: true
  });

  return element;
}
