
import type { TurnState, Player } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface GameOverModalProps {
  turnState: TurnState;
  winner: Player | null;
  onRestart: () => void;
}

export function GameOverModal({ turnState, winner, onRestart }: GameOverModalProps) {
  const isGameOver = turnState?.type === 'GAME_OVER';
  
  if (!isGameOver || !winner) return null;
  
  return (
    <AlertDialog open={isGameOver}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Game Over!</AlertDialogTitle>
          <AlertDialogDescription>
            Congratulations, {winner.name}! You have won the game.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onRestart}>Play Again</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
