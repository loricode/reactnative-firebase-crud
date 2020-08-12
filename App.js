import React , { useState, useEffect }from 'react';
import { YellowBox, StyleSheet, View, FlatList,TextInput,Text
         ,TouchableHighlight} from 'react-native';
import { firebaseConfig } from './database/firebase';
import * as firebase from "firebase/app"; //npm i firebase@7.9.0
import 'firebase/firestore';

YellowBox.ignoreWarnings(["Setting a timer"]); //no deja que muestre el warning

//components
import ItemTask from './component/ItemTask'

if(!firebase.apps.length){ firebase.initializeApp(firebaseConfig);}
 const db = firebase.app();
  
export default function App() {

  const [ listTasks , setListTasks] = useState([])
  const [ materia, setMateria ] = useState('')
  const [ pregunta ,setPregunta ] = useState('')
  const [ id ,setId ] = useState('')
  const [ bandera, setBandera ] = useState(true)

  useEffect(() => {
    getTasks()

},[])

const getTasks = async() => {
    let list = [];  
    const response = await db.firestore().collection('tareas').get()
          response.forEach( document => {
          let id = document.id
          let materia = document.data().materia
          let pregunta = document.data().pregunta
          let obj = { id, materia, pregunta }
          list.push(obj);
        })
       
        setListTasks(list)
 }

   const guardar = async () => {
    let obj = { materia, pregunta }   
    if(bandera){
        await db.firestore().collection('tareas').add( obj )
        setMateria('')
        setPregunta('')
        getTasks()
      }else{
        await db.firestore().collection('tareas').doc(id).set(obj)
        setId('')
        setMateria('')
        setPregunta('')
        setBandera(true)
        getTasks()
      }
   }

   const deleteTask = async (props) => {
    await db.firestore().collection('tareas').doc(props.id).delete()  
    getTasks()
 }

 const getTask = async(props) => {
    const response = await db.firestore().collection('tareas').doc(props.id).get()
    setId(response.id)
    setPregunta(response.data().pregunta)
    setMateria(response.data().materia) 
    setBandera(false)
 }

 const renderTask = ({ item }) => (
    <ItemTask 
        id={item.id}
        materia={item.materia}
        pregunta={item.pregunta}
        deletetask={deleteTask}
        gettask={getTask}
      />
  );
  
  return (
    <View style={styles.container}>
      <View>
        <TextInput
        style={{ width:350, height: 30,fontSize:18,margin:10}}
        placeholder="Materia"
        onChangeText={e => setMateria(e)}
        value={materia}
      />
       <TextInput
        style={{width:350, height: 30 ,fontSize:18,margin:10}}
        placeholder="Pregunta"
        onChangeText={e => setPregunta(e)}
        value={pregunta}
      />
     
     <TouchableHighlight 
                 style={{padding:12, alignSelf:'center', backgroundColor:'#000'}}
                 activeOpacity={0.6}
                 underlayColor="#DDDDDD"
                 onPress={() => guardar()}>
               <Text style={{color:'#fff'}}>
                       {bandera? 'Guardar': 'Editar'}</Text>
              </TouchableHighlight>
    </View>

    <View style={{marginTop:35}}>
     <FlatList 
      data={listTasks}
      renderItem={renderTask}
      keyExtractor={item =>item.id} 
    />
     </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    
  },
});
