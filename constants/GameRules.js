import DollSizes from "./DollSizes";

const GameRules = Object.freeze({
  BOARD_SIZE: 3,
  DOLLS_COUNT: Object.freeze({
    [DollSizes.SMALL]: 2,
    [DollSizes.MEDIUM]: 2,
    [DollSizes.LARGE]: 2,
  }),
});

export default GameRules;
