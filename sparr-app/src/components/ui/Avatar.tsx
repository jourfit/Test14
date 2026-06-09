import { cn, getInitials } from '../../lib/utils'

interface AvatarProps {
  name: string
  imageUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  verified?: boolean
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-[0.6rem]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export default function Avatar({ name, imageUrl, size = 'md', verified, className }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          sizes[size],
          'rounded-full flex items-center justify-center font-display font-bold',
          imageUrl ? '' : 'bg-gradient-to-br from-neon/20 to-energy/10 border border-neon/20 text-neon'
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-neon rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-sparr-black" viewBox="0 0 8 8" fill="currentColor">
            <path d="M7 1.5L3 6 1 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}
