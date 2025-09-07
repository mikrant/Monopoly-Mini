
'use client';
import { useMemo } from 'react';
import type { TurnState, BoardSpace, Player, PropertySpace } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { PROPERTY_COLORS } from '@/lib/consts';
import { Badge } from '../ui/badge';
import { Home, AlertTriangle } from 'lucide-react';

interface ManagePropertyModalProps {
  turnState: TurnState;
  player: Player | undefined;
  board: BoardSpace[];
  onManageProperty: (spaceIndex: number, action: 'buy_house' | 'sell_house' | 'mortgage' | 'unmortgage') => void;
  onClose: () => void;
  onDeclareBankruptcy: () => void;
}

export function ManagePropertyModal({ turnState, player, board, onManageProperty, onClose, onDeclareBankruptcy }: ManagePropertyModalProps) {
  const isManaging = turnState?.type === 'MANAGING_PROPERTIES';
  const isPayingDebt = turnState?.type === 'AWAITING_DEBT_PAYMENT';
  
  if (!player || (!isManaging && !isPayingDebt)) return null;

  const playerProperties = useMemo(() => {
    return player.properties.map(pIndex => board[pIndex] as PropertySpace)
      .concat(player.railroads.map(pIndex => board[pIndex]))
      .concat(player.utilities.map(pIndex => board[pIndex]));
  }, [player, board]);

  const canBuyHouse = (space: PropertySpace) => {
    const colorGroup = board.filter(s => s.type === 'property' && s.color === space.color);
    return colorGroup.every(s => (s as any).ownerId === player.id);
  }

  const getPropertyIndex = (space: BoardSpace) => {
    return board.findIndex(s => s.name === space.name);
  }

  const canDeclareBankruptcy = useMemo(() => {
    if (turnState?.type !== 'AWAITING_DEBT_PAYMENT') return false;

    const liquidatableAssetsValue = playerProperties.reduce((total, prop) => {
        if ('mortgaged' in prop && !prop.mortgaged) {
            total += prop.price / 2;
        }
        if (prop.type === 'property' && prop.houses > 0) {
            total += prop.houses * (prop.houseCost / 2);
        }
        return total;
    }, 0);

    return player.money + liquidatableAssetsValue < turnState.debt.amount;
  }, [player, playerProperties, turnState]);
  
  const debt = isPayingDebt ? turnState.debt : null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isPayingDebt && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Manage Properties</DialogTitle>
          <DialogDescription asChild>
            <div>
             {debt ? (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-md border-2 border-destructive bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive"/>
                    <div className="text-destructive font-semibold">
                        You owe ${debt.amount}. You have ${player.money}. You must raise an additional ${debt.amount - player.money}.
                    </div>
                </div>
            ) : (
                `Build houses, mortgage properties, and manage your assets. Current Money: $${player.money}`
            )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 py-4">
            {playerProperties.map((space) => {
              if (space.type !== 'property' && space.type !== 'railroad' && space.type !== 'utility') return null;
              const spaceIndex = getPropertyIndex(space);
              return (
                <Card key={spaceIndex} className={cn("flex flex-col", space.mortgaged && "bg-muted")}>
                  <CardHeader className="p-2">
                     {space.type === 'property' && <div className={cn("h-3 w-full rounded-t-md", PROPERTY_COLORS[space.color])} />}
                     <CardTitle className="text-sm p-1 text-center">{space.name}</CardTitle>
                      {space.mortgaged && <Badge variant="destructive" className="mx-auto text-xs px-1.5 py-0">Mortgaged</Badge>}
                  </CardHeader>
                  <CardContent className="flex-grow p-2">
                    {space.type === 'property' && (
                        <div className="flex flex-col gap-2 text-xs">
                           <div className="flex items-center justify-center gap-1">
                                <Home className="h-4 w-4"/>
                                <span>Houses: {space.houses < 5 ? space.houses : 0}</span>
                                {space.houses === 5 && <span>(Hotel)</span>}
                           </div>
                           <Button 
                             size="sm" 
                             onClick={() => onManageProperty(spaceIndex, 'buy_house')}
                             disabled={isPayingDebt || !canBuyHouse(space) || space.houses >= 5 || player.money < space.houseCost || space.mortgaged}
                             className="h-8 text-xs"
                           >
                             Build House (${space.houseCost})
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline"
                             onClick={() => onManageProperty(spaceIndex, 'sell_house')}
                             disabled={space.houses === 0}
                             className="h-8 text-xs"
                            >
                                Sell House (${space.houseCost / 2})
                            </Button>
                        </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-2 grid">
                     {space.mortgaged ? (
                         <Button 
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onManageProperty(spaceIndex, 'unmortgage')}
                            disabled={isPayingDebt || player.money < (space.price / 2) * 1.1}
                         >
                            Unmortgage (${(space.price / 2) * 1.1})
                         </Button>
                     ) : (
                         <Button 
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onManageProperty(spaceIndex, 'mortgage')}
                            disabled={space.type === 'property' && space.houses > 0}
                        >
                            Mortgage (${space.price / 2})
                        </Button>
                     )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
         {isPayingDebt && (
             <Button variant="destructive" onClick={onDeclareBankruptcy} disabled={!canDeclareBankruptcy}>
                Declare Bankruptcy
             </Button>
         )}
          <Button type="button" onClick={onClose} disabled={isPayingDebt}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
