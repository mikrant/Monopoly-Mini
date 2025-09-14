

export type PlayerType = 'human';

export type PropertyColor =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue';

export type SpaceType =
  | 'property'
  | 'railroad'
  | 'utility'
  | 'chance'
  | 'community-chest'
  | 'tax'
  | 'corner';

export interface BaseBoardSpace {
  type: SpaceType;
  name: string;
}

export interface PropertySpace extends BaseBoardSpace {
  type: 'property';
  price: number;
  rent: number[];
  color: PropertyColor;
  houseCost: number;
  ownerId?: number;
  houses: number;
  mortgaged: boolean;
}

export interface RailroadSpace extends BaseBoardSpace {
  type: 'railroad';
  price: number;
  ownerId?: number;
  mortgaged: boolean;
}

export interface UtilitySpace extends BaseBoardSpace {
  type: 'utility';
  price: number;
  ownerId?: number;
  mortgaged: boolean;
}

export interface TaxSpace extends BaseBoardSpace {
  type: 'tax';
  cost: number;
}

export type BoardSpace =
  | PropertySpace
  | RailroadSpace
  | UtilitySpace
  | TaxSpace
  | (BaseBoardSpace & {
      type: 'chance' | 'community-chest' | 'corner';
    });
    
export type PlayerPiece = 'car' | 'hat' | 'ship' | 'dog' | 'shoe' | 'thimble';

export interface Transaction {
  description: string;
  amount: number;
}

export interface Player {
  id: number;
  name: string;
  type: PlayerType;
  piece: PlayerPiece;
  money: number;
  position: number;
  properties: number[];
  railroads: number[];
  utilities: number[];
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  color: string;
  bankrupt: boolean;
  transactions: Transaction[];
}

export type Card = 
    | { type: 'advance', text: string, position: number, relative?: boolean }
    | { type: 'advance_nearest', text: string, target: 'utility' | 'railroad', rentMultiplier?: number}
    | { type: 'receive', text: string, amount: number }
    | { type: 'pay', text: string, amount: number }
    | { type: 'receive_per_player', text: string, amount: number }
    | { type: 'pay_per_player', text: string, amount: number }
    | { type: 'pay_buildings', text: string, perHouse: number, perHotel: number }
    | { type: 'go_to_jail', text: string }
    | { type: 'get_out_of_jail', text: string };

export interface Debt {
    debtorId: number;
    creditorId?: number;
    amount: number;
}

export type TurnState =
  | { type: 'AWAITING_ROLL' }
  | { type: 'PROCESSING' } // Player has rolled, engine is processing move
  | { type: 'AWAITING_BUY_PROMPT'; spaceIndex: number }
  | { type: 'AWAITING_JAIL_ACTION' }
  | { type: 'AWAITING_DEBT_PAYMENT'; debt: Debt }
  | { type: 'TURN_ENDED' }
  | { type: 'MANAGING_PROPERTIES', previousState: TurnState }
  | { type: 'PROPOSING_TRADE', previousState: TurnState }
  | { type: 'AWAITING_TRADE_RESPONSE'; offer: TradeOffer, previousState: TurnState }
  | { type: 'AWAITING_CARD_ACTION'; card: Card, isChance: boolean }
  | { type: 'GAME_OVER'; winner: Player };

export interface GameState {
  players: Player[];
  board: BoardSpace[];
  currentPlayerIndex: number;
  turnState: TurnState;
  doublesCount: number;
  chanceDeck: Card[];
  communityChestDeck: Card[];
  chanceDiscard: Card[];
  communityChestDiscard: Card[];
  winner: Player | null;
}

export interface TradeOffer {
    fromPlayerId: number;
    toPlayerId: number;
    propertiesOffered: number[];
    propertiesRequested: number[];
    moneyOffered: number;
    moneyRequested: number;
    cardsOffered: number; // Count of Get Out of Jail Free cards
    cardsRequested: number;
}

export interface LastEvent {
    title: string;
    description: string;
}
