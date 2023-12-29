import React, { useState } from "react";
import { View, Pressable, StyleSheet, Text, Button } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { DollSizes, GameRules, Players } from "../constants";
import { addDoll, moveDoll, resetGame } from "../stores/slices/game";
import _ from "lodash";

const SelectionType = Object.freeze({
  INVENTORY: "inventory",
  BOARD: "board",
});

const GameBoard = () => {
  const [selection, setSelection] = useState(null);

  const game = useSelector((state) => state.game);
  const dispatch = useDispatch();

  const toBoardItem = (row, col) => ({
    type: SelectionType.BOARD,
    fromPosition: { row, col },
  });

  const toInventoryItem = (size) => ({
    type: SelectionType.INVENTORY,
    size,
  });

  const handleInventoryCellPress = ({ size }) => {
    if (game.gameIsOver || game.inventory[game.currentPlayer][size] <= 0)
      return;
    setSelection(toInventoryItem(size));
  };

  const handleBoardCellPress = (row, col) => {
    if (game.gameIsOver) return;
    const doll = _.last(game.board[row][col]);

    if (selection === null) {
      if (doll?.player === game.currentPlayer) {
        setSelection(toBoardItem(row, col));
      }
    } else if (Object.values(SelectionType).includes(selection?.type)) {
      if (
        !doll ||
        (selection.type === SelectionType.INVENTORY &&
          doll.size < selection.size) ||
        (selection.type === SelectionType.BOARD &&
          doll.size <
            _.last(
              game.board[selection.fromPosition.row][selection.fromPosition.col]
            )?.size)
      ) {
        let action;
        switch (selection.type) {
          case SelectionType.BOARD:
            action = moveDoll({
              fromPosition: selection.fromPosition,
              toPosition: { row, col },
            });
            break;

          case SelectionType.INVENTORY:
            action = addDoll({
              size: selection.size,
              toPosition: { row, col },
            });
            break;

          default:
            console.error(
              `Invalid selection type. Got: "${selection.type}", but expected one of: `,
              Object.values(SelectionType)
            );
        }

        dispatch(action);
        setSelection(null);
      } else if (doll !== undefined && doll.player === game.currentPlayer) {
        setSelection(toBoardItem(row, col));
      } else {
        setSelection(null);
      }
    }
  };

  const Doll = (doll) => {
    if (!doll) return null;

    const { player, size } = doll;
    return (
      <View style={styles.doll}>
        <View
          style={[
            styles.doll.content,
            styles.doll[size],
            { backgroundColor: player === Players.TWO ? "red" : "blue" },
          ]}
        />
        <Text
          style={[styles.doll.content, { color: "white", fontWeight: "bold" }]}
        >
          {size === DollSizes.SMALL
            ? "S"
            : size === DollSizes.MEDIUM
            ? "M"
            : size === DollSizes.LARGE
            ? "L"
            : null}{" "}
          {player === Players.TWO ? "P1" : player === Players.ONE ? "P2" : null}
        </Text>
      </View>
    );
  };

  const BoardCell = ({ row, col }) => {
    return (
      <Pressable
        style={[
          styles.boardCell,
          selection?.type === SelectionType.BOARD &&
          selection?.fromPosition?.row === row &&
          selection?.fromPosition?.col === col
            ? styles.selectedCell
            : null,
        ]}
        onPress={() => handleBoardCellPress(row, col)}
        key={`${row}-${col}`}
      >
        <Doll {..._.last(game.board[row][col])} />
      </Pressable>
    );
  };

  const InventoryCell = ({ disabled, selected, ...doll }) => {
    return (
      <Pressable
        style={[
          styles.invCell,
          disabled && styles.disabledInvCell,
          selected && styles.selectedCell,
        ]}
        onPress={() => handleInventoryCellPress(doll)}
        key={`${doll.player}-${doll.size}`}
        disabled={disabled}
      >
        <Doll {...doll} />
        <Text>{game.inventory[doll.player][doll.size]}</Text>
      </Pressable>
    );
  };

  const Inventory = ({ player }) => {
    return (
      <View style={styles.inventory}>
        {Object.values(DollSizes)
          .map((size) => ({
            player,
            size,
            count: game.inventory[player][size],
          }))
          .map((doll) => (
            <InventoryCell
              key={`${doll.player}-${doll.size}`}
              selected={
                selection?.type === SelectionType.INVENTORY &&
                game.currentPlayer === doll.player &&
                selection?.size === doll.size
              }
              disabled={
                game.gameIsOver ||
                doll.count === 0 ||
                game.currentPlayer !== doll.player
              }
              {...doll}
            />
          ))}
      </View>
    );
  };

  const Menu = () => {
    return (
      <View>
        <Button
          title={game.gameIsOver ? "Play again!" : "Reset"}
          style={styles.resetButton}
          onPress={() => dispatch(resetGame())}
        />
      </View>
    );
  };

  const Board = () => {
    return (
      <View style={styles.board}>
        {Array.from({ length: GameRules.BOARD_SIZE }, (_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: GameRules.BOARD_SIZE }, (_, col) => (
              <BoardCell key={`${row}-${col}`} row={row} col={col} />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Inventory player={Players.ONE} />
      <Board />
      <Inventory player={Players.TWO} />
      <Menu style={styles.menu} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    flexDirection: "column",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  board: {
    display: "block",
    width: 300,
    height: 300,
    backgroundColor: "grey",
  },
  inventory: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
  },
  selectedCell: {
    backgroundColor: "green",
  },
  boardCell: {
    display: "flex",
    flex: 1,
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  invCell: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgray",
    margin: 10,
    borderRadius: 12,
  },
  doll: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,

    content: {
      position: "absolute",
    },

    [DollSizes.SMALL]: {
      width: "40%",
      height: "40%",
      borderRadius: 100,
    },
    [DollSizes.MEDIUM]: {
      width: "60%",
      height: "60%",
      borderRadius: 100,
    },
    [DollSizes.LARGE]: {
      width: "80%",
      height: "80%",
      borderRadius: 100,
    },
  },
  disabledInvCell: {
    opacity: 0.6,
    filter: "grayscale(100%)",
  },
});

export default GameBoard;
