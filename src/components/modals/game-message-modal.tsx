
import type { TurnState } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface GameMessageModalProps {
  turnState: TurnState;
  onClose: () => void;
}

export function GameMessageModal({ turnState, onClose }: GameMessageModalProps) {
  if (turnState.type !== 'SHOW_MESSAGE') return null;

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{turnState.message.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {turnState.message.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose}>OK</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
