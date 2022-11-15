import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Button,
  DatePickerAndroid,
  DatePickerIOS,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import ToDo from './Todo';
import Database from './Database';
import database from "./Database";

const baseData: ToDo[] = [
  {
    title: 'Jouer à pokemon écarlate',
    text: 'Attraper les 4 légendaires',
    date: new Date(),
    state: false
  },
  {
    title: 'Jouer à God of War (R)',
    text: 'Niker Thor',
    date: new Date(),
    state: false
  },
  {
    title: 'Jouer à mario kart',
    text: 'Terminer le jeu à 100%',
    date: new Date(),
    state: true
  }
];

// to fill with data in first time (to test obviously)
Database().then(_ =>
{
  Database.getTodos().then(res =>
  {
    if(res.length == 0)
    {
      for (const baseDatum of baseData)
        Database.addTodo(baseDatum);
    }
  });
});

const Stack = createNativeStackNavigator();

function SqlAdd(item: ToDo)
{
  Database.addTodo(item);
}

function ToDoListScreen({route, navigation}: any)
{
   const [todolist, setToDoList] = useState<ToDo[]>([]);

    const newItem = (route.params || {}).newItem;

    if(newItem)
    {
      const items = [...todolist];

      items.push(newItem);

      setToDoList(items);
      SqlAdd(newItem);
      route.params.newItem = undefined;
    }

   const pending = todolist.filter(f => !f.state);
   const done = todolist.filter(f => f.state);

   if(todolist.length == 0)
      Database.getTodos().then(res => setToDoList(res));

   const onLongPressItem = (item: ToDo) => {
     item.state = !item.state;

     setToDoList([...todolist]);
   };

   const onPressItem = (item: ToDo) => navigation.navigate('ToDo', {
     todo: {
       ...item,
       date: item.date.getTime()
     }
   });

   return <SafeAreaView>
     <View style={styles.container}>
       <View style={styles["mb-2"]}>
         <Button title='Add Todo' color={'rgb(70,196,255)'} onPress={() => navigation.navigate('AddItem')} />
       </View>
       <Button title='Remove Todos' onPress={() => {
         for (const toDo of todolist)
           database.removeTodo(toDo);

         setToDoList([]);
       }} color={'red'} />

       <Text style={styles["mt-2"]}>Tips: click to view details and long press to change status.</Text>
       <Text style={styles.listTitle}>Pending</Text>
       <FlatList data={pending} renderItem={({item}) => <View>
         <Text
             onPress={() => onPressItem(item)}
            onLongPress={() => onLongPressItem(item)}
             style={styles.listItem}
         >{item.title}</Text>
       </View>} />

       <Text style={styles.listTitle}>Done</Text>
       <FlatList data={done} renderItem={({item}) => <View>
         <Text
             onPress={() => onPressItem(item)}
         onLongPress={() => onLongPressItem(item)
         }
             style={styles.listItemDone}
         >{item.title}</Text>
       </View>} />
     </View>
   </SafeAreaView>
}

function ToDoScreen({route, navigation}: any)
{
  const { todo } = route.params;

  return <View style={styles.container}>
    <Text>{todo.title}</Text>
    <Text>{(new Date(todo.date)).toDateString()}</Text>
    <Text>{todo.text}</Text>
  </View>
}

function AddScreen({route, navigation}: any)
{
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');

  const item: ToDo = {
    title: title,
    text: text,
    date: date,
    state: false
  }

  return <View style={styles.container}>
    <Text>Title</Text>
    <TextInput style={styles.input} onChange={(e) => setTitle(e.nativeEvent.text)}></TextInput>

    <Text>Text</Text>
    <TextInput style={styles.input} value={item.text} onChange={(e) => setText(e.nativeEvent.text)}></TextInput>

    <Text>Date</Text>
    <Text
        style={styles.input}
        onPress={() => {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        onChange: (event, date) => setDate(date || new Date())
      })
    }
    }>{item.date.toLocaleDateString()}</Text>

    <Button title='Add' onPress={() =>
    {
      navigation.navigate('ToDoList', {
        newItem: item
      });
    }
    } />
  </View>
}

export default function App() {
  return <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name='ToDoList' component={ToDoListScreen} />
      <Stack.Screen name='ToDo' component={ToDoScreen} />
      <Stack.Screen name='AddItem' component={AddScreen} />
    </Stack.Navigator>
  </NavigationContainer>
}

const styles = StyleSheet.create({
  container: {
    margin: 10
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  listItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderStyle: "solid",
    borderColor: 'black',
    borderWidth: 1
  },
  listItemDone: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderStyle: "solid",
    borderColor: 'black',
    backgroundColor: "rgb(76,255,3)",
    borderWidth: 1
  },
  input: {
    width: '100%',
    marginBottom: 10,
    borderStyle: "solid",
    borderColor: 'black',
    borderWidth: 1,
    padding: 2
  },
  "m-2": {
    margin: 10
  },
  "mt-2": {
    marginTop: 10
  },
  "mb-2": {
    marginBottom: 10
  },
  "mb-1": {
    marginBottom: 5
  }
});
