
import type { TurnState, BoardSpace } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface ActionModalProps {
  turnState: TurnState;
  board: BoardSpace[];
  onAction: (decision: 'buy' | 'skip') => void;
}

export function ActionModal({ turnState, board, onAction }: ActionModalProps) {
  if (turnState.type !== 'AWAITING_BUY_PROMPT') return null;

  const space = board[turnState.spaceIndex];
  if(space.type !== 'property' && space.type !== 'railroad' && space.type !== 'utility') return null;

  return (
    <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buy Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to buy {space.name} for ${space.price}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={() => onAction('skip')}>
              Skip
            </Button>
            <Button onClick={() => onAction('buy')}>Buy</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
