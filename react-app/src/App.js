//citation for button click: https://upmostly.com/tutorials/calling-a-react-component-on-button-click
import * as React from "react";
import './App.css';
import {ListNode} from "./ListNode";
import {useState} from 'react';
import {Container, Button} from 'react-floating-action-button'
import {Menu, MenuItem, MenuButton, SubMenu} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import Select from 'react-select' ; //https://react-select.com/home


import {getDatabase, ref, set, get, snapshot, onValue, getDocs} from "firebase/database";

// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
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
const database = getDatabase();

//example node for json - which is sorted by classification
const bauble = {name: 'root',
                description: 'info',
                children: [],
                classification: "class"};

const options = [{value:"diagnostics", label: 'Diagnostics'},
                 {value:"measures", label: 'Measures'},
                 {value:"product_factors", label: 'Product Factors'},
                 {value:"quality_aspects", label: 'Quality Aspects'},
                 {value:"tqi", label: 'TQI'}];

const storage = [];

function App() {

    // with reference from https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
    // and https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
    let nodes = [];
    if (window.sessionStorage.getItem('storeNode') != null) {
        nodes = window.sessionStorage.getItem('storeNode').split(",");
        console.log(nodes);
    }

    function setPosition(item) {
        if (document.getElementById(item) != null) {
            console.log(document.getElementById(item));
            document.getElementById(item).style.position = 'absolute';
            if (window.sessionStorage.getItem(item) != null) {
                var positions = window.sessionStorage.getItem(item).split(",");
                console.log(positions);
                //console.log(positions[0]);
                //console.log(positions[1]);
                document.getElementById(item).style.left = positions[0];
                //console.log(document.getElementById(item).style.left);
                document.getElementById(item).style.top = positions[1];
            }
        }
    }

    function addComponent() {
        closeForm();
        const elements = document.getElementById("form").elements;
        console.log(elements[0].value + "; " + elements[1].value + "; "+ elements[2].value + "; ");
        let n = {name: elements[0], description: elements[1].value, children: [], classification: "class"}
        storage.push(n);
        console.log(storage);
        nodes.unshift(elements[0].value);
        console.log(nodes);
        nodes.forEach(setPosition);
        window.sessionStorage.setItem('storeNode', nodes.toString());
        document.getElementById("form").reset();
    }

    function toJSON() {
        var JsonObject = JSON.parse(JSON.stringify(storage));
        console.log(JsonObject);
    }

    function openForm() {
        document.getElementById("popup").style.display = "block";
    }

    function closeForm() {
        document.getElementById("popup").style.display = "none";
    }

    function load_file() {
        var name = window.prompt("Enter file name ");
        const test = ref(database, name + '/');
        return onValue(test), (snapshot) => {
            const test2 = (snapshot.val() && snapshot.val().test2) || 'Testing';
        },
            {onlyOnce: true}
    };

    function write_file() {
        var name = window.prompt("Enter the file name: ");
        set(ref(database, name + '/'), {
            name: name,
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
                <div className="form-popup" id="popup">
                    <form className="form-container" method="get" id="form">
                        <h2>Input Node Info</h2>

                        <b>Name</b>
                        <input type="text"
                               placeholder="NodeName"
                               name="name"/>

                        <b>Description</b>
                        <input type="text"
                               placeholder="Description"
                               name="info"/>

                        <div></div>

                        <b>Classification</b>
                        {/* diagnostic, measures, product_factors, quality_aspects, tqi*/}
                        <Select options={options} />

                        <Button
                            tooltip="Submit"
                            styles={{backgroundColor: "#04AA6D", color: "#FFFFFF"}} onClick={addComponent}
                        />
                    </form>
                </div>

                <Container>
                    <Button
                        tooltip="New Node"
                        styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}} onClick={openForm}
                    />
                </Container>
                {nodes.map((item, i) => (<ListNode key={i} text={item}/>))}
            </div>
        </div>
    );
}

export default App;
