import { useState } from 'react'
import type { BookingType } from '../types'
import { bookingConfig } from '../theme'

interface BookingButtonProps {
  type: BookingType
  onPress: () => void
  disabled: boolean
  dimmed?: boolean
  pendingSeconds?: number
  totalSeconds?: number
  onCancel?: () => void
}

export default function BookingButton({
  type,
  onPress,
  disabled,
  dimmed = false,
  pendingSeconds,
  totalSeconds = 4,
  onCancel,
}: BookingButtonProps) {
  const [pressed, setPressed] = useState(false)
  const config = bookingConfig[type]

  const isPending = pendingSeconds !== undefined

  const handleMouseDown = () => setPressed(true)
  const handleMouseUp = () => setPressed(false)
  const handleClick = () => {
    if (isPending) {
      onCancel?.()
    } else if (!disabled) {
      onPress()
    }
  }

  // ── Countdown / Undo mode ──────────────────────────────────────────────
  if (isPending) {
    const progress = pendingSeconds / totalSeconds // 1 → 0
    const circumference = 2 * Math.PI * 22        // SVG circle r=22
    const dashOffset = circumference * (1 - progress)

    return (
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        aria-label={`${config.label} abbrechen`}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minHeight: 110,
          backgroundColor: config.bgColor,
          border: `2px solid ${config.color}`,
          borderRadius: 16,
          padding: '14px 16px',
          cursor: 'pointer',
          transform: pressed ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.12s ease',
          textAlign: 'left',
          outline: 'none',
          WebkitAppearance: 'none',
          appearance: 'none',
          gap: 14,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shrinking background overlay showing elapsed time */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: config.color,
            opacity: 0.08,
            transformOrigin: 'left center',
            transform: `scaleX(${progress})`,
            transition: 'transform 1s linear',
            borderRadius: 14,
          }}
        />

        {/* Circular countdown */}
        <div style={{ position: 'relative', flexShrink: 0, width: 52, height: 52 }}>
          <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="26" cy="26" r="22" fill="none" stroke={`${config.color}22`} strokeWidth="3" />
            {/* Progress arc */}
            <circle
              cx="26" cy="26" r="22"
              fill="none"
              stroke={config.color}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Countdown number in center */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: config.color,
          }}>
            {pendingSeconds}
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: config.color, lineHeight: 1.2, marginBottom: 4 }}>
            {config.label} gebucht
          </div>
          <div style={{ fontSize: 12, color: config.color, fontWeight: 500, opacity: 0.75 }}>
            Antippen zum Abbrechen
          </div>
        </div>

        {/* Cancel icon */}
        <div style={{ fontSize: 22, color: config.color, flexShrink: 0, opacity: 0.8 }}>✕</div>
      </button>
    )
  }

  // ── Normal mode ────────────────────────────────────────────────────────
  const effectiveBg         = disabled ? '#F3F4F6' : dimmed ? '#F9FAFB' : config.bgColor
  const effectiveBorder     = disabled ? '#D1D5DB' : dimmed ? '#D1D5DB' : config.color
  const effectiveIconBg     = disabled ? '#E5E7EB' : dimmed ? '#9CA3AF' : config.color
  const effectiveLabelColor = disabled ? '#9CA3AF' : dimmed ? '#9CA3AF' : config.color

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      aria-label={config.label}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: 72,
        backgroundColor: effectiveBg,
        border: `2px solid ${effectiveBorder}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : dimmed ? 0.65 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s ease',
        boxShadow: pressed || disabled || dimmed ? 'none' : `0 3px 10px ${config.color}33`,
        textAlign: 'left',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        gap: 14,
      }}
    >
      <div style={{
        width: 44, height: 44,
        borderRadius: '50%', backgroundColor: effectiveIconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: '#fff', flexShrink: 0, fontWeight: 700,
      }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: effectiveLabelColor, lineHeight: 1.2 }}>
          {config.label}
        </div>
      </div>

      <div style={{ fontSize: 20, color: disabled ? '#D1D5DB' : dimmed ? '#D1D5DB' : config.color, flexShrink: 0 }}>
        {disabled ? '🔒' : '›'}
      </div>
    </button>
  )
}
