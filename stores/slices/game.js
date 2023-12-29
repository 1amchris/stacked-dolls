import { createSlice } from "@reduxjs/toolkit";
import { DollSizes, GameRules, Players } from "../../constants";
import _ from "lodash";

const helpers = {
  beforePlayTurn: (state) => {
    return state;
  },
  afterPlayTurn: (state) => {
    state.gameIsOver = helpers.isGameOver(state);
    state.currentPlayer = helpers.getNextPlayer(state);
    return state;
  },
  isGameOver: (state) => {
    const isWinning = (row) => {
      const result = row.reduce((acc, curr) => {
        const dollAtCurr = _.last(curr);
        if (dollAtCurr === undefined) return null;
        if (acc === undefined) return dollAtCurr.player;
        if (acc !== dollAtCurr.player) return null;
        return acc;
      }, undefined);

      return result !== undefined && result !== null;
    };

    const anyRowWins = state.board.some(isWinning);
    const anyColumnWins = _.zip(...state.board).some(isWinning);
    const anyDiagonalWins = [
      state.board.map((_, index) => state.board[index][index]),
      state.board.map(
        (_, index) => state.board[index][state.board.length - 1 - index]
      ),
    ].some(isWinning);

    return anyRowWins || anyColumnWins || anyDiagonalWins;
  },
  getNextPlayer: (state) => {
    return state.currentPlayer === Players.TWO ? Players.ONE : Players.TWO;
  },
  getNewGame: () => {
    return {
      currentPlayer: _.sample(Object.values(Players)),
      gameIsOver: false,
      board: Array(GameRules.BOARD_SIZE)
        .fill(null)
        .map(() => Array(GameRules.BOARD_SIZE).fill([])),
      inventory: Object.fromEntries(
        Object.values(Players).map((player) => [
          player,
          Object.fromEntries(
            Object.values(DollSizes).map((size) => [
              size,
              GameRules.DOLLS_COUNT[size],
            ])
          ),
        ])
      ),
    };
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: helpers.getNewGame(),
  reducers: {
    addDoll: (
      state,
      {
        payload: {
          size,
          toPosition: { row, col },
        },
      }
    ) => {
      if (state.gameIsOver || state.inventory[state.currentPlayer][size] <= 0)
        return;
      state = helpers.beforePlayTurn(state);

      state.inventory[state.currentPlayer][size] -= 1;
      state.board[row][col].push({ player: state.currentPlayer, size });

      state = helpers.afterPlayTurn(state);
      return state;
    },
    moveDoll: (state, { payload: { fromPosition, toPosition } }) => {
      if (state.gameIsOver) return;
      const doll = _.last(state.board[fromPosition.row][fromPosition.col]);
      if (!doll || doll.player != state.currentPlayer) return;
      state = helpers.beforePlayTurn(state);

      state.board[fromPosition.row][fromPosition.col].pop();
      state.board[toPosition.row][toPosition.col].push(doll);

      state = helpers.afterPlayTurn(state);
      return state;
    },
    resetGame: (state) => {
      state = helpers.getNewGame();
      return state;
    },
  },
});

export const { addDoll, moveDoll, resetGame } = gameSlice.actions;

export default gameSlice.reducer;
