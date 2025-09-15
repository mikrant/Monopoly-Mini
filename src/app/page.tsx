
'use client';

import { useState } from 'react';
import { Board } from '@/components/game/board';
import { PlayerHUD } from '@/components/game/player-hud';
import { GameSetup } from '@/components/modals/game-setup';
import { useGameEngine, type GameOptions } from '@/hooks/use-game-engine';
import { ActionModal } from '@/components/modals/action-modal';
import { GameOverModal } from '@/components/modals/game-over-modal';
import { ManagePropertyModal } from '@/components/modals/manage-property-modal';
import { TradeModal } from '@/components/modals/trade-modal';
import { GameMessageModal } from '@/components/modals/game-message-modal';
import { CardModal } from '@/components/modals/card-modal';
import type { Player, BoardSpace } from '@/lib/types';
import { PropertyInfoModal } from '@/components/modals/property-info-modal';
import { PlayerInfoModal } from '@/components/modals/player-info-modal';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  const [showSetup, setShowSetup] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<BoardSpace | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const {
    gameState,
    gameActions,
    dice,
    isRolling,
    currentPlayer,
    log,
    lastEvent,
  } = useGameEngine();

  const handleGameStart = (options: GameOptions) => {
    gameActions.startGame(options);
    setShowSetup(false);
  };
  
  const handleResetGame = () => {
    gameActions.resetGame();
    setShowSetup(true);
  }
  
  if (!gameState) {
    return <GameSetup onGameStart={handleGameStart} />;
  }
  
  const handlePropertyClick = (space: BoardSpace) => {
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      setSelectedProperty(space);
    }
  }

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  }

  const getOwner = (space: BoardSpace) => {
    const ownerId = (space as any).ownerId;
    if (ownerId === undefined) return undefined;
    return gameState.players.find(p => p.id === ownerId);
  }

  return (
    <SidebarProvider>
      <main className="flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background">
        <SidebarInset>
            <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center p-4">
                <div className="absolute top-2 right-2 z-20">
                    <SidebarTrigger />
                </div>
                <div className="relative flex h-full w-full max-w-full max-h-full items-center justify-center aspect-square">
                     <Board players={gameState.players} board={gameState.board} onPropertyClick={handlePropertyClick} />
                </div>
            </div>
            <Sidebar side="right">
                <SidebarContent>
                    <PlayerHUD
                        players={gameState.players}
                        currentPlayer={currentPlayer}
                        turnState={gameState.turnState}
                        dice={dice}
                        onRollDice={gameActions.rollDice}
                        isRolling={isRolling}
                        onEndTurn={gameActions.endTurn}
                        log={log}
                        lastEvent={lastEvent}
                        onResetGame={handleResetGame}
                        onManageProperties={() => gameActions.handleModalAction('manage_properties')}
                        onTrade={() => gameActions.handleModalAction('trade_prompt')}
                        onJailAction={gameActions.handleJailAction}
                        onPlayerClick={handlePlayerClick}
                    />
                </SidebarContent>
            </Sidebar>
        </SidebarInset>
      </main>

      <GameSetup open={showSetup} onGameStart={handleGameStart} />
      
      <ActionModal 
        turnState={gameState.turnState}
        board={gameState.board}
        onAction={gameActions.handleBuyAction}
      />

      <GameOverModal turnState={gameState.turnState} winner={gameState.winner} onRestart={handleResetGame} />

      <ManagePropertyModal 
        turnState={gameState.turnState}
        board={gameState.board}
        player={
          gameState.turnState.type === 'AWAITING_DEBT_PAYMENT' 
          ? gameState.players.find(p => p.id === gameState.turnState.debt.debtorId) 
          : currentPlayer
        }
        onManageProperty={gameActions.manageProperty}
        onClose={() => gameActions.handleModalAction('close_modal')}
        onDeclareBankruptcy={gameActions.declareBankruptcy}
      />

      <TradeModal
        turnState={gameState.turnState}
        players={gameState.players}
        currentPlayer={currentPlayer!}
        board={gameState.board}
        onProposeTrade={gameActions.proposeTrade}
        onRespondToTrade={gameActions.respondToTrade}
        onClose={() => gameActions.handleModalAction('close_modal')}
      />

      <GameMessageModal
        turnState={gameState.turnState}
        onClose={() => gameActions.handleModalAction('close_modal')}
      />

      <CardModal
        turnState={gameState.turnState}
        onClose={gameActions.handleCardAction}
      />

      <PropertyInfoModal
        space={selectedProperty}
        owner={selectedProperty ? getOwner(selectedProperty) : undefined}
        onClose={() => setSelectedProperty(null)}
      />

      <PlayerInfoModal
        player={selectedPlayer}
        board={gameState.board}
        onClose={() => setSelectedPlayer(null)}
      />
    </SidebarProvider>
  );
}
