
'use client';
import type { Player, BoardSpace } from '@/lib/types';
import { BoardSpaceContent } from './board-space-content';
import { PlayerPiece } from './player-piece';
import { cn } from '@/lib/utils';

interface BoardProps {
  players: Player[];
  board: BoardSpace[];
  onPropertyClick: (space: BoardSpace) => void;
}

const getGridPosition = (index: number) => {
  if (index >= 0 && index <= 10) {
    // Bottom row
    return { gridRow: '11', gridColumn: `${11 - index} / span 1` };
  }
  if (index > 10 && index < 20) {
    // Left row
    return { gridRow: `${11 - (index - 10)} / span 1`, gridColumn: '1' };
  }
  if (index >= 20 && index <= 30) {
    // Top row
    return { gridRow: '1', gridColumn: `${1 + (index - 20)} / span 1` };
  }
  if (index > 30 && index < 40) {
    // Right row
    return { gridRow: `${1 + (index - 30)} / span 1`, gridColumn: '11' };
  }
  return {};
};


export function Board({ players, board, onPropertyClick }: BoardProps) {
  const isClickable = (space: BoardSpace) => {
    return space.type === 'property' || space.type === 'railroad' || space.type === 'utility';
  }

  return (
    <div className="relative aspect-square h-full w-full bg-background p-1">
      <div className="grid h-full w-full grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-px">
        {board.map((space, index) => {
           const {gridRow, gridColumn} = getGridPosition(index);
           return (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center rounded-sm border bg-card", 
                isClickable(space) && "cursor-pointer hover:bg-muted"
              )}
              style={{gridRow, gridColumn}}
              onClick={() => onPropertyClick(space)}
            >
              <BoardSpaceContent 
                space={space} 
                ownerId={(space as any).ownerId} 
                players={players} 
               />
            </div>
          )}
        )}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex items-center justify-center rounded-md border-2 border-primary bg-primary/10">
            <h1 className="font-headline text-4xl font-bold text-primary/80 transform -rotate-45" style={{ textShadow: '2px 2px 4px hsl(var(--primary) / 0.2)'}}>
                Monopoly Mini
            </h1>
        </div>
        {players.map((player) => !player.bankrupt && <PlayerPiece key={player.id} player={player} />)}
      </div>
    </div>
  );
}
