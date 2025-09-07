
'use client';
import type { BoardSpace, Player } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Building, UserCheck, Wallet, Minus, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerInfoModalProps {
  player: Player | null;
  board: BoardSpace[];
  onClose: () => void;
}

export function PlayerInfoModal({ player, board, onClose }: PlayerInfoModalProps) {
  if (!player) return null;

  const getPlayerProperties = () => {
    return player.properties
      .concat(player.railroads)
      .concat(player.utilities)
      .map(pIndex => board[pIndex]);
  }

  const properties = getPlayerProperties();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl" style={{ color: player.color }}>{player.name}</DialogTitle>
          <DialogDescription>Player Information and Assets</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-2 text-center">
            <Card>
                <CardContent className="p-2">
                    <Wallet className="mx-auto mb-1 h-4 w-4"/>
                    <p className="text-xs text-muted-foreground">Money</p>
                    <p className="font-bold text-base">${player.money}</p>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-2">
                    <Building className="mx-auto mb-1 h-4 w-4"/>
                    <p className="text-xs text-muted-foreground">Properties</p>
                    <p className="font-bold text-base">{properties.length}</p>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-2">
                    <UserCheck className="mx-auto mb-1 h-4 w-4"/>
                    <p className="text-xs text-muted-foreground">Jail Cards</p>
                    <p className="font-bold text-base">{player.getOutOfJailCards}</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
                 <h4 className="font-semibold mb-2 text-sm">Properties Owned</h4>
                <ScrollArea className="h-40 border rounded-md p-2">
                    {properties.length > 0 ? (
                        <ul className="space-y-1">
                            {properties.map(prop => (
                                <li key={prop.name} className="text-xs p-1 rounded-md bg-muted/50 flex justify-between items-center">
                                   <span>{prop.name}</span>
                                   {(prop as any).mortgaged && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Mortgaged</Badge>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No properties owned.</p>
                    )}
                </ScrollArea>
            </TabsContent>
            <TabsContent value="transactions">
                 <h4 className="font-semibold mb-2 text-sm">Financial History</h4>
                  <ScrollArea className="h-40 border rounded-md p-2">
                    {player.transactions.length > 0 ? (
                        <ul className="space-y-1.5">
                            {[...player.transactions].map((t, i) => (
                                <li key={i} className="text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {t.amount > 0 ? <Plus className="h-3 w-3 text-green-500"/> : <Minus className="h-3 w-3 text-red-500"/>}
                                        <span>{t.description}</span>
                                    </div>
                                    <span className={cn("font-mono text-xs", t.amount > 0 ? "text-green-600" : "text-red-600")}>
                                        {t.amount > 0 ? '+' : ''}${Math.abs(t.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-xs text-muted-foreground text-center py-4">No transactions yet.</p>
                    )}
                </ScrollArea>
            </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose} size="sm">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
