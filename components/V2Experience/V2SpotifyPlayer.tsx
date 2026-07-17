import Image from 'next/image';

export default function V2SpotifyPlayer() {
  return (
    <div
      aria-label='Spinning record with album artwork'
      className='absolute bottom-2.5 left-2.5 h-16 w-[104px] sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6'
      role='img'
    >
      <div
        className='absolute top-1/2 right-0 size-16 -translate-y-1/2 animate-[spin_6s_linear_infinite] rounded-full motion-reduce:animate-none'
        style={{
          background:
            'repeating-radial-gradient(circle, transparent 0 3px, rgba(255,255,255,0.08) 3px 4px), conic-gradient(from 20deg, #09090b, #27272a 18%, #09090b 36%, #3f3f46 52%, #09090b 70%, #27272a 88%, #09090b)'
        }}
      >
        <span className='absolute inset-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500' />
        <span className='absolute inset-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950' />
      </div>

      <div className='absolute top-1/2 left-0 size-16 -translate-y-1/2 overflow-hidden rounded-sm'>
        <Image
          fill
          alt=''
          className='object-cover'
          sizes='64px'
          src='/gojo-compressed.png'
        />
      </div>
    </div>
  );
}
