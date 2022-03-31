import React, { useState } from "react";
import "./App.css";
import Node from "./components/Node";
import TopBar from "./components/TopBar";
import Xarrow from "./components/Xarrow";
import { Xwrapper } from "react-xarrows";
import { Container, Button } from 'react-floating-action-button'
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import Select from 'react-select' ; //https://react-select.com/home

import {getDatabase, ref, set, get, snapshot, onValue, getDocs} from "firebase/database";
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";

// XArrows Code forked from: https://github.com/Eliav2/react-xarrows/tree/master/examples

// Import the functions you need from the SDKs you need
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



//put in order of appearance in JSON
const options = [{value:"tqi", label: 'TQI'},
    {value:"quality_aspects", label: 'Quality Aspects'},
    {value:"product_factors", label: 'Product Factors'},
    {value:"measures", label: 'Measures'},
    {value:"diagnostics", label: 'Diagnostics'}];

const storage = [];
const TYPE = ["node"];

const App = () => {
    // with reference from https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
    // and https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
    let nodeName = "";
    let nodeDesc = "";
    let nodeType = "other";

    const [interfaces, setInterfaces] = useState([]);

    const [nodes, setNodes] = useState([]);
    const [lines, setLines] = useState([]);

    const [selected, setSelected] = useState(null);
    const [actionState, setActionState] = useState("Normal");

    const handleSelect = (e) => {
        if (e === null) {
            setSelected(null);
            setActionState("Normal");
        } else setSelected({id: e.target.id, type: "node"});
    };

    const checkExistence = (id) => {
        return [...nodes, ...interfaces].map((b) => b.id).includes(id);
    };

    // from https://www.youtube.com/watch?v=Px4Lm8NixtE
    function getName(prop){ nodeName = prop.target.value; }
    function getDesc(prop){ nodeDesc = prop.target.value; }
    function getType(prop){ nodeType = prop.value; }

    const handleDropDynamic = (e) => {
        let l = nodes.length;
        let { x, y } = e.target.getBoundingClientRect();
        let object = TYPE[0];
        while (checkExistence("node" + l)) l++;
        if(nodeName === ""){
            nodeName = "node" + l;
        }
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: [],
            x: 500,
            y: 500,
            // The x and y coordinates should be the location where the node is dropped, but it's not working?
            // x: e.clientX - x,
            // y: e.clientY - y,
            shape: object};
        setNodes([...nodes, newNode]);
        // let s = { [nodeType] : { [nodeName]: {desc: nodeDesc, children: []}}};
        let s = { id: nodeName, desc: nodeDesc, type: nodeType, children: []};
        storage.push(s);
        console.log(nodeName + "; " + nodeDesc + "; "+ nodeType + "; ");
        closeForm();
    }

    function showInfo(selected) {
        openInfo();
        const index = storage.findIndex(item => {
            return item.id === selected;
        });
        const name = document.getElementById("info-name");
        name.innerHTML = storage[index].id.toString();
        const desc = document.getElementById("info-desc");
        desc.innerHTML = storage[index].desc.toString();
        const type = document.getElementById("info-type");
        type.innerHTML = storage[index].type.toString();
    }

    function nameFile(){
        let d = new Date();
        let t = d.getMonth() + "_" + d.getDay() + "_" + d.getHours() + ":" + d.getMinutes();
        let fileName = window.prompt("Enter the filename: ", t)
        toJSON(fileName);
    }

    function clean(arr){
        let clean = [];
        arr.sort();
        let i = 0;
        clean.push(arr[i]);
        for (let j = 1; j < arr.length; j++){
            if(arr[j] !== arr[i]){
                clean.push(arr[j]);
                i = j;
            }
        }
        return clean;
    }

    //https://infinitbility.com/how-to-get-key-and-value-from-json-object-in-javascript
    function findNode(node){
        return (node.id === this);
    }

    //https://www.w3schools.com/jsref/jsref_foreach.asp
    //can add children but not delete them
    function addChildren(l){
        let child = l.props.end;
        let p = l.props.start;
        let parent = storage.find(findNode, p);
        console.log(parent.children);
        parent.children.push(child);
        parent.children = clean(parent.children);
        console.log(storage);
    }

    function format(arr){
        let format = [];
            for (const o in options) {
                //output = key: value;
                // key == options[o].label
                // value == entryArr
                //         entry key = nodeName; value = info
                //                                       info == {desc: "", child: []}

                let entryArr = []; // array of {[nodeName] : info} in a specific classification
                    let optionArr = arr.filter(a => a.type === options[o].value);
                    console.log(optionArr);
                    optionArr.sort((x, y) => (x.id > y.id) ? 1 : -1);
                    for (const n in optionArr) {
                        let node = optionArr[n];
                        let entryKey = node.id;
                        let entryValue = {description: node.desc, children: node.children + " instance"}
                        let entry = {[entryKey]: entryValue};
                        entryArr.push(entry);
                    }
                console.log(entryArr);
                let org = {[options[o].label]: entryArr};
                console.log(org);
                format.push(org);
                format.sort();
        }
        return format;
        //format will have 5 keys: each of the options.label
        //format = { [nodeType]:
        //                      [ {[nodeName]:
        //                                      {desc: nodeDesc, children: []}
        //                         }]
        //          };
    }

    function toJSON(prop) {
        lines.forEach(addChildren);
        let s = format(storage);
        const data = new Blob([JSON.stringify(s)], {type: 'application/json'});
        const a = document.createElement('a');
        a.download = (prop + ".txt");
        a.href = URL.createObjectURL(data);
        a.addEventListener('click', (e) => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
        window.alert("JSON data is save to " + prop + ".txt");
    }

    function openInfo() {
        document.getElementById("info").style.display = "block";
    }

    function closeInfo() {
        document.getElementById("info").style.display = "none";
    }

    function openForm() {
        document.getElementById("popup").style.display = "block";
    }

    function closeForm() {
        document.getElementById("popup").style.display = "none";
        document.getElementById("inputName").value = "";
        document.getElementById("inputDesc").value = "";
        //i just don't know why it won't reset like inputName and Desc
        //document.getElementsByTagName("Select").defaultValue = {value: "other", label: 'Other'};
    }

    //fetch from JSON Youtube: https://www.youtube.com/watch?v=aJgAwjP20RY
    function load_file() {
        let name = window.prompt("Enter file name ");
        const test = ref(database, name + '/');
        return onValue(test), (snapshot) => {
            const test2 = (snapshot.val() && snapshot.val().test2) || 'Testing';
        },
            {onlyOnce: true}
    };

    function write_file() {
        let name = window.prompt("Enter the file name: ");
        set(ref(database, name + '/'), {
            name: name,
        });
    }

    const props = {
        interfaces,
        setInterfaces,
        nodes,
        setNodes,
        selected,
        handleSelect,
        showInfo,
        actionState,
        setActionState,
        lines,
        setLines
    };

    const nodeProps = {
        nodes,
        setNodes,
        selected,
        showInfo,
        handleSelect,
        actionState,
        setLines,
        lines
    };

    return (
        <div>
            {/* Workable area needs to be wrapped in Xwrapper so xarrows dynamically re-renders */}
            <Xwrapper>
                {/* Root Canvas */}
                <div
                    className="canvasStyle"
                    id="canvas"
                    onClick={() => handleSelect(null)} >
                    {/* Drag and Drop Tool Bar*/}
                    <div className="toolboxMenu">
                        {TYPE.map((shapeName) => (
                            <div
                                key={shapeName}
                                className={shapeName}
                                onDragStart={(e) =>
                                    e.dataTransfer.setData("shape", shapeName)
                                }
                                draggable
                            >
                                {"Drag Me!"}
                            </div>
                        ))}
                    </div>
                    {/* Nodes Play Space */}
                    <div
                        id="nodesContainer"
                        className="nodesContainer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={openForm}
                    >
                        {/* Dropdown Node Options */}
                        <TopBar {...props} />

                        {/* New Node Mapping */}
                        {nodes.map((node, i) => ( <Node
                                {...nodeProps}
                                key={i} // this seems to be the way to make sure every child has a unique id in a list
                                box={node}
                                position="absolute"
                                sidePos="middle"
                            />
                        ))}

                        {/* Add Node Popup Menu */}
                        <div className="form-popup" id="popup">
                            <div className="form-container" id="form">
                                <h2>Input Node Info</h2>
                                <b>Name</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="inputName"
                                       onChange={getName}/>
                                <b>Description</b>
                                <input type="text"
                                       placeholder="Description"
                                       id="inputDesc"
                                       onChange={getDesc}/>
                                <b>Classification</b>
                                {/* diagnostic, measures, product_factors, quality_aspects, tqi*/}
                                {/* drop-down messed up for showing values or resetting value*/}
                                <Select id="inputType" options={options} value={"Other"} onChange={getType} />
                                {/* Submission Button */}
                                <Button
                                    tooltip="Submit"
                                    styles={{backgroundColor: "#04AA6D", color: "#FFFFFF"}} onClick={handleDropDynamic}
                                />
                            </div>
                        </div>
                        {/* Node Information Popup */}
                        <div className="info-popup" id="info">
                            <div className="info-container" id="display-info">
                                <h2>Current Node Info</h2>
                                <b>Name</b>
                                <p id="info-name">Name</p>
                                <b>Description</b>
                                <p id="info-desc">Desc</p>
                                <b>Classification</b>
                                <p id="info-type">Type</p>
                                <Button
                                    tooltip="Exit"
                                    styles={{backgroundColor: "red", color: "#FFFFFF"}} onClick={closeInfo}
                                />
                            </div>
                        </div>
                        {/* Menu Interface */}
                        <div className="Menu">
                            <Menu menuButton={<MenuButton className="btn-primary">Menu</MenuButton>}>
                                <MenuItem>Load</MenuItem>
                                <MenuItem onClick={nameFile}>Save</MenuItem>
                                {<><SubMenu label="Preset">
                                    <MenuItem id="csharp" value="test" onClick={load_file}>Csharp Model</MenuItem>
                                    <MenuItem id="bin" value="test" onClick={load_file}> Bin Model</MenuItem>
                                </SubMenu><MenuItem onClick={write_file}>database</MenuItem>
                                <MenuItem>Export</MenuItem></>}
                            </Menu>
                        </div>
                    </div>
                    {/* Xarrow Connections*/}
                    {lines.map((line, i) => (
                        <Xarrow
                            key={line.props.root + "-" + line.props.end + i}
                            line={line}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    ))}
                </div>
            </Xwrapper>
        </div>
    );
};

export default App;
