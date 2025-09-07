
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { HelpCircle, Landmark } from 'lucide-react';
import type { TurnState, Card as CardType } from '@/lib/types';


interface CardModalProps {
  turnState: TurnState;
  onClose: (card: CardType) => void;
}

export function CardModal({ turnState, onClose }: CardModalProps) {
  if (turnState.type !== 'AWAITING_CARD_ACTION') {
    return null;
  }

  const { card, isChance } = turnState;
  const text = card.text;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose(card)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isChance ? <HelpCircle className="text-blue-500"/> : <Landmark className="text-yellow-500" />}
             {isChance ? 'Chance Card' : 'Community Chest'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <Card className="text-center">
            <CardContent className="p-6 text-lg">
                <p>{text}</p>
            </CardContent>
        </Card>
        <AlertDialogFooter>
          <Button onClick={() => onClose(card)}>OK</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
