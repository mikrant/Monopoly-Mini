
'use client';
import { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import type { GameState, Player, BoardSpace, PlayerPiece, PropertySpace, RailroadSpace, UtilitySpace, TradeOffer, Card, Transaction, LastEvent, TurnState, Debt } from '@/lib/types';
import { BOARD_SPACES, CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '@/lib/consts';
import { shuffle } from '@/lib/utils';

export interface GameOptions {
  players: {
    name: string;
    piece: PlayerPiece;
  }[];
  startingMoney: number;
}

const PLAYER_COLORS = ['#ed1b24', '#0072bb', '#1fb25a', '#fef200', '#f781be', '#4ade80'];
const JAIL_POSITION = 10;
const GO_TO_JAIL_POSITION = 30;
const JAIL_FINE = 50;

const createInitialState = (options: GameOptions): GameState => {
  return {
    players: options.players.map((p, i) => ({
      id: i,
      name: p.name,
      type: 'human',
      piece: p.piece,
      money: options.startingMoney,
      position: 0,
      properties: [],
      railroads: [],
      utilities: [],
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      color: PLAYER_COLORS[i],
      bankrupt: false,
      transactions: [{ description: 'Starting Cash', amount: options.startingMoney }],
    })),
    board: JSON.parse(JSON.stringify(BOARD_SPACES)),
    currentPlayerIndex: 0,
    turnState: { type: 'AWAITING_ROLL' },
    doublesCount: 0,
    chanceDeck: shuffle([...CHANCE_CARDS]),
    communityChestDeck: shuffle([...COMMUNITY_CHEST_CARDS]),
    chanceDiscard: [],
    communityChestDiscard: [],
    winner: null,
  };
};

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [lastEvent, setLastEvent] = useState<LastEvent | null>({ title: 'Game Started', description: 'Good luck!'});
  
  const currentPlayer = useMemo(() => gameState?.players.find(p => p.id === gameState.currentPlayerIndex), [gameState]);

  const addLog = useCallback((message: string) => {
    setLog(prev => {
      if(prev.length > 0 && prev[0] === message) return prev;
      return [message, ...prev.slice(0, 99)]
    });
    console.log(message);
  }, []);
  
  const endTurn = useCallback(() => {
    setGameState(produce(draft => {
        if(!draft) return;
        const activePlayers = draft.players.filter(p => !p.bankrupt);
        if (activePlayers.length <= 1) {
            draft.turnState = { type: 'GAME_OVER', winner: activePlayers[0] };
            draft.winner = activePlayers[0];
            return;
        }
        
        let nextPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
        while(draft.players[nextPlayerIndex].bankrupt){
            nextPlayerIndex = (nextPlayerIndex + 1) % draft.players.length;
        }
        draft.currentPlayerIndex = nextPlayerIndex;
        draft.doublesCount = 0;
        
        const nextPlayer = draft.players[nextPlayerIndex];
        if (nextPlayer.inJail) {
            draft.turnState = { type: 'AWAITING_JAIL_ACTION' };
        } else {
            draft.turnState = { type: 'AWAITING_ROLL' };
        }
        
        addLog(`It's ${nextPlayer.name}'s turn.`);
    }));
  }, [addLog]);

  const landOnSpace = useCallback((playerId: number, rentMultiplier = 1) => {
    setGameState(produce(draft => {
        if (!draft) return;
        const player = draft.players.find(p => p.id === playerId);
        if(!player) return;
        const space = draft.board[player.position];
        const isDoubles = draft.doublesCount > 0;

        addLog(`${player.name} landed on ${space.name}.`);
        setLastEvent({ title: 'Landed On', description: space.name });

        switch (space.type) {
            case 'property':
            case 'railroad':
            case 'utility':
                if (space.ownerId === undefined) {
                    if(player.money >= space.price) {
                        draft.turnState = { type: 'AWAITING_BUY_PROMPT', spaceIndex: player.position };
                    } else {
                        addLog(`${player.name} cannot afford to buy ${space.name}.`);
                        draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                    }
                } else if (space.ownerId !== player.id) {
                    const owner = draft.players.find(p => p.id === space.ownerId)!;
                    if (space.mortgaged) {
                        addLog(`${space.name} is mortgaged. No rent is due.`);
                        draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                        return;
                    }

                    let rent = 0;
                    if(space.type === 'property'){
                        const colorGroup = draft.board.filter(s => s.type === 'property' && s.color === space.color);
                        const ownerOwnsAll = colorGroup.every(s => (s as any).ownerId === owner.id);
                        rent = space.rent[space.houses];
                        if(ownerOwnsAll && space.houses === 0) rent *= 2;
                    } else if (space.type === 'railroad'){
                        const RENT_LEVELS = [25, 50, 100, 200];
                        rent = RENT_LEVELS[owner.railroads.length - 1];
                        rent *= rentMultiplier;
                    } else if(space.type === 'utility'){
                        const lastRoll = dice[0] + dice[1];
                        rent = lastRoll * (owner.utilities.length === 1 ? 4 : 10);
                        rent *= rentMultiplier;
                    }
                    
                    const logMsg = `${player.name} owes ${owner.name} $${rent} in rent.`;
                    addLog(logMsg);
                    setLastEvent({title: 'Rent Due', description: logMsg});
                    if (player.money >= rent) {
                        player.money -= rent;
                        owner.money += rent;
                        player.transactions.unshift({ description: `Paid rent for ${space.name}`, amount: -rent });
                        owner.transactions.unshift({ description: `Received rent from ${player.name}`, amount: rent });
                        draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                    } else {
                        const debt: Debt = { debtorId: player.id, creditorId: owner.id, amount: rent };
                        draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt };
                    }
                } else {
                    draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                }
                break;
            case 'tax':
                const taxLogMsg = `${player.name} paid $${space.cost} in ${space.name}.`;
                addLog(taxLogMsg);
                setLastEvent({title: 'Tax Paid', description: taxLogMsg});
                if (player.money >= space.cost) {
                    player.money -= space.cost;
                    player.transactions.unshift({ description: `Paid ${space.name}`, amount: -space.cost });
                    draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                } else {
                    const debt: Debt = { debtorId: player.id, amount: space.cost };
                    draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt };
                }
                break;
            case 'chance':
            case 'community-chest':
                const deckType = space.type;
                const deck = deckType === 'chance' ? draft.chanceDeck : draft.communityChestDeck;
                const discard = deckType === 'chance' ? draft.chanceDiscard : draft.communityChestDiscard;
                if (deck.length === 0) {
                    deck.push(...shuffle(discard));
                    discard.length = 0;
                }
                const card = deck.pop()!;
                setLastEvent({title: `${deckType === 'chance' ? 'Chance' : 'Community Chest'}`, description: card.text});
                if (card.type !== 'get_out_of_jail') discard.push(card);
                draft.turnState = { type: 'AWAITING_CARD_ACTION', card, isChance: deckType === 'chance' };
                break;
            case 'corner':
                if (space.name === 'Go to Jail') {
                    player.position = JAIL_POSITION;
                    player.inJail = true;
                    draft.doublesCount = 0;
                    draft.turnState = { type: 'TURN_ENDED' };
                } else {
                    draft.turnState = isDoubles ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
                }
                break;
        }
    }));
  }, [addLog, dice]);

  const movePlayer = useCallback((d1: number, d2: number) => {
    const totalMove = d1 + d2;
    let currentStep = 0;
    
    const step = () => {
      if (currentStep < totalMove) {
        setGameState(produce(draft => {
          if(!draft) return;
          const player = draft.players[draft.currentPlayerIndex];
          const oldPosition = player.position;
          player.position = (player.position + 1) % BOARD_SPACES.length;
          if (player.position < oldPosition) { // Passed GO
            player.money += 200;
            const logMsg = `${player.name} passed GO and collected $200.`;
            player.transactions.unshift({ description: 'Passed GO', amount: 200 });
            addLog(logMsg);
            setLastEvent({title: 'Passed GO', description: logMsg});
          }
        }));
        currentStep++;
        setTimeout(step, 200);
      } else {
        // After movement animation is complete, land on the space
        landOnSpace(gameState!.currentPlayerIndex);
      }
    };
    step();
  }, [setGameState, addLog, landOnSpace, gameState]);

  const processTurn = useCallback((d1: number, d2: number) => {
    setGameState(produce(draft => {
        if (!draft) return;
        const player = draft.players[draft.currentPlayerIndex];
        const isDoubles = d1 === d2;

        if (isDoubles) {
            draft.doublesCount++;
        } else {
            draft.doublesCount = 0;
        }

        if (draft.doublesCount === 3) {
            addLog(`${player.name} rolled doubles three times. Go to jail!`);
            setLastEvent({title: 'Go to Jail', description: 'Rolled doubles 3 times'});
            player.position = JAIL_POSITION;
            player.inJail = true;
            draft.doublesCount = 0;
            draft.turnState = { type: 'TURN_ENDED' };
            return;
        }
        
        draft.turnState = { type: 'PROCESSING' };
    }));
    movePlayer(d1, d2);
  }, [movePlayer, addLog]);

  const rollDice = () => {
    if (!gameState) return;
    if (gameState.turnState.type !== 'AWAITING_ROLL') return;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.inJail) {
        setGameState(produce(draft => {
            if (!draft) return;
            draft.turnState = { type: 'AWAITING_JAIL_ACTION' };
        }));
        return;
    }

    setGameState(produce(draft => {
        if (!draft) return;
        draft.turnState = { type: 'PROCESSING' };
    }));
    
    setIsRolling(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      const currentPlayerName = gameState!.players[gameState!.currentPlayerIndex].name;
      addLog(`${currentPlayerName} rolled a ${d1} and a ${d2}.`);
      setIsRolling(false);
      processTurn(d1, d2);
    }, 500);
  };
  
  const handleBuyAction = (decision: 'buy' | 'skip') => {
    setGameState(produce(draft => {
        if (!draft || draft.turnState.type !== 'AWAITING_BUY_PROMPT') return;
        
        const player = draft.players[draft.currentPlayerIndex];
        const space = draft.board[draft.turnState.spaceIndex] as PropertySpace | RailroadSpace | UtilitySpace;

        if (decision === 'buy') {
            player.money -= space.price;
            space.ownerId = player.id;
            if (space.type === 'property') player.properties.push(draft.turnState.spaceIndex);
            else if (space.type === 'railroad') player.railroads.push(draft.turnState.spaceIndex);
            else if (space.type === 'utility') player.utilities.push(draft.turnState.spaceIndex);
            
            const logMsg = `${player.name} bought ${space.name} for $${space.price}.`;
            player.transactions.unshift({ description: `Bought ${space.name}`, amount: -space.price });
            addLog(logMsg);
            setLastEvent({title: 'Property Bought', description: logMsg});
        } else {
            addLog(`${player.name} declined to buy ${space.name}.`);
        }

        draft.turnState = draft.doublesCount > 0 ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
    }));
  }

  const handleCardAction = (card: Card) => {
    setGameState(produce(draft => {
        if (!draft) return;
        const player = draft.players[draft.currentPlayerIndex];
        let logMsg = '';

        switch(card.type) {
            case 'get_out_of_jail':
                 player.getOutOfJailCards++;
                 logMsg = `${player.name} received a Get Out of Jail Free card.`;
                break;
            case 'pay':
                logMsg = `${player.name} paid $${card.amount}.`;
                if (player.money >= card.amount) {
                    player.money -= card.amount;
                    player.transactions.unshift({ description: card.text, amount: -card.amount });
                } else {
                    draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt: { debtorId: player.id, amount: card.amount } };
                    addLog(logMsg);
                    return;
                }
                break;
            case 'pay_per_player':
                 let totalPaid = 0;
                 draft.players.forEach(p => { if (p.id !== player.id && !p.bankrupt) totalPaid += card.amount });
                 logMsg = `${player.name} paid $${card.amount} to each player.`;
                 if(player.money >= totalPaid) {
                    player.money -= totalPaid;
                    player.transactions.unshift({ description: card.text, amount: -totalPaid });
                    draft.players.forEach(p => {
                         if (p.id !== player.id && !p.bankrupt) {
                             p.money += card.amount;
                             p.transactions.unshift({ description: `Received from ${player.name}`, amount: card.amount });
                         }
                     });
                 } else {
                    draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt: { debtorId: player.id, amount: totalPaid } };
                    addLog(logMsg);
                    return;
                 }
                break;
            case 'pay_buildings':
                const houses = player.properties.reduce((acc, pIdx) => acc + ((draft.board[pIdx] as PropertySpace).houses < 5 ? (draft.board[pIdx] as PropertySpace).houses : 0), 0);
                const hotels = player.properties.reduce((acc, pIdx) => acc + ((draft.board[pIdx] as PropertySpace).houses === 5 ? 1 : 0), 0);
                const totalCost = houses * card.perHouse + hotels * card.perHotel;
                logMsg = `${player.name} paid $${totalCost} for building repairs.`;
                if (player.money >= totalCost) {
                    player.money -= totalCost;
                    player.transactions.unshift({ description: card.text, amount: -totalCost });
                } else {
                    draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt: { debtorId: player.id, amount: totalCost } };
                    addLog(logMsg);
                    return;
                }
                break;
            case 'receive':
                player.money += card.amount;
                logMsg = `${player.name} received $${card.amount}.`;
                player.transactions.unshift({ description: card.text, amount: card.amount });
                break;
            case 'receive_per_player':
                 let totalReceived = 0;
                 draft.players.forEach(p => {
                     if (p.id !== player.id && !p.bankrupt) {
                        p.money -= card.amount;
                        player.money += card.amount;
                        p.transactions.unshift({ description: `Paid ${player.name}`, amount: -card.amount });
                        player.transactions.unshift({ description: `Received from ${p.name}`, amount: card.amount });
                        totalReceived += card.amount;
                     }
                 });
                 logMsg = `${player.name} received $${card.amount} from each player, for a total of $${totalReceived}.`;
                break;
             case 'go_to_jail':
                player.position = JAIL_POSITION;
                player.inJail = true;
                draft.doublesCount = 0;
                logMsg = `${player.name} was sent to jail.`;
                addLog(logMsg);
                draft.turnState = { type: 'TURN_ENDED' };
                return;
            case 'advance':
                const oldPos = player.position;
                player.position = card.relative ? (oldPos + card.position + 40) % 40 : card.position;
                logMsg = `${player.name} advanced to ${draft.board[player.position].name}.`;
                addLog(logMsg);
                if(player.position < oldPos && !card.relative) {
                  player.money += 200;
                  const goLogMsg = `${player.name} passed GO and collected $200.`;
                  player.transactions.unshift({ description: 'Passed GO', amount: 200 });
                  addLog(goLogMsg);
                  setLastEvent({title: 'Passed GO', description: goLogMsg});
                }
                landOnSpace(player.id);
                return;
            case 'advance_nearest':
                let currentPosition = player.position;
                let nearestPos = -1;
                for(let i=1; i < 40; i++) {
                    const checkPos = (currentPosition + i) % 40;
                    const space = draft.board[checkPos];
                    if ((card.target === 'utility' && space.type === 'utility') || (card.target === 'railroad' && space.type === 'railroad')) {
                        nearestPos = checkPos;
                        break;
                    }
                }
                if(nearestPos !== -1) {
                    if (nearestPos < player.position) {
                      player.money += 200;
                      const goLogMsg = `${player.name} passed GO and collected $200.`;
                      player.transactions.unshift({ description: 'Passed GO', amount: 200 });
                      addLog(goLogMsg);
                      setLastEvent({title: 'Passed GO', description: goLogMsg});
                    }
                    player.position = nearestPos;
                    logMsg = `${player.name} advanced to the nearest ${card.target}, ${draft.board[player.position].name}.`;
                    addLog(logMsg);
                    landOnSpace(player.id, card.rentMultiplier);
                    return;
                }
                break;
        }
        addLog(logMsg);
        if(logMsg) setLastEvent({title: 'Card Action', description: logMsg});
        draft.turnState = draft.doublesCount > 0 ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
    }));
  }

  const handleJailAction = useCallback((jailAction: 'pay' | 'roll' | 'card') => {
    if (!gameState || gameState.turnState.type !== 'AWAITING_JAIL_ACTION') return;

    const player = gameState.players[gameState.currentPlayerIndex];
    if (jailAction === 'roll') {
      setIsRolling(true);
      const playerName = player.name;
      
      setTimeout(() => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
        addLog(`${playerName} rolled a ${d1} and a ${d2}.`);
        setIsRolling(false);
        
        if (d1 === d2) {
            setGameState(produce(draft => {
                if (!draft) return;
                const playerToUpdate = draft.players[draft.currentPlayerIndex];
                addLog('Doubles! You are out of jail.');
                setLastEvent({ title: 'Left Jail', description: 'Rolled doubles' });
                playerToUpdate.inJail = false;
                playerToUpdate.jailTurns = 0;
                draft.doublesCount = 0; // Doubles out of jail doesn't grant another turn
                draft.turnState = { type: 'PROCESSING' };
            }));
            movePlayer(d1, d2);
        } else {
            setGameState(produce(draft => {
                if (!draft) return;
                const playerToUpdate = draft.players[draft.currentPlayerIndex];
                addLog('Not doubles. You remain in jail.');
                setLastEvent({ title: 'Stay in Jail', description: 'Did not roll doubles' });
                playerToUpdate.jailTurns++;
                if (playerToUpdate.jailTurns >= 3) {
                  addLog('Third attempt failed. You must pay the fine.');
                  if (playerToUpdate.money >= JAIL_FINE) {
                    playerToUpdate.money -= JAIL_FINE;
                    playerToUpdate.inJail = false;
                    playerToUpdate.jailTurns = 0;
                    playerToUpdate.transactions.unshift({ description: 'Paid jail fine (3 attempts)', amount: -JAIL_FINE });
                    draft.turnState = { type: 'AWAITING_ROLL' };
                  } else {
                    const debt: Debt = { debtorId: playerToUpdate.id, amount: JAIL_FINE };
                    draft.turnState = { type: 'AWAITING_DEBT_PAYMENT', debt };
                  }
                } else {
                  draft.turnState = { type: 'TURN_ENDED' };
                }
            }));
        }
      }, 500);
      return;
    }
    
    setGameState(produce(draft => {
        if (!draft || draft.turnState.type !== 'AWAITING_JAIL_ACTION') return;
        const player = draft.players[draft.currentPlayerIndex];

        if (jailAction === 'pay') {
            if (player.money >= JAIL_FINE) {
                player.money -= JAIL_FINE;
                player.inJail = false;
                player.jailTurns = 0;
                const logMsg = `${player.name} paid $50 to get out of jail.`;
                addLog(logMsg);
                setLastEvent({title: 'Left Jail', description: logMsg});
                player.transactions.unshift({ description: 'Paid jail fine', amount: -JAIL_FINE });
                draft.turnState = { type: 'AWAITING_ROLL' };
            } else {
                addLog(`${player.name} does not have enough money to pay the fine.`);
            }
        } else if (jailAction === 'card') {
            if (player.getOutOfJailCards > 0) {
                player.getOutOfJailCards--;
                player.inJail = false;
                player.jailTurns = 0;
                const logMsg = `${player.name} used a Get Out of Jail Free card.`;
                addLog(logMsg);
                setLastEvent({title: 'Left Jail', description: logMsg});
                draft.turnState = { type: 'AWAITING_ROLL' };
            }
        }
    }));
  }, [addLog, gameState, movePlayer]);

  const declareBankruptcy = useCallback(() => {
    setGameState(produce(draft => {
        if (!draft || draft.turnState.type !== 'AWAITING_DEBT_PAYMENT') return;
        
        const { debtorId, creditorId } = draft.turnState.debt;
        const player = draft.players.find(p => p.id === debtorId);
        if (!player || player.bankrupt) return;

        player.bankrupt = true;
        const creditor = creditorId !== undefined ? draft.players.find(p => p.id === creditorId) : null;
        const creditorName = creditor ? creditor.name : 'the bank';
        const bankruptcyLog = `${player.name} has gone bankrupt to ${creditorName}!`;
        addLog(bankruptcyLog);
        setLastEvent({ title: 'Bankruptcy', description: bankruptcyLog });
        player.transactions.unshift({ description: `Went bankrupt to ${creditorName}`, amount: -player.money });
        
        const assets = [...player.properties, ...player.railroads, ...player.utilities];
        if (creditor) {
          creditor.money += player.money;
          assets.forEach(pIndex => {
              const space = draft.board[pIndex] as PropertySpace | RailroadSpace | UtilitySpace;
              (space as any).ownerId = creditor.id;
              if(space.type === 'property') creditor.properties.push(pIndex);
              if(space.type === 'railroad') creditor.railroads.push(pIndex);
              if(space.type === 'utility') creditor.utilities.push(pIndex);
          })
          creditor.getOutOfJailCards += player.getOutOfJailCards;
        } else { 
          assets.forEach(pIndex => {
              const space = draft.board[pIndex] as PropertySpace | RailroadSpace | UtilitySpace;
              delete (space as any).ownerId;
              if (space.type === 'property') space.houses = 0;
              space.mortgaged = false;
          });
        }
        
        player.money = 0;
        player.properties = [];
        player.railroads = [];
        player.utilities = [];
        player.getOutOfJailCards = 0;

        const activePlayers = draft.players.filter(p => !p.bankrupt);
        if (activePlayers.length <= 1) {
            draft.turnState = { type: 'GAME_OVER', winner: activePlayers[0] };
            draft.winner = activePlayers[0];
        } else {
            endTurn();
        }
    }));
  }, [addLog, endTurn]);
  
  const manageProperty = useCallback((spaceIndex: number, manageAction: 'buy_house' | 'sell_house' | 'mortgage' | 'unmortgage') => {
    setGameState(produce(draft => {
        if (!draft) return;
        const player = draft.players.find(p => p.id === (draft.turnState.type === 'AWAITING_DEBT_PAYMENT' ? draft.turnState.debt.debtorId : draft.currentPlayerIndex));
        if (!player) return;

        const space = draft.board[spaceIndex] as PropertySpace | RailroadSpace | UtilitySpace;
        
        if (space.type !== 'property' && manageAction !== 'mortgage' && manageAction !== 'unmortgage') {
             addLog(`You can only manage houses on normal properties.`);
             return;
        }

        if (space.type === 'property' && (manageAction === 'buy_house' || manageAction === 'sell_house')) {
            const groupColor = space.color;
            const colorGroupSpaces = draft.board.filter(s => s.type === 'property' && s.color === groupColor) as PropertySpace[];
            const playerOwnsAll = colorGroupSpaces.every(s => s.ownerId === player.id);
            if (!playerOwnsAll) {
                addLog(`You must own all ${groupColor} properties to build.`);
                return;
            }
            const housesOnGroup = colorGroupSpaces.map(s => s.houses);

            if (manageAction === 'buy_house') {
                if (space.houses > Math.min(...housesOnGroup)) {
                    addLog('You must build houses evenly across the color group.');
                    return;
                }
            }
            
            if (manageAction === 'sell_house') {
                if (space.houses < Math.max(...housesOnGroup)) {
                    addLog('You must sell houses evenly across the color group.');
                    return;
                }
            }
        }

        switch (manageAction) {
            case 'buy_house':
                if (space.type === 'property' && player.money >= space.houseCost && space.houses < 5) {
                    player.money -= space.houseCost;
                    space.houses++;
                    const logMsg = `${player.name} built a house on ${space.name} for $${space.houseCost}.`;
                    addLog(logMsg);
                    setLastEvent({title: 'House Built', description: logMsg});
                    player.transactions.unshift({ description: `Built house on ${space.name}`, amount: -space.houseCost });
                }
                break;
            case 'sell_house':
                 if (space.type === 'property' && space.houses > 0) {
                    player.money += space.houseCost / 2;
                    space.houses--;
                    const logMsg = `${player.name} sold a house on ${space.name} for $${space.houseCost / 2}.`;
                    addLog(logMsg);
                    setLastEvent({title: 'House Sold', description: logMsg});
                    player.transactions.unshift({ description: `Sold house on ${space.name}`, amount: space.houseCost / 2 });
                }
                break;
            case 'mortgage':
                if (!(space as any).mortgaged && (space.type !== 'property' || space.houses === 0)) {
                    const mortgageValue = space.price / 2;
                    player.money += mortgageValue;
                    (space as any).mortgaged = true;
                    const logMsg = `${player.name} mortgaged ${space.name} for $${mortgageValue}.`;
                    addLog(logMsg);
                    setLastEvent({title: 'Property Mortgaged', description: logMsg});
                    player.transactions.unshift({ description: `Mortgaged ${space.name}`, amount: mortgageValue });
                }
                break;
            case 'unmortgage':
                const mortgageValue = space.price / 2;
                const unmortgageCost = mortgageValue + (mortgageValue / 10);
                if ((space as any).mortgaged && player.money >= unmortgageCost) {
                    player.money -= unmortgageCost;
                    (space as any).mortgaged = false;
                    const logMsg = `${player.name} unmortgaged ${space.name} for $${unmortgageCost}.`;
                    addLog(logMsg);
                    setLastEvent({title: 'Property Unmortgaged', description: logMsg});
                    player.transactions.unshift({ description: `Unmortgaged ${space.name}`, amount: -unmortgageCost });
                }
                break;
        }

        if (draft.turnState.type === 'AWAITING_DEBT_PAYMENT') {
            if(player.money >= draft.turnState.debt.amount){
                player.money -= draft.turnState.debt.amount;
                const creditor = draft.players.find(p => p.id === draft.turnState.debt.creditorId);
                const debtAmount = draft.turnState.debt.amount;
                if (creditor) {
                    creditor.money += debtAmount;
                    creditor.transactions.unshift({ description: `Received debt payment from ${player.name}`, amount: debtAmount });
                }
                player.transactions.unshift({ description: `Paid debt`, amount: -debtAmount });
                const logMsg = `${player.name} paid their debt of $${debtAmount}.`;
                addLog(logMsg);
                setLastEvent({title: 'Debt Paid', description: logMsg});
                draft.turnState = draft.doublesCount > 0 ? { type: 'AWAITING_ROLL' } : { type: 'TURN_ENDED' };
            }
        }
    }));
  }, [addLog]);
  
  const proposeTrade = useCallback((offer: TradeOffer) => {
        setGameState(produce(draft => {
            if(!draft || draft.turnState.type !== 'PROPOSING_TRADE') return;
            const logMsg = `${draft.players.find(p => p.id === offer.fromPlayerId)?.name} proposed a trade to ${draft.players.find(p => p.id === offer.toPlayerId)?.name}.`;
            addLog(logMsg);
            setLastEvent({title: 'Trade Proposed', description: logMsg});
            draft.turnState = { type: 'AWAITING_TRADE_RESPONSE', offer, previousState: draft.turnState.previousState };
        }));
    }, [addLog, setLastEvent]);

    const respondToTrade = useCallback((offer: TradeOffer, accepted: boolean) => {
        setGameState(produce(draft => {
            if (!draft || draft.turnState.type !== 'AWAITING_TRADE_RESPONSE') return;

            const proposer = draft.players.find(p => p.id === offer.fromPlayerId)!;
            const receiver = draft.players.find(p => p.id === offer.toPlayerId)!;

            const logMsg = accepted 
                ? `Trade between ${proposer.name} and ${receiver.name} accepted!` 
                : `Trade between ${proposer.name} and ${receiver.name} was rejected.`;
            
            addLog(logMsg);
            setLastEvent({title: 'Trade', description: logMsg});

            if (accepted) {
                // Money
                proposer.money += offer.moneyRequested - offer.moneyOffered;
                receiver.money += offer.moneyOffered - offer.moneyRequested;
                
                const proposerCashChange = offer.moneyRequested - offer.moneyOffered;
                if (proposerCashChange !== 0) {
                     proposer.transactions.unshift({ description: `Trade with ${receiver.name}`, amount: proposerCashChange });
                }
                const receiverCashChange = offer.moneyOffered - offer.moneyRequested;
                if (receiverCashChange !== 0) {
                    receiver.transactions.unshift({ description: `Trade with ${proposer.name}`, amount: receiverCashChange });
                }

                // Properties
                const transferProperties = (from: Player, to: Player, indices: number[]) => {
                    indices.forEach(pIdx => {
                        const property = draft.board[pIdx];
                        if (property.type === 'property' || property.type === 'railroad' || property.type === 'utility') {
                            property.ownerId = to.id;

                            if (property.type === 'property') {
                                from.properties = from.properties.filter(p => p !== pIdx);
                                to.properties.push(pIdx);
                            } else if (property.type === 'railroad') {
                                from.railroads = from.railroads.filter(p => p !== pIdx);
                                to.railroads.push(pIdx);
                            } else {
                                from.utilities = from.utilities.filter(p => p !== pIdx);
                                to.utilities.push(pIdx);
                            }
                        }
                    });
                };
                
                transferProperties(proposer, receiver, offer.propertiesOffered);
                transferProperties(receiver, proposer, offer.propertiesRequested);
            }
            
            if (draft.turnState.previousState) {
                draft.turnState = draft.turnState.previousState;
            }
        }));
     }, [addLog]);

  const handleModalAction = (action: 'manage_properties' | 'trade_prompt' | 'close_modal') => {
    setGameState(produce(draft => {
        if (!draft) return;
        const currentState = draft.turnState;
        if(action === 'manage_properties') {
            if(currentState.type === 'AWAITING_ROLL' || currentState.type === 'TURN_ENDED') {
                draft.turnState = { type: 'MANAGING_PROPERTIES', previousState: currentState };
            }
        } else if(action === 'trade_prompt') {
            if(currentState.type === 'AWAITING_ROLL' || currentState.type === 'TURN_ENDED') {
                draft.turnState = { type: 'PROPOSING_TRADE', previousState: currentState };
            }
        } else if(action === 'close_modal') {
             if (currentState.type === 'MANAGING_PROPERTIES' || currentState.type === 'PROPOSING_TRADE' || currentState.type === 'AWAITING_TRADE_RESPONSE') {
                 if(currentState.previousState) draft.turnState = currentState.previousState;
             }
        }
    }));
  }
  
  const startGame = (options: GameOptions) => {
    setGameState(createInitialState(options));
    setDice([1,1]);
    setLog([]);
    addLog(`Game started! It's ${options.players[0].name}'s turn.`);
    setLastEvent({ title: 'Game Started', description: 'Good luck!' });
  };

  const resetGame = () => {
    setGameState(null);
  };

  return {
    gameState,
    gameActions: {
      startGame,
      rollDice,
      endTurn,
      resetGame,
      manageProperty,
      handleJailAction,
      proposeTrade,
      respondToTrade,
      declareBankruptcy,
      handleBuyAction,
      handleCardAction,
      handleModalAction,
    },
    dice,
    isRolling,
    currentPlayer,
    log,
    lastEvent,
  };
}

    

    