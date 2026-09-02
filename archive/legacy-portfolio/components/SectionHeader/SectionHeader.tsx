interface ISectionHeaderProps {
  text: string;
  className?: string;
}

export default function SectionHeader({
  text,
  className
}: ISectionHeaderProps) {
  return (
    <div className={`w-fit ${className}`}>
      <span className='section-header'>{text}</span>

      <div className='bg-muted-foreground mt-0.5 h-0.5 w-2/3 transition-all' />
    </div>
  );
}
