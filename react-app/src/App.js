//citation for button click: https://upmostly.com/tutorials/calling-a-react-component-on-button-click
import * as React from "react";
import './App.css';
import { ListNode } from "./ListNode";
import { useState } from 'react';
import { Container, Button } from 'react-floating-action-button'
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';


import{getDatabase,ref, set, get, snapshot, onValue,getDocs} from "firebase/database";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALd8fTT_YORi0wwJ7bC_7O347ssGlItvg",
  authDomain: "capstone-pique.firebaseapp.com",
  projectId: "capstone-pique",
  storageBucket: "capstone-pique.appspot.com",
  messagingSenderId: "981342029277",
  appId: "1:981342029277:web:e5b3373ffd6425e60c2234",
  measurementId: "G-S0HHKBR67N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database=getDatabase();

function App(){

    const [nodes, setNode] = useState(["Node"]);
    const [nodeNames, setNodeNames] = useState([ "Node3", "Node" ]); //this will become the question

    function addComponent(){
            setNode([...nodes, nodeNames[0]]); //this will become the metadata
    }

     function load_file(){
         var name=window.prompt("Enter file name ");
         const test = ref(database, name +'/');
         return onValue(test), (snapshot) =>{
             const test2 = (snapshot.val() && snapshot.val().test2) || 'Testing';
         },
         {onlyOnce:true}
     };

     function write_file(){
         var name=window.prompt("Enter the file name: ");
         set(ref(database, name +'/'),{
             name:name,
         });
     }

  return (
      <div className="App">
          <div className="Menu">
              <Menu menuButton={<MenuButton className="btn-primary">Menu</MenuButton>}>
                  <MenuItem>Load</MenuItem>
                  <SubMenu label="Preset">
                    <MenuItem id="csharp" value="test" onClick={load_file}>Csharp Model</MenuItem>
                    <MenuItem id="bin" value="test" onClick={load_file}> Bin Model</MenuItem>
                  </SubMenu>
                  <MenuItem onClick={write_file}>Save</MenuItem>
                  <MenuItem>Export</MenuItem>
              </Menu>
          </div>
      <div className="PlaySpace">
          <Container>
              <Button
                  tooltip="New Node"
                  icon={"plus"}
                  styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}} onClick={addComponent}
              />
          </Container>
          {nodes.map((item, i) => ( <ListNode key={i} text={item} /> ))}
      </div>
    </div>
  );
}

export default App;
