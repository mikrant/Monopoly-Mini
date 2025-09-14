
'use client';
import { useState } from 'react';
import type { PlayerPiece } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CarIcon, DogIcon, HatIcon, ShipIcon, ShoeIcon, ThimbleIcon } from '../icons/player-pieces';
import { Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import Link from 'next/link';

interface PlayerSetup {
  name: string;
  piece: PlayerPiece;
}

interface GameSetupProps {
  onGameStart: (options: { players: PlayerSetup[], startingMoney: number }) => void;
  open?: boolean;
}

const PIECE_OPTIONS: { value: PlayerPiece; label: string; icon: React.ElementType }[] = [
  { value: 'car', label: 'Car', icon: CarIcon },
  { value: 'hat', label: 'Hat', icon: HatIcon },
  { value: 'ship', label: 'Ship', icon: ShipIcon },
  { value: 'dog', label: 'Dog', icon: DogIcon },
  { value: 'shoe', label: 'Shoe', icon: ShoeIcon },
  { value: 'thimble', label: 'Thimble', icon: ThimbleIcon },
];

export function GameSetup({ onGameStart, open = true }: GameSetupProps) {
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: 'Player 1', piece: 'car' },
    { name: 'Player 2', piece: 'hat' },
  ]);
  const [startingMoney, setStartingMoney] = useState(1500);

  const handlePlayerChange = (index: number, field: keyof PlayerSetup, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };
  
  const getAvailablePieces = (currentIndex: number) => {
      const usedPieces = players.map((p, i) => i !== currentIndex ? p.piece : null).filter(Boolean);
      return PIECE_OPTIONS.filter(p => !usedPieces.includes(p.value));
  }

  const addPlayer = () => {
    if (players.length < 6) {
      const availablePiece = PIECE_OPTIONS.find(p => !players.some(pl => pl.piece === p.value));
      setPlayers([
        ...players,
        { name: `Player ${players.length + 1}`, piece: availablePiece?.value || 'car' },
      ]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };
  
  const handleStart = () => {
    onGameStart({ players: players.map(p => ({...p, type: 'human'})), startingMoney });
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Game Setup</DialogTitle>
          <DialogDescription>
            Configure players and game settings for your new game.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <h4 className="font-medium text-sm">Players (2-6)</h4>
          {players.map((player, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-6">
                <Label htmlFor={`name-${index}`} className="sr-only">Name</Label>
                <Input
                  id={`name-${index}`}
                  value={player.name}
                  onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                  className="w-full h-9"
                />
              </div>
              <div className="col-span-5">
                <Select
                  value={player.piece}
                  onValueChange={(value) => handlePlayerChange(index, 'piece', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select piece" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePieces(index).map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    disabled={players.length <= 2}
                    className="w-full text-destructive hover:text-destructive h-9"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
           {players.length < 6 && (
            <Button variant="outline" onClick={addPlayer}>
              Add Player
            </Button>
          )}
          <Separator className="my-2" />
          <h4 className="font-medium text-sm">Game Rules</h4>
          <div className="grid gap-2">
            <Label htmlFor="starting-money">Starting Money</Label>
            <Input 
                id="starting-money" 
                type="number" 
                value={startingMoney} 
                onChange={e => setStartingMoney(parseInt(e.target.value) || 1500)}
                step={100}
                min={0}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
            <Link href="/rules" passHref target="_blank">
                <Button variant="outline" asChild>
                    <a>Rules</a>
                </Button>
            </Link>
          <Button type="button" onClick={handleStart}>
            Start Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
