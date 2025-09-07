
'use client';
import { cn } from '@/lib/utils';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import React from 'react';

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface DiceProps {
  values: [number, number];
  isRolling?: boolean;
}

const SingleDie = ({ value, isRolling }: { value: number, isRolling?: boolean }) => {
  const Icon = diceIcons[value - 1];
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border-2 bg-card shadow-sm sm:h-12 sm:w-12',
        isRolling && 'animate-roll'
      )}
    >
      {Icon && <Icon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />}
    </div>
  );
};

export function Dice({ values, isRolling }: DiceProps) {
  return (
    <div className="flex gap-2">
      <SingleDie value={values[0]} isRolling={isRolling} />
      <SingleDie value={values[1]} isRolling={isRolling} />
    </div>
  );
}
