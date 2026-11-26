import React, { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onVectorChange: (dx: number, dy: number, active: boolean) => void;
  size?: number;
  className?: string;
}

const DEADZONE = 0.14;

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onVectorChange,
  size = 116,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const onVectorChangeRef = useRef(onVectorChange);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [angleDeg, setAngleDeg] = useState<number | null>(null);

  useEffect(() => {
    onVectorChangeRef.current = onVectorChange;
  }, [onVectorChange]);

  const resetStick = () => {
    activePointerIdRef.current = null;
    setIsActive(false);
    setKnobOffset({ x: 0, y: 0 });
    setAngleDeg(null);
    onVectorChangeRef.current(0, 0, false);
  };

  useEffect(() => {
    const onBlur = () => {
      activePointerIdRef.current = null;
      setIsActive(false);
      setKnobOffset({ x: 0, y: 0 });
      setAngleDeg(null);
      onVectorChangeRef.current(0, 0, false);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  const updateFromClientCoords = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.35;

    let rawDx = clientX - cx;
    let rawDy = clientY - cy;
    const dist = Math.hypot(rawDx, rawDy);

    if (dist > maxRadius) {
      rawDx = (rawDx / dist) * maxRadius;
      rawDy = (rawDy / dist) * maxRadius;
    }

    setKnobOffset({ x: rawDx, y: rawDy });

    const normMag = Math.min(1, dist / maxRadius);
    if (normMag < DEADZONE) {
      setAngleDeg(null);
      onVectorChange(0, 0, true);
      return;
    }

    // Rescale outside deadzone smoothly from 0..1
    const scaledMag = (normMag - DEADZONE) / (1 - DEADZONE);
    const dirX = rawDx / Math.max(0.0001, Math.hypot(rawDx, rawDy));
    const dirY = rawDy / Math.max(0.0001, Math.hypot(rawDx, rawDy));

    setAngleDeg((Math.atan2(dirY, dirX) * 180) / Math.PI);
    onVectorChange(dirX * scaledMag, dirY * scaledMag, true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== null) return;
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsActive(true);
    updateFromClientCoords(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateFromClientCoords(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetStick();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ width: size, height: size }}
      className={`relative rounded-full bg-[#16302B]/50 border-2 ${
        isActive ? 'border-[#FAF9F5]/85 shadow-xl' : 'border-[#FAF9F5]/45 shadow-lg'
      } flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing ${className}`}
      role="application"
      aria-label="Kontroler Analog Pergerakan Karakter"
    >
      {/* Inner recessed track ring */}
      <div className="absolute inset-3 rounded-full border border-[#FAF9F5]/20 bg-[#16302B]/25 pointer-events-none" />

      {/* Classic 4-way directional chevrons */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-65"
        aria-hidden="true"
      >
        <path d="M50 10 L45 17 H55 Z" fill="#FAF9F5" />
        <path d="M50 90 L45 83 H55 Z" fill="#FAF9F5" />
        <path d="M10 50 L17 45 V55 Z" fill="#FAF9F5" />
        <path d="M90 50 L83 45 V55 Z" fill="#FAF9F5" />
      </svg>

      {/* Active directional pointer arc */}
      {isActive && angleDeg !== null && (
        <div
          className="absolute inset-1 rounded-full pointer-events-none"
          style={{ transform: `rotate(${angleDeg}deg)` }}
        >
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3B826E] border border-[#FAF9F5]" />
        </div>
      )}

      {/* Draggable Analog Thumb Knob */}
      <div
        className={`w-12 h-12 rounded-full bg-[#FAF9F5] border-2 border-[#2C6E63] shadow-md pointer-events-none flex items-center justify-center ${
          isActive ? '' : 'transition-transform duration-150 ease-out'
        }`}
        style={{
          transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-[#2C6E63]/20 border border-[#2C6E63]/35" />
      </div>
    </div>
  );
};
