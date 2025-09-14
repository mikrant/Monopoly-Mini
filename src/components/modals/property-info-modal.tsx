
'use client';

import type { BoardSpace, Player, PropertySpace } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { PROPERTY_COLORS } from '@/lib/consts';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface PropertyInfoModalProps {
  space: BoardSpace | null;
  owner: Player | undefined;
  onClose: () => void;
}

export function PropertyInfoModal({ space, owner, onClose }: PropertyInfoModalProps) {
  if (!space || (space.type !== 'property' && space.type !== 'railroad' && space.type !== 'utility')) {
    return null;
  }

  const renderRentInfo = () => {
    if (space.type === 'property') {
      return (
        <ul className="space-y-1 text-xs">
          <li className="flex justify-between"><span>Rent</span> <span>${space.rent[0]}</span></li>
          <li className="flex justify-between"><span>With Color Set</span> <span>${space.rent[0] * 2}</span></li>
          <li className="flex justify-between"><span>With 1 House</span> <span>${space.rent[1]}</span></li>
          <li className="flex justify-between"><span>With 2 Houses</span> <span>${space.rent[2]}</span></li>
          <li className="flex justify-between"><span>With 3 Houses</span> <span>${space.rent[3]}</span></li>
          <li className="flex justify-between"><span>With 4 Houses</span> <span>${space.rent[4]}</span></li>
          <li className="flex justify-between"><span>With HOTEL</span> <span className="font-bold">${space.rent[5]}</span></li>
        </ul>
      );
    }
     if (space.type === 'railroad') {
      return (
        <ul className="space-y-1 text-xs">
          <li className="flex justify-between"><span>Rent</span> <span>$25</span></li>
          <li className="flex justify-between"><span>If 2 R.R.'s are owned</span> <span>$50</span></li>
          <li className="flex justify-between"><span>If 3 R.R.'s are owned</span> <span>$100</span></li>
          <li className="flex justify-between"><span>If 4 R.R.'s are owned</span> <span>$200</span></li>
        </ul>
      )
     }
      if (space.type === 'utility') {
      return (
        <div className="text-center text-xs">
            <p>If one utility is owned, rent is 4 times amount shown on dice.</p>
            <p>If both utilities are owned, rent is 10 times amount shown on dice.</p>
        </div>
      )
     }
    return null;
  };
  
  const renderCosts = () => {
       if (space.type !== 'property') return null;
       return (
        <>
            <hr className="my-2"/>
            <ul className="space-y-1 text-xs">
                <li className="flex justify-between"><span>House Cost</span> <span>${space.houseCost}</span></li>
                <li className="flex justify-between"><span>Hotel Cost</span> <span>${space.houseCost}</span></li>
            </ul>
        </>
       )
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader className="items-center">
            {space.type === 'property' && (
                 <div className={cn("h-4 w-full rounded-t-lg mb-1", PROPERTY_COLORS[space.color])} />
            )}
          <DialogTitle className="font-headline text-lg">{space.name}</DialogTitle>
           <DialogDescription className="text-sm" style={{ color: owner?.color }}>
            Owned by: {owner ? owner.name : 'No one'}
          </DialogDescription>
          {space.mortgaged && <Badge variant="destructive" className="text-xs px-1.5 py-0">Mortgaged</Badge>}
        </DialogHeader>
        
        <div className="space-y-2 py-2">
          <h4 className="font-semibold text-center text-sm">Rent Information</h4>
          {renderRentInfo()}
          {renderCosts()}
           <hr className="my-2"/>
            <ul className="space-y-1 text-xs">
                <li className="flex justify-between"><span>Mortgage Value</span> <span>${space.price / 2}</span></li>
            </ul>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} size="sm">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
