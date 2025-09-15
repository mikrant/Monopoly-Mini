
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { TurnState, BoardSpace, Player, TradeOffer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { ArrowRightLeft } from 'lucide-react';

interface TradeModalProps {
  turnState: TurnState;
  players: Player[];
  currentPlayer: Player;
  board: BoardSpace[];
  onProposeTrade: (offer: TradeOffer) => void;
  onRespondToTrade: (offer: TradeOffer, accepted: boolean) => void;
  onClose: () => void;
}

export function TradeModal({
  turnState,
  players,
  currentPlayer,
  board,
  onProposeTrade,
  onRespondToTrade,
  onClose,
}: TradeModalProps) {
  const [tradePartnerId, setTradePartnerId] = useState<number | null>(null);
  const [offer, setOffer] = useState<Omit<TradeOffer, 'fromPlayerId' | 'toPlayerId'>>({
      moneyOffered: 0,
      moneyRequested: 0,
      propertiesOffered: [],
      propertiesRequested: [],
      cardsOffered: 0,
      cardsRequested: 0
  });

  const tradePartner = useMemo(() => players.find(p => p.id === tradePartnerId), [players, tradePartnerId]);

  useEffect(() => {
    if (turnState.type === 'PROPOSING_TRADE') {
      setTradePartnerId(null);
      setOffer({
        moneyOffered: 0,
        moneyRequested: 0,
        propertiesOffered: [],
        propertiesRequested: [],
        cardsOffered: 0,
        cardsRequested: 0
      });
    }
  }, [turnState]);

  const handlePropose = () => {
    if (!tradePartner) return;
    onProposeTrade({
        ...offer,
        fromPlayerId: currentPlayer.id,
        toPlayerId: tradePartner.id
    });
  }
  
  const handleValueChange = (field: keyof typeof offer, value: any) => {
      setOffer(prev => ({...prev, [field]: value}));
  }

  const handlePropertyToggle = (propertyIndex: number, list: 'offered' | 'requested') => {
      const key = list === 'offered' ? 'propertiesOffered' : 'propertiesRequested';
      const currentList = offer[key];
      if (currentList.includes(propertyIndex)) {
          handleValueChange(key, currentList.filter(p => p !== propertyIndex));
      } else {
          handleValueChange(key, [...currentList, propertyIndex]);
      }
  }

  const getPlayerProperties = (player: Player) => {
    return [...player.properties, ...player.railroads, ...player.utilities]
      .map(pIndex => ({ ...board[pIndex], index: pIndex }))
      .filter(p => {
          if (p.type === 'property') {
              const colorGroup = board.filter(s => s.type === 'property' && s.color === p.color);
              return !colorGroup.some(s => s.type === 'property' && s.houses > 0);
          }
          return true;
      });
  }

  const renderTradeBuilder = () => (
     <>
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Propose a Trade</DialogTitle>
          <DialogDescription className="text-sm">Select a player and build your trade offer. Properties in a set with houses cannot be traded.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
            <Label htmlFor="trade-partner" className="text-xs">Trade with:</Label>
            <Select onValueChange={(val) => setTradePartnerId(parseInt(val))} value={tradePartnerId?.toString()}>
                <SelectTrigger id="trade-partner" className="h-9">
                    <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                    {players.filter(p => p.id !== currentPlayer.id && !p.bankrupt).map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {tradePartner && (
                 <div className="grid grid-cols-2 gap-2 h-[45vh]">
                     {/* Current Player's Offer */}
                    <Card className="flex flex-col">
                        <CardHeader className="p-2 border-b">
                            <DialogTitle className="text-base">{currentPlayer.name}'s Offer</DialogTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-2 overflow-y-auto">
                            <div>
                                <Label className="text-xs">Money</Label>
                                <Input type="number" className="h-8" value={offer.moneyOffered} onChange={e => handleValueChange('moneyOffered', Math.min(currentPlayer.money, parseInt(e.target.value) || 0))} max={currentPlayer.money}/>
                            </div>
                             <div>
                                <Label className="text-xs">Properties</Label>
                                <ScrollArea className="h-40 border rounded-md p-1">
                                   {getPlayerProperties(currentPlayer).map(prop => (
                                        <div key={prop.index} className="flex items-center justify-between p-1">
                                            <Label htmlFor={`offer-${prop.index}`} className="text-xs">{prop.name}</Label>
                                            <Switch id={`offer-${prop.index}`} onCheckedChange={() => handlePropertyToggle(prop.index, 'offered')} checked={offer.propertiesOffered.includes(prop.index)} />
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trade Partner's Request */}
                     <Card className="flex flex-col">
                        <CardHeader className="p-2 border-b">
                             <DialogTitle className="text-base">{tradePartner.name}'s Offer</DialogTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-2 overflow-y-auto">
                             <div>
                                <Label className="text-xs">Money</Label>
                                <Input type="number" className="h-8" value={offer.moneyRequested} onChange={e => handleValueChange('moneyRequested', Math.min(tradePartner.money, parseInt(e.target.value) || 0))} max={tradePartner.money}/>
                            </div>
                             <div>
                                <Label className="text-xs">Properties</Label>
                                <ScrollArea className="h-40 border rounded-md p-1">
                                   {getPlayerProperties(tradePartner).map(prop => (
                                        <div key={prop.index} className="flex items-center justify-between p-1">
                                            <Label htmlFor={`request-${prop.index}`} className="text-xs">{prop.name}</Label>
                                            <Switch id={`request-${prop.index}`} onCheckedChange={() => handlePropertyToggle(prop.index, 'requested')} checked={offer.propertiesRequested.includes(prop.index)} />
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            )}
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
            <Button onClick={handlePropose} disabled={!tradePartner} size="sm">Propose Trade</Button>
        </DialogFooter>
     </>
  );
  
  const renderTradeResponse = (offer: TradeOffer) => {
    const proposer = players.find(p => p.id === offer.fromPlayerId)!;
    const receiver = players.find(p => p.id === offer.toPlayerId)!;
    
    const OfferDetail = ({player, money, properties}: {player: Player, money: number, properties: number[]}) => (
        <Card className="p-2">
            <CardHeader className="p-0 mb-1">
              <DialogTitle className="text-base border-b pb-1">{player.name} offers:</DialogTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-28">
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                      {money > 0 && <li>${money}</li>}
                      {properties.map(pIdx => <li key={pIdx}>{board[pIdx].name}</li>)}
                      {properties.length === 0 && money === 0 && <li>Nothing</li>}
                  </ul>
              </ScrollArea>
            </CardContent>
        </Card>
    );

    return (
        <>
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Trade Proposal from {proposer.name}</DialogTitle>
              <DialogDescription className="text-sm">
                {proposer.name} has proposed a trade. Review the offer below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-2 py-2">
                <OfferDetail player={proposer} money={offer.moneyOffered} properties={offer.propertiesOffered} />
                <ArrowRightLeft className="h-6 w-6 mx-auto"/>
                <OfferDetail player={receiver} money={offer.moneyRequested} properties={offer.propertiesRequested} />
            </div>
             <DialogFooter>
                <Button variant="destructive" size="sm" onClick={() => onRespondToTrade(offer, false)}>Reject</Button>
                <Button variant="default" size="sm" onClick={() => onRespondToTrade(offer, true)}>Accept</Button>
            </DialogFooter>
        </>
    )
  }

  if (turnState.type !== 'PROPOSING_TRADE' && turnState.type !== 'AWAITING_TRADE_RESPONSE') return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        {turnState.type === 'PROPOSING_TRADE' ? renderTradeBuilder() : renderTradeResponse(turnState.offer)}
      </DialogContent>
    </Dialog>
  );
}
