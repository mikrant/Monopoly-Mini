
import {
  Gem,
  HelpCircle,
  Train,
  Lightbulb,
  Banknote,
  Landmark,
  ParkingCircle,
  Send,
  Siren,
  Wrench,
} from 'lucide-react';
import type { BoardSpace, Player, PropertyColor } from '@/lib/types';
import { cn } from '@/lib/utils';
import { JailIcon } from '../icons/jail-icon';
import './board-space-content.css';

interface BoardSpaceContentProps {
  space: BoardSpace;
  ownerId?: number;
  players: Player[];
}

const PROPERTY_TEXT_COLORS: Record<PropertyColor, string> = {
  brown: 'text-[#955436]',
  'light-blue': 'text-[#00AEEF]',
  pink: 'text-[#d93a96]',
  orange: 'text-[#f7941d]',
  red: 'text-[#ed1b24]',
  yellow: 'text-[#fef200]',
  green: 'text-[#1fb25a]',
  'dark-blue': 'text-[#0072bb]',
};

export function BoardSpaceContent({ space, ownerId, players }: BoardSpaceContentProps) {
  const owner = players.find((p) => p.id === ownerId);

  const renderHouses = () => {
    if (space.type !== 'property' || !space.houses || space.houses === 0) return null;
    
    const houseContainerClasses = "absolute flex gap-px z-10 top-0.5 left-1/2 -translate-x-1/2 flex-row";
    const houseClasses = "h-1 w-1.5 rounded-sm bg-green-600";
    const hotelClasses = "h-1 w-6 rounded-sm bg-red-600";

    if (space.houses === 5) {
        return (
            <div className={houseContainerClasses}>
                <div className={hotelClasses} style={{ boxShadow: '0 0 1px black' }} />
            </div>
        )
    }

    return (
      <div className={houseContainerClasses}>
        {Array.from({ length: space.houses }).map((_, i) => (
          <div key={i} className={houseClasses} style={{ boxShadow: '0 0 1px black' }} />
        ))}
      </div>
    );
  };
  
  const renderMortgaged = () => {
    if ('mortgaged' in space && space.mortgaged) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <Banknote className="h-5 w-5 text-red-500 transform -rotate-45" />
        </div>
      )
    }
    return null;
  }

  const getBorderStyle = () => {
    if (owner) {
      return { borderColor: owner.color, borderWidth: '2px', zIndex: 5 };
    }
    return { };
  }
  
  const CornerSpace = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
      <div className="flex flex-col items-center justify-center h-full w-full p-1 text-center text-[10px]">
        <span className="font-bold uppercase leading-tight">{text}</span>
        {icon}
      </div>
  )
  
  const renderContent = () => {
    const commonTextStyle = "text-center text-[9px] leading-tight";
    const iconSize = "h-5 w-5";
    const cornerIconSize = "h-8 w-8";
    
    const contentContainerClasses = cn("bg-card flex flex-col justify-center items-center p-0.5 flex-grow w-full", commonTextStyle);

    switch (space.type) {
      case 'property':
        return (
          <div className={cn("bg-card flex-grow flex flex-col justify-around items-center p-0.5 w-full text-center", commonTextStyle)}>
              <span className={cn("font-bold uppercase text-center", PROPERTY_TEXT_COLORS[space.color])}>{space.name}</span>
              <span>${space.price}</span>
          </div>
        );
      case 'railroad':
        return (
          <div className={cn("flex flex-col items-center justify-around h-full p-1 gap-0.5 text-center", commonTextStyle)}>
            <span className="font-bold uppercase text-center">{space.name}</span>
            <Train className={cn(iconSize, "text-red-400")} />
            <span>${space.price}</span>
          </div>
        );
      case 'utility':
        const UtilityIcon = space.name.includes("Electric") ? Lightbulb : Wrench;
        return (
          <div className={cn("flex flex-col items-center justify-around h-full p-1 gap-0.5 text-center", commonTextStyle)}>
            <span className="font-bold uppercase">{space.name}</span>
            <UtilityIcon className={cn(iconSize, "text-yellow-400")} />
            <span>${space.price}</span>
          </div>
        );
      case 'chance':
        return (
          <div className="flex flex-col items-center justify-around h-full p-1 text-center text-xs">
            <span className={cn("font-bold uppercase text-[10px]", commonTextStyle)}>Chance</span>
            <HelpCircle className={cn(cornerIconSize, "text-blue-500")} />
          </div>
        );
      case 'community-chest':
        return (
          <div className="flex flex-col items-center justify-around h-full p-1 text-center text-xs">
            <span className={cn("font-bold uppercase text-[10px]", commonTextStyle)}>Community Chest</span>
            <Landmark className={cn(cornerIconSize, "text-yellow-500")} />
          </div>
        );
      case 'tax':
        return (
          <div className={cn("flex flex-col items-center justify-around h-full p-1 text-center", commonTextStyle)}>
            <span className="font-bold uppercase">{space.name}</span>
            {space.name === 'Income Tax' ? <Banknote className={cn("my-0.5", iconSize, "text-yellow-400")} /> : <Gem className={cn("my-0.5", iconSize, "text-yellow-400")} />}
            <span>Pay ${space.cost}</span>
          </div>
        );
      case 'corner':
        if (space.name === 'Go') return <CornerSpace icon={<Send className={cn(cornerIconSize, "rotate-[225deg] text-red-600")} />} text="Collect $200 Salary As You Pass" />;
        if (space.name === 'Jail') return <CornerSpace icon={<JailIcon className={cn(cornerIconSize, "text-orange-500")} />} text="In Jail / Just Visiting" />;
        if (space.name === 'Free Parking') return <CornerSpace icon={<ParkingCircle className={cn(cornerIconSize, "text-green-500")} />} text="Free Parking" />;
        if (space.name === 'Go to Jail') return <CornerSpace icon={<Siren className={cn(cornerIconSize, "text-red-600")} />} text="Go To Jail" />;
        return null;
      default:
        return null;
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden border border-border bg-card"
      style={getBorderStyle()}
    >
      {renderContent()}
      {renderHouses()}
      {renderMortgaged()}
    </div>
  );
}
