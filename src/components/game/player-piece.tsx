import type { Player } from '@/lib/types';
import { CarIcon, DogIcon, HatIcon, ShipIcon, ShoeIcon, ThimbleIcon } from '../icons/player-pieces';
import { cn } from '@/lib/utils';

interface PlayerPieceProps {
  player: Player;
}

const pieceIcon = {
  car: CarIcon,
  hat: HatIcon,
  ship: ShipIcon,
  dog: DogIcon,
  shoe: ShoeIcon,
  thimble: ThimbleIcon,
};

// Grid is 11x11, board spaces are on the outside. This gives percent from top/left of parent.
// Each cell is 1/11th = 9.09% of the width/height.
const getPositionStyles = (index: number) => {
  const cellSize = 100 / 11;
  let top = 0, left = 0;

  if (index >= 0 && index <= 10) { // Bottom row
    top = 100 - (cellSize / 2);
    left = 100 - (cellSize * index) - (cellSize/2);
  }
  if (index > 10 && index < 20) { // Left row
      left = (cellSize/2);
      top = 100 - (cellSize * (index - 10)) - (cellSize/2);
  }
  if (index >= 20 && index <= 30) { // Top row
      top = (cellSize/2);
      left = (cellSize * (index - 20)) + (cellSize/2);
  }
  if (index > 30 && index < 40) { // Right row
      left = 100 - (cellSize/2);
      top = (cellSize * (index - 30)) + (cellSize/2);
  }
  
  return { top: `${top}%`, left: `${left}%`};
};


export function PlayerPiece({ player }: PlayerPieceProps) {
  const Icon = pieceIcon[player.piece];
  const positionStyle = getPositionStyles(player.position);
  // Add a small random offset to prevent perfect overlap
  const offsetX = (player.id * 5 - 10);
  const offsetY = (player.id % 2 === 0 ? player.id * 4 : player.id * -4);

  return (
    <div
      className="absolute z-10 h-[5.5%] w-[5.5%] -translate-x-1/2 -translate-y-1/2 transform rounded-full transition-all duration-150 ease-in-out"
      style={{
        ...positionStyle,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
      }}
    >
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: player.color }}>
            {Icon && <Icon className="h-3/4 w-3/4 text-white" />}
        </div>
    </div>
  );
}
