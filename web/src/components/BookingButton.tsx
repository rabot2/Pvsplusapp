import { useState } from 'react'
import type { BookingType } from '../types'
import { bookingConfig } from '../theme'

interface BookingButtonProps {
  type: BookingType
  onPress: () => void
  disabled: boolean
  lastBookingTime?: string
}

export default function BookingButton({
  type,
  onPress,
  disabled,
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
        minHeight: 110,
        backgroundColor: disabled ? '#F3F4F6' : config.bgColor,
        border: `2px solid ${disabled ? '#D1D5DB' : config.color}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s ease',
        boxShadow: pressed
          ? 'none'
          : disabled
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
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: disabled ? '#E5E7EB' : config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: type === 'KOMMEN' || type === 'GEHEN' ? 22 : 20,
          color: '#FFFFFF',
          flexShrink: 0,
          fontWeight: 700,
        }}
      >
        {config.icon}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: disabled ? '#9CA3AF' : config.color,
            lineHeight: 1.2,
            marginBottom: 5,
          }}
        >
          {config.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: disabled ? '#9CA3AF' : '#6B7280',
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Right indicator */}
      <div
        style={{
          fontSize: 20,
          color: disabled ? '#D1D5DB' : config.color,
          flexShrink: 0,
          fontWeight: 300,
        }}
      >
        {disabled ? '🔒' : '›'}
      </div>
    </button>
  )
}
