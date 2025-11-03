import { useMemo, useState } from 'react';
import { Popover } from 'antd';
import { EMOJIS } from '../utils/emoji.ts';

interface EmojiPickerProps {
  value: string;
  onSelect: (emoji: string) => void;
  label?: string;
}

const EMOJI_GRID_COLUMNS = 8;

export function EmojiPicker({ value, onSelect, label }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const groupedEmojis = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < EMOJIS.length; i += EMOJI_GRID_COLUMNS) {
      rows.push(EMOJIS.slice(i, i + EMOJI_GRID_COLUMNS));
    }
    return rows;
  }, []);

  return (
    <div className='flex flex-col gap-2'>
      {label ? <span className='text-sm font-semibold text-gray-700'>{label}</span> : null}
      <Popover
        trigger='click'
        placement='bottom'
        open={open}
        onOpenChange={setOpen}
        overlayInnerStyle={{ padding: 12, borderRadius: 12 }}
        content={
          <div className='flex flex-col gap-2 max-h-56 overflow-y-auto emoji-picker-grid'>
            {groupedEmojis.map((row, rowIndex) => (
              <div key={rowIndex} className='flex gap-2 justify-center'>
                {row.map((emoji) => (
                  <button
                    key={emoji}
                    type='button'
                    onClick={() => {
                      onSelect(emoji);
                      setOpen(false);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors hover:bg-blue-100 ${
                      emoji === value
                        ? 'bg-blue-500 text-white hover:bg-blue-500'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ))}
          </div>
        }
      >
        <button
          type='button'
          className='flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-sm hover:border-blue-200'
        >
          <span className='text-xl'>{value}</span>
          <span>Seleccionar emoji</span>
        </button>
      </Popover>
    </div>
  );
}
