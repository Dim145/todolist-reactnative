import { StatusBar } from 'expo-status-bar';
import {Button, FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useState} from "react";
import {NavigationContainer} from "@react-navigation/native";

type ToDo = {
  title: string,
  text: string,
  date: Date
};

const baseData: ToDo[] = [
  {
    title: 'Jouer à pokemon écarlate',
    text: 'Attraper les 4 légendaires',
    date: new Date()
  },
  {
    title: 'Jouer à God of War (R)',
    text: 'Niker Thor',
    date: new Date()
  }
]

const Stack = createNativeStackNavigator();

function ToDoListScreen({navigation}: any)
{
   const [todolist, setToDoList] = useState<ToDo[]>(baseData);

   const navigate = (title: string) => navigation.navigate('ToDo', {
     title: title,
     todolist: todolist
   });

   return <SafeAreaView>
     <View>
       <Button title='Add Button' color={'blue'} />

       <FlatList data={todolist} renderItem={({item}) => <View>
         <Text onPress={() => navigate(item.title)}>{item.title}</Text>
       </View>} />
     </View>
   </SafeAreaView>
}

function ToDoScreen({route, navigation}: any)
{
  const { title, todolist } = route.params;
  console.log(title)
  const todo: ToDo = todolist.find((td: ToDo) => td.title == title);

  return <View>
    <Text>{todo.title}</Text>
    <Text>{todo.date.toDateString()}</Text>
    <Text>{todo.text}</Text>
  </View>
}

export default function App() {
  return <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name='ToDoList' component={ToDoListScreen} />
      <Stack.Screen name='ToDo' component={ToDoScreen} />
    </Stack.Navigator>
  </NavigationContainer>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
