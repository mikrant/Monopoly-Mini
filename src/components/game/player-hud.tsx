
'use client';
import { useEffect, useRef, forwardRef } from 'react';
import type { Player, LastEvent, TurnState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dice } from './dice';
import { Separator } from '../ui/separator';
import { CarIcon, DogIcon, HatIcon, ShipIcon, ShoeIcon, ThimbleIcon } from '../icons/player-pieces';
import { cn } from '@/lib/utils';
import { Building, RotateCcw, Gem, Handshake, Home, UserCheck, Wallet } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PlayerHUDProps {
  players: Player[];
  currentPlayer: Player | undefined;
  turnState: TurnState;
  dice: [number, number];
  onRollDice: () => void;
  isRolling: boolean;
  onEndTurn: () => void;
  onResetGame: () => void;
  log: string[];
  lastEvent: LastEvent | null;
  onManageProperties: () => void;
  onTrade: () => void;
  onJailAction: (action: 'pay' | 'roll' | 'card') => void;
  onPlayerClick: (player: Player) => void;
}

const pieceIcon = {
    car: CarIcon,
    hat: HatIcon,
    ship: ShipIcon,
    dog: DogIcon,
    shoe: ShoeIcon,
    thimble: ThimbleIcon,
};

export function PlayerHUD({
  players,
  currentPlayer,
  turnState,
  dice,
  onRollDice,
  isRolling,
  onEndTurn,
  onResetGame,
  log,
  lastEvent,
  onManageProperties,
  onTrade,
  onJailAction,
  onPlayerClick,
}: PlayerHUDProps) {
    const canRoll = turnState.type === 'AWAITING_ROLL';
    const canEndTurn = turnState.type === 'TURN_ENDED';
    const isInJail = turnState.type === 'AWAITING_JAIL_ACTION';
    const canManage = turnState.type === 'AWAITING_ROLL' || turnState.type === 'TURN_ENDED';

    const logScrollAreaRef = useRef<HTMLDivElement>(null);
    const playerRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (logScrollAreaRef.current) {
            const viewport = logScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [log]);
    
    useEffect(() => {
        if (currentPlayer && playerRefs.current[currentPlayer.id]) {
            playerRefs.current[currentPlayer.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentPlayer]);


  const PlayerItem = forwardRef<HTMLDivElement, { player: Player, isCurrent: boolean }>(({ player, isCurrent }, ref) => {
    const Icon = pieceIcon[player.piece];
    return (
        <div
          ref={ref}
          className={cn("flex items-center gap-2 p-1.5 rounded-md cursor-pointer hover:bg-muted", isCurrent && "bg-primary/10")}
          onClick={() => onPlayerClick(player)}
        >
            <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: player.color }}>
                <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-sm">{player.name} {isCurrent && "(Current)"}</p>
                <p className="text-xs text-muted-foreground">${player.money}</p>
            </div>
             <div className="flex items-center gap-1 text-muted-foreground" title="Get Out of Jail Free Cards">
                <UserCheck className="h-3 w-3" />
                <span className="text-xs">{player.getOutOfJailCards}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground" title="Properties Owned">
                <Building className="h-3 w-3" />
                <span className="text-xs">{player.properties.length + player.railroads.length + player.utilities.length}</span>
            </div>
            {player.bankrupt && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Bankrupt</Badge>}
            {player.inJail && <Badge variant="outline" className="text-[10px] px-1.5 py-0">In Jail</Badge>}
        </div>
    )
  });
  PlayerItem.displayName = "PlayerItem";

  const renderJailActions = () => {
    return (
      <div className="grid grid-cols-1 gap-1.5 w-full">
        <p className="text-center text-xs font-medium text-muted-foreground">You are in jail. What will you do?</p>
        <Button size="sm" onClick={() => onJailAction('roll')} disabled={isRolling}>
            <Gem />
            <span>{isRolling ? "Rolling..." : "Roll for Doubles"}</span>
        </Button>
        <Button size="sm" onClick={() => onJailAction('pay')} disabled={isRolling || currentPlayer!.money < 50}>
            <Wallet />
            <span>Pay $50 Fine</span>
        </Button>
        <Button size="sm" onClick={() => onJailAction('card')} disabled={isRolling || currentPlayer!.getOutOfJailCards === 0}>
            <UserCheck />
            <span>Use Card</span>
        </Button>
      </div>
    );
  }

  const renderNormalActions = () => {
    return (
      <div className="grid grid-cols-2 gap-1.5 w-full">
          <Button size="sm" onClick={onRollDice} disabled={!canRoll || isRolling}>
              <Gem />
              <span>{isRolling ? "Rolling..." : "Roll Dice"}</span>
          </Button>
           <Button size="sm" onClick={onEndTurn} disabled={!canEndTurn} variant="secondary">
              End Turn
          </Button>
           <Button size="sm" onClick={onManageProperties} disabled={!canManage}>
              <Home />
              <span>Manage</span>
          </Button>
          <Button size="sm" onClick={onTrade} disabled={!canManage}>
              <Handshake/>
              <span>Trade</span>
          </Button>
      </div>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="flex-row items-center justify-between p-3">
        <CardTitle className="font-headline text-xl">
          {currentPlayer ? `${currentPlayer.name}'s Turn` : "Game Over"}
        </CardTitle>
        <Button onClick={onResetGame} variant="ghost" size="icon" className="h-7 w-7">
            <RotateCcw className="h-4 w-4"/>
            <span className="sr-only">Reset Game</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-3 overflow-hidden p-3 pt-0">
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted p-2">
            <h3 className="text-xs font-medium text-muted-foreground">Dice</h3>
            <Dice values={dice} isRolling={isRolling}/>
            {isInJail ? renderJailActions() : renderNormalActions()}
        </div>

        <Separator/>
        
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted p-2">
          <h3 className="text-xs font-medium text-muted-foreground">{lastEvent?.title || 'Last Event'}</h3>
          <p className="text-xs text-center text-foreground h-4">{lastEvent?.description || 'Game started!'}</p>
        </div>
        
        <Separator/>

        <div className="flex flex-col">
            <h3 className="mb-1 text-sm font-semibold">Players</h3>
            <ScrollArea className="flex-grow pr-2 h-40">
                <div className="flex flex-col gap-1.5">
                    {players.map((p) => (
                        <PlayerItem 
                            key={p.id} 
                            player={p} 
                            isCurrent={p.id === currentPlayer?.id} 
                            ref={(el) => playerRefs.current[p.id] = el}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
        
        <Separator/>
        
        <div className="flex flex-col flex-grow min-h-0">
            <h3 className="mb-1 text-sm font-semibold">Game Log</h3>
            <ScrollArea className="flex-grow" ref={logScrollAreaRef}>
                <div className="flex flex-col-reverse gap-1.5 text-xs text-muted-foreground pr-2">
                    {[...log].map((entry, i) => (
                        <p key={i}>{entry}</p>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
