
import type { BoardSpace, PropertyColor, Card } from './types';

export const BOARD_SPACES: BoardSpace[] = [
  { type: 'corner', name: 'Go' },
  { type: 'property', name: 'Mediterranean Avenue', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'brown', houseCost: 50, houses: 0, mortgaged: false },
  { type: 'community-chest', name: 'Community Chest' },
  { type: 'property', name: 'Baltic Avenue', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'brown', houseCost: 50, houses: 0, mortgaged: false },
  { type: 'tax', name: 'Income Tax', cost: 200 },
  { type: 'railroad', name: 'Reading Railroad', price: 200, mortgaged: false },
  { type: 'property', name: 'Oriental Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'light-blue', houseCost: 50, houses: 0, mortgaged: false },
  { type: 'chance', name: 'Chance' },
  { type: 'property', name: 'Vermont Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'light-blue', houseCost: 50, houses: 0, mortgaged: false },
  { type: 'property', name: 'Connecticut Avenue', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'light-blue', houseCost: 50, houses: 0, mortgaged: false },
  
  { type: 'corner', name: 'Jail' },
  { type: 'property', name: 'St. Charles Place', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', houseCost: 100, houses: 0, mortgaged: false },
  { type: 'utility', name: 'Electric Company', price: 150, mortgaged: false },
  { type: 'property', name: 'States Avenue', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', houseCost: 100, houses: 0, mortgaged: false },
  { type: 'property', name: 'Virginia Avenue', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'pink', houseCost: 100, houses: 0, mortgaged: false },
  { type: 'railroad', name: 'Pennsylvania Railroad', price: 200, mortgaged: false },
  { type: 'property', name: 'St. James Place', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', houseCost: 100, houses: 0, mortgaged: false },
  { type: 'community-chest', name: 'Community Chest' },
  { type: 'property', name: 'Tennessee Avenue', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', houseCost: 100, houses: 0, mortgaged: false },
  { type: 'property', name: 'New York Avenue', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'orange', houseCost: 100, houses: 0, mortgaged: false },
  
  { type: 'corner', name: 'Free Parking' },
  { type: 'property', name: 'Kentucky Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', houseCost: 150, houses: 0, mortgaged: false },
  { type: 'chance', name: 'Chance' },
  { type: 'property', name: 'Indiana Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', houseCost: 150, houses: 0, mortgaged: false },
  { type: 'property', name: 'Illinois Avenue', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'red', houseCost: 150, houses: 0, mortgaged: false },
  { type: 'railroad', name: 'B. & O. Railroad', price: 200, mortgaged: false },
  { type: 'property', name: 'Atlantic Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', houseCost: 150, houses: 0, mortgaged: false },
  { type: 'property', name: 'Ventnor Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', houseCost: 150, houses: 0, mortgaged: false },
  { type: 'utility', name: 'Water Works', price: 150, mortgaged: false },
  { type: 'property', name: 'Marvin Gardens', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'yellow', houseCost: 150, houses: 0, mortgaged: false },
  
  { type: 'corner', name: 'Go to Jail' },
  { type: 'property', name: 'Pacific Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', houseCost: 200, houses: 0, mortgaged: false },
  { type: 'property', name: 'North Carolina Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', houseCost: 200, houses: 0, mortgaged: false },
  { type: 'community-chest', name: 'Community Chest' },
  { type: 'property', name: 'Pennsylvania Avenue', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'green', houseCost: 200, houses: 0, mortgaged: false },
  { type: 'railroad', name: 'Short Line', price: 200, mortgaged: false },
  { type: 'chance', name: 'Chance' },
  { type: 'property', name: 'Park Place', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'dark-blue', houseCost: 200, houses: 0, mortgaged: false },
  { type: 'tax', name: 'Luxury Tax', cost: 100 },
  { type: 'property', name: 'Boardwalk', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'dark-blue', houseCost: 200, houses: 0, mortgaged: false },
];

export const PROPERTY_COLORS: Record<PropertyColor, string> = {
  brown: 'bg-[#955436]',
  'light-blue': 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  'dark-blue': 'bg-[#0072bb]',
};

export const CHANCE_CARDS: Card[] = [
    { type: 'advance', text: "Advance to Go (Collect $200)", position: 0 },
    { type: 'advance', text: "Advance to Illinois Ave.", position: 24 },
    { type: 'advance', text: "Advance to St. Charles Place.", position: 11 },
    { type: 'advance_nearest', text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.", target: 'utility' },
    { type: 'advance_nearest', text: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", target: 'railroad' },
    { type: 'receive', text: "Bank pays you dividend of $50", amount: 50 },
    { type: 'get_out_of_jail', text: "Get Out of Jail Free" },
    { type: 'advance', text: "Go Back 3 Spaces", position: -3, relative: true },
    { type: 'go_to_jail', text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200" },
    { type: 'pay_buildings', text: "Make general repairs on all your property. For each house pay $25. For each hotel pay $100", perHouse: 25, perHotel: 100 },
    { type: 'pay', text: "Pay poor tax of $15", amount: 15 },
    { type: 'advance', text: "Take a trip to Reading Railroad.", position: 5 },
    { type: 'advance', text: "Take a walk on the Boardwalk. Advance token to Boardwalk", position: 39 },
    { type: 'pay_per_player', text: "You have been elected Chairman of the Board. Pay each player $50", amount: 50 },
    { type: 'receive', text: "Your building and loan matures. Collect $150", amount: 150 },
    { type: 'receive', text: "You have won a crossword competition. Collect $100", amount: 100 }
];

export const COMMUNITY_CHEST_CARDS: Card[] = [
    { type: 'advance', text: "Advance to Go (Collect $200)", position: 0 },
    { type: 'receive', text: "Bank error in your favor. Collect $200", amount: 200 },
    { type: 'pay', text: "Doctor's fees. Pay $50", amount: 50 },
    { type: 'receive', text: "From sale of stock you get $50", amount: 50 },
    { type: 'get_out_of_jail', text: "Get Out of Jail Free" },
    { type: 'go_to_jail', text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200" },
    { type: 'receive', text: "Holiday fund matures. Receive $100", amount: 100 },
    { type: 'receive', text: "Income tax refund. Collect $20", amount: 20 },
    { type: 'receive_per_player', text: "It is your birthday. Collect $10 from every player", amount: 10 },
    { type: 'receive', text: "Life insurance matures. Collect $100", amount: 100 },
    { type: 'pay', text: "Pay hospital fees of $100", amount: 100 },
    { type: 'pay', text: "Pay school fees of $50", amount: 50 },
    { type: 'receive', text: "Receive $25 consultancy fee", amount: 25 },
    { type: 'pay_buildings', text: "You are assessed for street repairs. $40 per house. $115 per hotel", perHouse: 40, perHotel: 115 },
    { type: 'receive', text: "You have won second prize in a beauty contest. Collect $10", amount: 10 },
    { type: 'receive', text: "You inherit $100", amount: 100 }
];
