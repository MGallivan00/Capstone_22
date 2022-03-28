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

//example node for json - which is sorted by classification
const rootNode = {name: 'root',
    description: 'info',
    children: [],
    classification: "class"};

const options = [{value:"diagnostics", label: 'Diagnostics'},
    {value:"measures", label: 'Measures'},
    {value:"product_factors", label: 'Product Factors'},
    {value:"quality_aspects", label: 'Quality Aspects'},
    {value:"tqi", label: 'TQI'}];

const storage = [];

const TYPE = ["node"];

const App = () => {
    // with reference from https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
    // and https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
    let nodesArray = [];
    if (window.sessionStorage.getItem('storeNode') != null) {
        nodesArray = window.sessionStorage.getItem('storeNode').split(",");
        console.log(nodesArray);
    }

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

    function handleDropDynamic() {
        // TODO: Finish merging the drop dynamic and the node information form
        // closeForm();
        // const elements = document.getElementById("form").elements;
        // console.log(elements[0].value + "; " + elements[1].value + "; "+ elements[2].value + "; ");
        // let n = {name: elements[0], description: elements[1].value, children: [], classification: "class"}
        // storage.push(n);
        // console.log(storage);
        // nodesArray.unshift(elements[0].value);
        // const newName =  elements[0].value;
        // let object = TYPE[0];
        // if (newName) {
        //     let newNode = {id: newName, x: 400, y: 400, shape: object};
        //     setNodes([...nodes, newNode]);
        // }
        // console.log(nodes.toString());
        // nodesArray.forEach(setPosition);
        // // window.sessionStorage.setItem('storeNode', nodesArray.toString());
        // window.sessionStorage.setItem('storeNode', nodes.toString());
        // document.getElementById("form").reset();

        /* Old drop dynamic code */
        let l = nodes.length;
        let object = TYPE[0];
        while (checkExistence("node" + l)) l++;
        const newName = prompt("Enter node name: ", "node" + l)
        if (newName) {
            let newNode = {id: newName, x: 500, y: 500, shape: object};
            setNodes([...nodes, newNode]);
        }
    }

    function setPosition(nodeEntry) {
        if (document.getElementById(nodeEntry) != null) {
            console.log(document.getElementById(nodeEntry));
            document.getElementById(nodeEntry).style.position = 'absolute';
            if (window.sessionStorage.getItem(nodeEntry) != null) {
                var positions = window.sessionStorage.getItem(nodeEntry).split(",");
                console.log(positions);
                //console.log(positions[0]);
                //console.log(positions[1]);
                document.getElementById(nodeEntry).style.left = positions[0];
                //console.log(document.getElementById(item).style.left);
                document.getElementById(nodeEntry).style.top = positions[1];
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
        nodesArray.unshift(elements[0].value);
        console.log(nodesArray);
        nodesArray.forEach(setPosition);
        window.sessionStorage.setItem('storeNode', nodesArray.toString());
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
        actionState,
        setActionState,
        lines,
        setLines
    };

    const nodeProps = {
        nodes,
        setNodes,
        selected,
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
                        <div className="toolboxTitle">Drag & drop me!</div>
                        <hr />
                        <div className="toolboxContainer">
                            {TYPE.map((shapeName) => (
                                <div
                                    key={shapeName}
                                    className={shapeName}
                                    onDragStart={(e) =>
                                        e.dataTransfer.setData("shape", shapeName)
                                    }
                                    draggable
                                >
                                    {shapeName}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Nodes Play Space */}
                    <div
                        id="nodesContainer"
                        className="nodesContainer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropDynamic}
                        // TODO: Change how the drop dynamic is handled and have it open the add node form
                        // onDrop={openForm}
                    >
                        {/* Dropdown Node Options */}
                        <TopBar {...props} />

                        {/* New Node Mapping */}
                        {/* TODO: Change mapping to work with the array that stores the nodes*/}
                        {/*{nodes.map((node) => ( <Node*/}
                        {nodes.map((node, i) => ( <Node
                                {...nodeProps}
                                key={i} // this seems to be the way to make sure every child has a unique id in a list
                                // key={node.id}
                                box={node}
                                position="absolute"
                                sidePos="middle"
                            />
                        ))}

                        {/* Original Node Mapping */}
                        {/*{nodesArray.map((item, i) => (<Node*/}
                        {/*    key={i}*/}
                        {/*    text={item}*/}
                        {/*/>))}*/}

                        {/* Add Node Button */}
                        {/*<Container>*/}
                        {/*    <Button*/}
                        {/*        tooltip="New Node"*/}
                        {/*        styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}} onClick={openForm}*/}
                        {/*    />*/}
                        {/*</Container>*/}

                        {/* Add Node Popup Menu */}
                        <div className="form-popup" id="popup">
                            <form className="form-container" method="get" id="form">
                                <h2>Input Node Info</h2>
                                <b>Name</b>
                                <input type="text"
                                       placeholder="Name"
                                       name="name"/>
                                <b>Description</b>
                                <input type="text"
                                       placeholder="Description"
                                       name="info"/>
                                <b>Classification</b>
                                {/* diagnostic, measures, product_factors, quality_aspects, tqi*/}
                                <Select options={options} />
                                {/* Submission Button */}
                                <Button
                                    tooltip="Submit"
                                    // icon="fas fa-plus"
                                    styles={{backgroundColor: "#04AA6D", color: "#FFFFFF"}} onClick={addComponent}
                                />
                            </form>
                        </div>
                        {/* Menu Interface */}
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
