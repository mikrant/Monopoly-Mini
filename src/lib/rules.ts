
export const MONOPOLY_RULES = [
  {
    title: 'Object of the Game',
    points: [
      'To be the last player remaining who has not gone bankrupt.',
    ],
  },
  {
    title: 'Gameplay',
    points: [
      'On your turn, roll the two dice and move your token that many spaces clockwise around the board.',
      'If you roll doubles, you get to roll again after your turn is complete. If you roll doubles three times in a row, you go to jail immediately.',
      'After moving, take action depending on the space you landed on.',
      'Your turn ends when you are finished with your actions and pass the turn to the next player.',
    ],
  },
  {
    title: 'Board Spaces',
    points: [
      "<b>Properties (Colored Spaces, Railroads, Utilities):</b> If unowned, you may buy it. If owned by another player, you must pay rent.",
      "<b>Go:</b> Each time you land on or pass over GO, you collect $200 from the bank.",
      "<b>Chance / Community Chest:</b> Draw the top card from the corresponding deck and follow its instructions.",
      "<b>Income / Luxury Tax:</b> Pay the indicated amount to the bank.",
      "<b>Jail:</b> You are just visiting. You are not penalized.",
      "<b>Go to Jail:</b> You must move your token directly to the 'In Jail' space. You do not collect $200 for passing Go.",
      "<b>Free Parking:</b> You do not receive any money, property, or reward of any kind.",
    ],
  },
  {
    title: 'Buying Property',
    points: [
      'If you land on an unowned property, you may buy it for its listed price. You will receive a Title Deed card for it.',
      "If you choose not to buy it, the game does not currently support auctioning.",
    ],
  },
  {
    title: 'Paying Rent',
    points: [
      "If you land on a property owned by another player, you must pay them rent. The amount is shown on the Title Deed.",
      "Rent is doubled on properties in a color group if the owner owns all properties in that group and there are no houses on them.",
      "Rent is much higher if there are houses or hotels on the property.",
      "You do not pay rent if the property is mortgaged.",
    ],
  },
  {
    title: 'Building Houses and Hotels',
    points: [
      "Once you own all properties in a color group, you can build houses on them.",
      "You must build evenly. You cannot build a second house on a property until you have built one house on all properties in that group.",
      "Once you have four houses on a property, you can build a hotel by paying the hotel cost.",
    ],
  },
  {
    title: 'Jail',
    points: [
      "You go to jail for: (1) Landing on the 'Go to Jail' space, (2) Drawing a 'Go to Jail' card, or (3) Rolling doubles three times in a row.",
      "To get out of jail, you can: (1) Pay a $50 fine before rolling the dice, (2) Use a 'Get Out of Jail Free' card, or (3) Roll for doubles on your turn. You have three attempts to roll for doubles. If you fail on the third attempt, you must pay the $50 fine.",
      "If you get out by rolling doubles, you move the number of spaces shown on the dice but do not roll again.",
    ],
  },
  {
    title: 'Trading',
    points: [
      "You may trade properties, money, and Get Out of Jail Free cards with other players.",
      "Trades can happen at any time but are generally done on a player's turn before or after rolling.",
      "Properties with houses or hotels on them cannot be traded.",
    ],
  },
  {
    title: 'Mortgaging',
    points: [
      "You can mortgage properties to the bank to get money. The mortgage value is half the property's price.",
      "To unmortgage a property, you must pay the mortgage value plus 10% interest.",
      "No rent can be collected on mortgaged properties.",
    ],
  },
  {
    title: 'Bankruptcy',
    points: [
      "If you owe more money than you can raise, you are declared bankrupt and are out of the game.",
      "If your debt is to another player, you must turn over all you have of value to that player.",
      "If your debt is to the bank, the bank takes all your assets. All properties are returned to the board unowned.",
    ],
  },
];
