import { StatusBar } from 'expo-status-bar';
import {
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

type ToDo = {
  title: string,
  text: string,
  date: Date,
  state: boolean
};

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
]

const Stack = createNativeStackNavigator();

function SqlAdd(item: ToDo)
{
  console.log('sql add', item);
}

function ToDoListScreen({route, navigation}: any)
{
   const [todolist, setToDoList] = useState<ToDo[]>(baseData);

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

   const onLongPressItem = (item: ToDo) => {
     item.state = !item.state;

     setToDoList([...todolist]);
   };

   const onPressItem = (item: ToDo) => navigation.navigate('ToDo', {
     title: item.title,
     todolist: todolist
   });

   return <SafeAreaView>
     <View>
       <Button title='Add Todo' color={'blue'} onPress={() => navigation.navigate('AddItem')} />
       <Button title='Remove Todos' onPress={() => setToDoList([])} />

       <Text style={styles.listTitle}>Pending</Text>
       <FlatList data={pending} renderItem={({item}) => <View>
         <Text
             onPress={() => onPressItem(item)}
            onLongPress={() => onLongPressItem(item)}
         >{item.title}</Text>
       </View>} />

       <Text style={styles.listTitle}>Done</Text>
       <FlatList data={done} renderItem={({item}) => <View>
         <Text
             onPress={() => onPressItem(item)}
         onLongPress={() => onLongPressItem(item)
         }
         >{item.title}</Text>
       </View>} />
     </View>
   </SafeAreaView>
}

function ToDoScreen({route, navigation}: any)
{
  const { title, todolist } = route.params;
  const todo: ToDo = todolist.find((td: ToDo) => td.title == title);

  return <View>
    <Text>{todo.title}</Text>
    <Text>{todo.date.toDateString()}</Text>
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

  return <View>
    <Text>Title</Text>
    <TextInput style={styles.input} onChange={(e) => setTitle(e.nativeEvent.text)}></TextInput>

    <Text>Text</Text>
    <TextInput style={styles.input} value={item.text} onChange={(e) => setText(e.nativeEvent.text)}></TextInput>

    <Text>Date</Text>
    <Text onPress={() =>
    {
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
    flex: 1,
    margin: 8
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    width: '100%'
  }
});
