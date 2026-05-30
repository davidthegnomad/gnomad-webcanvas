import { Separator } from 'react-resizable-panels';

interface ResizeHandleProps {
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export default function ResizeHandle({ direction = 'horizontal', className = '' }: ResizeHandleProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <Separator
      className={`group relative flex items-center justify-center
        ${isHorizontal ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'}
        bg-[#1b1f27] hover:bg-indigo-500/30 active:bg-indigo-500/50
        transition-colors duration-150 ${className}`}
    >
      <div
        className={`rounded-full bg-[#30363d] group-hover:bg-indigo-400 group-active:bg-indigo-300 transition-colors
          ${isHorizontal ? 'w-0.5 h-8' : 'h-0.5 w-8'}`}
      />
    </Separator>
  );
}
