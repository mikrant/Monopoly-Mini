
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
  // This modal is currently not used in the new engine, but kept for potential future use.
  // Example usage: turnState.type === 'SHOW_MESSAGE'
  return null;
}
