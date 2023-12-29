import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GameBoard from "./components/GameBoard";
import { Provider } from "react-redux";
import store from "./stores";

const App = () => {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Text style={styles.title}>Stacked Dolls</Text>
        <GameBoard />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});

export default App;
