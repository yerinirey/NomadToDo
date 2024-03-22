import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
const STORAGE_KEY = "@toDos";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const travel = () => {
    setWorking(false);
    AsyncStorage.setItem("state", JSON.stringify(false));
  };
  const work = () => {
    setWorking(true);
    AsyncStorage.setItem("state", JSON.stringify(true));
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    const current = await AsyncStorage.getItem("state");
    if (s) setToDos(JSON.parse(s));
    if (current) setWorking(JSON.parse(current));
  };
  useEffect(() => {
    loadToDos();
  }, []);
  const addToDo = async () => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false, editing: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
    return;
  };
  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = newToDos[key].completed === true ? false : true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const onEditText = (payload) => setEditText(payload);
  const editToDo = (key) => {
    const newToDos = { ...toDos };
    toDos[key].editing = toDos[key].editing ? false : true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const onEditToDo = async (key) => {
    if (editText === "") {
      return;
    }

    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    newToDos[key].editing = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View flexDirection="column" key={key}>
              <View style={styles.toDo}>
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
                <View style={styles.btnOption}>
                  {toDos[key].completed ? (
                    <TouchableOpacity onPress={() => completeToDo(key)}>
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => completeToDo(key)}>
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => editToDo(key)}>
                    <Fontisto name="eraser" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
              {toDos[key].editing ? (
                <TextInput
                  value={editText}
                  onSubmitEditing={() => onEditToDo(key)}
                  onChangeText={onEditText}
                  returnKeyType="done"
                  placeholder={toDos[key].text}
                  placeholderTextColor={theme.grey}
                  fontSize={18}
                  style={{
                    ...styles.toDo,
                    marginTop: 0,
                    marginBottom: 20,
                    backgroundColor: "teal",
                  }}
                />
              ) : null}
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  btnOption: {
    flexDirection: "row",
    gap: 8,
  },
});
