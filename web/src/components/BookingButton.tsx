import { useState } from 'react'
import type { BookingType } from '../types'
import { bookingConfig } from '../theme'

interface BookingButtonProps {
  type: BookingType
  onPress: () => void
  disabled: boolean
  dimmed?: boolean
  lastBookingTime?: string
}

export default function BookingButton({
  type,
  onPress,
  disabled,
  dimmed = false,
  lastBookingTime,
}: BookingButtonProps) {
  const [pressed, setPressed] = useState(false)
  const config = bookingConfig[type]

  const handleMouseDown = () => {
    if (!disabled) setPressed(true)
  }
  const handleMouseUp = () => {
    setPressed(false)
  }
  const handleClick = () => {
    if (!disabled) onPress()
  }

  const subtitle = lastBookingTime
    ? `Letzte: ${lastBookingTime} Uhr`
    : 'Heute noch keine Buchung'

  // Dimmed = not the recommended next step, but still clickable
  const effectiveBg = disabled ? '#F3F4F6' : dimmed ? '#F9FAFB' : config.bgColor
  const effectiveBorder = disabled ? '#D1D5DB' : dimmed ? '#D1D5DB' : config.color
  const effectiveIconBg = disabled ? '#E5E7EB' : dimmed ? '#9CA3AF' : config.color
  const effectiveLabelColor = disabled ? '#9CA3AF' : dimmed ? '#9CA3AF' : config.color
  const effectiveSubtitleColor = disabled || dimmed ? '#9CA3AF' : '#6B7280'

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
        minHeight: dimmed ? 90 : 110,
        backgroundColor: effectiveBg,
        border: `2px solid ${effectiveBorder}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : dimmed ? 0.65 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s ease',
        boxShadow: pressed || disabled || dimmed
          ? 'none'
          : `0 3px 10px ${config.color}33`,
        textAlign: 'left',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        gap: 14,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: dimmed ? 42 : 52,
          height: dimmed ? 42 : 52,
          borderRadius: '50%',
          backgroundColor: effectiveIconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: dimmed ? 18 : type === 'KOMMEN' || type === 'GEHEN' ? 22 : 20,
          color: '#FFFFFF',
          flexShrink: 0,
          fontWeight: 700,
          transition: 'width 0.2s, height 0.2s',
        }}
      >
        {config.icon}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: dimmed ? 15 : 17,
            fontWeight: 700,
            color: effectiveLabelColor,
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {config.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: effectiveSubtitleColor,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
        {dimmed && !disabled && (
          <div
            style={{
              fontSize: 11,
              color: '#B45309',
              fontWeight: 500,
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            ⚠ Reihenfolge beachten
          </div>
        )}
      </div>

      {/* Right indicator */}
      <div
        style={{
          fontSize: 20,
          color: disabled ? '#D1D5DB' : dimmed ? '#D1D5DB' : config.color,
          flexShrink: 0,
          fontWeight: 300,
        }}
      >
        {disabled ? '🔒' : dimmed ? '!' : '›'}
      </div>
    </button>
  )
}
