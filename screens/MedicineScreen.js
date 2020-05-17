import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  View,
  Text,
  Image,
  SafeAreaView
} from "react-native";
import { SearchBar } from "react-native-elements";
import firestore from "@react-native-firebase/firestore";

function Medicines() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [medicines, setMedicine] = useState([]); // Initial empty array of users
  const [text, setText] = useState("");
  const [myArray, setArray] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection("medicine")
      .onSnapshot(querySnapshot => {
        const medicines = [];

        querySnapshot.forEach(documentSnapshot => {
          medicines.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          });
        });

        setMedicine(medicines);
        setArray(medicines);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          placeholder="Search Medicine..."
          lightTheme
          round
          onChangeText={newText => {
            const newData = medicines.filter(function(item) {
              //applying filter for the inserted text in search bar
              const itemData = item.name
                ? item.name.toUpperCase()
                : "".toUpperCase();
              const textData = newText.toUpperCase();
              return itemData.indexOf(textData) > -1;
            });
            setArray(newData);
            setText(newText);
          }}
          value={text}
        />
      </View>
      <FlatList
        style={styles.feed}
        data={myArray}
        renderItem={({ item }) => renderItem(item)}
      />
    </SafeAreaView>
  );
}

function renderItem(item) {
  return (
    <View style={styles.feedItem}>
      <Image
        source={
          item.image ? { uri: item.image } : require("../assets/tempAvatar.jpg")
        }
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBECF4"
  },
  header: {
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D9DB"
  },
  feed: {
    marginHorizontal: 16
  },
  feedItem: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65"
  },
  back: {
    position: "absolute",
    top: 24,
    left: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default function MedicineScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Medicines />
    </SafeAreaView>
  );
}
