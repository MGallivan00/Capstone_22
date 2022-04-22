import React, {useState} from "react";
import "./App.css";
import Node from "./components/Node";
import TopBar from "./components/TopBar";
import Xarrow from "./components/Xarrow";
import {Xwrapper} from "react-xarrows";
import {Menu, MenuButton, MenuItem, SubMenu} from '@szhsin/react-menu';
import {getDatabase, onValue, set} from "firebase/database";
import {getStorage,ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {Button} from 'react-floating-action-button'
import Select from 'react-select';
import '@szhsin/react-menu/dist/index.css';
//import { getScrollTop } from "react-select/dist/declarations/src/utils";

/* Developed with code forked from:
 * https://github.com/Eliav2/react-xarrows/tree/master/examples
 */

/* References:
 * https://www.w3schools.com/jsref/jsref_foreach.asp
 * https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 * https://www.youtube.com/watch?v=Px4Lm8NixtE
 * https://react-select.com/home
 */

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
const
    app = initializeApp(firebaseConfig),
    analytics = getAnalytics(app),
    database = getDatabase(),
    dbstorage = getStorage();

// Options for Node Types
const options = [
    {value:"tqi", label: 'TQI'},
    {value:"quality_aspects", label: 'Quality Aspects'},
    {value:"product_factors", label: 'Product Factors'},
    {value:"measures", label: 'Measures'},
    {value:"diagnostics", label: 'Diagnostics'},
    {value:"name", label:'Model Name'},
    {value:"additionalData", label:'Additional Data'},
    {value:"global_config", label:'Global Config Information'}];
    // TODO: Do we include these as options, or do we just have the user manually fill it in later?
    // {value:"benchmark_strategy", label:'Benchmark Strategy'},
    // {value:"normalizer_strategy", label:'Normalizer Strategy'}];

const bool_options = [
    {value: false, label: "False"},
    {value: true, label: "True"}];
const
    // Arrays for storing nodes and lines
    storage = [],
    childlines = [],
    // For formatting shapes
    TYPE = ["node"],
    // Framework for creating/exporting model
    model_object = {
        "name": "Default",
        "additionalData":{},
        "global_config":{
            // TODO: what kind of place holders do we need for config information?
        },
        "factors": {
            "tqi": {},
            "quality_aspects": {},
            "product_factors": {}
        },
        "measures": {},
        "diagnostics": {}
    };

// Load from preset variable for testing
let JSON_preset = {};

const App = () => {
    /* References:
     * https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
     */

    // Default node values
    let
        nodeName = "",
        nodeDesc = "",
        toolName = "",
        nodeType = "other",
        is_positive = false;

    const
        [interfaces, setInterfaces] = useState([]),
        [nodes, setNodes] = useState([]),
        [lines, setLines] = useState([]),
        [selected, setSelected] = useState(null),
        [actionState, setActionState] = useState("Normal");

    // Handles Selected Nodes
    const handleSelect = (e) => {
        if (e === null) {
            setSelected(null);
            setActionState("Normal");
        } else setSelected({id: e.target.id, type: "node"});
    };

    // Checks existence of nodes
    const checkExistence = (id) => {
        return [...nodes, ...interfaces].map((b) => b.id).includes(id);
    };

    // Get functions for Node properties
    function getName(prop){ nodeName = prop.target.value; }
    function getDesc(prop){ nodeDesc = prop.target.value; }
    function getType(prop){ nodeType = prop.value; }
    function getTool(prop){ toolName = prop.target.value; }
    function getBool(prop){ is_positive = prop.value; }

    /**
     * Handles node drag-drop functionality. Pushes node information into an entry on the local "storage"
     * array. In addition, when a node is added a properly formatted JSON object is pushed onto the "model_object"
     * that is used in creating the model that is exported to the user.
     * @const
     */
    const handleDropDynamic = () => {
        let l = nodes.length;
        // TODO: If this can be implemented, it should drop the node on the screen at the location it is dropped.
        // let { x, y } = e.target.getBoundingClientRect();
        let object = TYPE[0];
        while (checkExistence("node" + l)) l++;
        if(nodeName === ""){
            nodeName = "node" + l;
        }
        // This adds to the local storage array containing all nodes
        // TODO: If check for diagnostic or measure node types
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: [],
            positive: is_positive,
            t_name: toolName,
            x: 500,
            y: 500,
            // TODO: The x and y coordinates should be the location where the node is dropped, but it's not working?
            // x: e.clientX - x,
            // y: e.clientY - y,
            shape: object};
        setNodes([...nodes, newNode]);
        storage.push(newNode);
        console.log(storage);
        closeForm();
    }

    /**
     * Grabs the selected node information and manipulates the HTML to display the current node info
     * @function
     */
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

    /**
     * Prompts user for file name and creates a JSON file that is downloaded the user's
     * downloads folder.
     * @function
     */
    function nameFile(){
        populate_model();
        let d = new Date();
        let t = d.getMonth() + "_" + d.getDay() + "_" + d.getHours() + ":" + d.getMinutes();
        let fileName = window.prompt("Enter the filename: ", t);
        export_to_JSON(fileName);
    }

    /**
     * As nodes are added to the screen, they are added into the existing global JSON "model object",
     * however, the children cannot be added to the model object until after the nodes are defined.
     * This function parses the model object with the parent key name in hand and adds the child name
     * to the parent - children structure.
     * @function
     */
    function addChildren(l){
        let parent = l.props.start,
            child = l.props.end;
        const obj = JSON.parse(JSON.stringify(model_object)),
            factors = obj.factors,
            measures = obj.measures;
        for (let factor in factors){
            switch(factor) {
                case "tqi":
                    let tqi_type = factors.tqi;
                    for (const name in tqi_type) {
                        if (name === parent) {
                            model_object.factors.tqi[parent].children[child] = {};
                        }
                    }
                    break;
                case "quality_aspects":
                    let qa_type = factors.quality_aspects;
                    for (const name in qa_type) {
                        if (name === parent) {
                            model_object.factors.quality_aspects[parent].children[child] = {};
                        }
                    }
                    break;
                case "product_factors":
                    let pf_type = factors.product_factors;
                    for (const name in pf_type) {
                        if (name === parent) {
                            model_object.factors.product_factors[parent].children[child] = {};
                        }
                    }
                    break;
                default:
                    console.log("Cannot add node to model.");
            }
        }
        for (let name in measures) {
            if (name === parent) {
                model_object.measures[parent].children[child] = {};
            }
        }
        // Diagnostic type nodes don't have children, so we don't need to worry about those.
    }

    function export_to_JSON(prop) {
        lines.forEach(addChildren);
        // console.log(JSON.stringify(model_object));
        storage.sort((a, b) => (a.type > b.type) ? 1 : -1);
        const data = new Blob([JSON.stringify(model_object)], {type: 'application/json'});
        const a = document.createElement('a');
        a.download = (prop + ".json");
        a.href = URL.createObjectURL(data);
        a.addEventListener('click', (e) => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
        //saves the json to the DB under the same name that the user entered
        let storageRef = ref(dbstorage, 'uploaded/' + prop);
        uploadBytes(storageRef, data).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
        window.alert("JSON data is save to " + prop + ".json");
    }

    /**
     * The incoming JSON file is stored as a local object and passed into this function, it
     * parses though it and adds entries to our local storage object. Later that object storage
     * is iterated over and the nodes are populated onto the screen.
     * @function
     */
    function parse_JSON(incoming_json){
        // makes JSON object parse-able
        const obj = JSON.parse(JSON.stringify(incoming_json));
        const
            name = obj.name,
            factors = obj.factors,
            measures = obj.measures,
            diagnostics = obj.diagnostics;
        for (let factor in factors){
            switch(factor) {
                case "tqi":
                    let tqi_type = factors.tqi;
                    for (const data in tqi_type) {
                        store_node_from_JSON(
                            data,
                            tqi_type[data].description,
                            factor,
                            tqi_type[data].children,
                            null,
                            null
                        )
                    }
                    break;
                case "quality_aspects":
                    let qa_type = factors.quality_aspects;
                    for (const data in qa_type) {
                        store_node_from_JSON(
                            data,
                            qa_type[data].description,
                            factor,
                            qa_type[data].children,
                            null,
                            null
                        )
                    }
                    break;
                case "product_factors":
                    let pf_type = factors.product_factors;
                    for (const data in pf_type) {
                        store_node_from_JSON(
                            data,
                            pf_type[data].description,
                            factor,
                            pf_type[data].children,
                            null,
                            null
                        )
                    }
                    break;
                default:
                    console.log("Key:Value pair not in model.");
            }
        }
        // handles model name
        store_node_from_JSON(
            name,
            "",
            "name",
            null,
            null,
            null);
        // measures
        for (let data in measures) {
            store_node_from_JSON(
                data,
                measures[data].description,
                "measures",
                measures[data].children,
                measures[data].positive,
                null
            )
        }
        // diagnostics
        for (let data in diagnostics) {
            store_node_from_JSON(
                data,
                diagnostics[data].description,
                "diagnostics",
                diagnostics[data].children,
                null,
                diagnostics[data].toolName
            )
        }
        // TODO: Copy JSON into model_object
        // console.log(storage);
        populate_model();
        // console.log(model_object);
    }

    /**
     * Populates the model object when a file is uploaded. The store_node_from_JSON function only populates the
     * local storage array that holds the node info necessary for populating the screen. Without this function,
     * a blank file will be exported.
     * @function
     */
    function populate_model() {
        for (let i = 0; i < storage.length; i++) {
            let nodeType = storage[i].type,
                nodeName = storage[i].id,
                nodeDesc = storage[i].desc,
                children = storage[i].children,
                is_positive = storage[i].positive,
                toolName = storage[i].t_name;
            switch (nodeType) {
                case "name":
                    model_object.name = nodeName;
                    break;
                case "tqi":
                    model_object.factors.tqi[nodeName] = {};
                    model_object.factors.tqi[nodeName].description = nodeDesc;
                    model_object.factors.tqi[nodeName].children = children;
                    break;
                case "quality_aspects":
                    model_object.factors.quality_aspects[nodeName] = {};
                    model_object.factors.quality_aspects[nodeName].description = nodeDesc;
                    model_object.factors.quality_aspects[nodeName].children = children;
                    break;
                case "product_factors":
                    model_object.factors.product_factors[nodeName] = {};
                    model_object.factors.product_factors[nodeName].description = nodeDesc;
                    model_object.factors.product_factors[nodeName].children = children;
                    break;
                case "measures":
                    model_object.measures[nodeName] = {};
                    model_object.measures[nodeName].description = nodeDesc;
                    model_object.measures[nodeName].positive = is_positive;
                    model_object.measures[nodeName].children = children;
                    break;
                case "diagnostics":
                    model_object.diagnostics[nodeName] = {};
                    model_object.diagnostics[nodeName].description = nodeDesc;
                    model_object.diagnostics[nodeName].toolName = toolName;
                    break;
                default:
                    console.log("Key:Value pair not in model.");
            }
        }
    }

    // variables to remember number of each type of node passed to store_node_from_JSON
    let t, c = 0;
    // Formats incoming JSON into the proper format for viewing on screen
    function store_node_from_JSON(nodeName, nodeDesc, nodeType, nodeChildren, isPositive, toolName){
        let object = TYPE[0],
            nodewidth = nodeName.toString().length,
            xpos, ypos;

        // sets height of node by Type
        switch (nodeType){
            case "name":
                ypos = 90;
                break;
            case "tqi":
                ypos = 180;
                break;
            case "quality_aspects":
                ypos = 300;
                break;
            case "product_factors":
                ypos = 420;
                break;
            case "measures":
                ypos = 540;
                break;
            case "diagnostics":
                ypos = 660;
                break;
            default:
                console.log("Node has no place in model.");
        }
        if(t !== nodeType){
            c = 0;
            t = nodeType;
        } else{
            c++;
        }
        //sets x placement of node by number type already places
        //xpos = 850 + c*150*(Math.pow(-1, storage.length % 2)); //more centered
        xpos = 250 - nodewidth*3.2 + c*200; //left justified

        // TODO: How to handle global config info?
        //creates the node from load
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: nodeChildren,
            positive: isPositive,
            t_name: toolName,
            x: xpos,
            y: ypos,
            shape: object};
        setNodes([...nodes, newNode]);
        storage.push(newNode);
        for (let k in nodeChildren) {
            let p = {props: {start: nodeName, end: k}};
            setLines([...lines, p]);
            childlines.push(p);
        }
    }

    // Displays info popup
    function openInfo() {
        document.getElementById("info").style.display = "block";
    }
    // Hides info popup
    function closeInfo() {
        document.getElementById("info").style.display = "none";
    }
    // Displays entry form popup
    function openForm() {
        document.getElementById("popup").style.display = "block";
    }
    // Hides and resets entry form popup
    function closeForm() {
        document.getElementById("popup").style.display = "none";
        document.getElementById("inputName").value = "";
        document.getElementById("inputDesc").value = "";
        document.getElementById("toolName").value = "";
        //I just don't know why it won't reset like inputName and Desc
        //document.getElementsByTagName("Select").defaultValue = {value: "other", label: 'Other'};
    }

    /**
     * This function is called on the click event for the preset options. It takes a JSON preset name,
     * defines the local file path to that JSON, loads the JSON into local storage, and passes the
     * JSON object to the parse_JSON function to be read in and loaded to screen.
     * @function
     */
    function load_preset(name) {
        let filename = name + ".json",
            JSON_preset = require(`./presets/${filename}`);
        parse_JSON(JSON_preset);
    }

    /**
     * Prompts user for file name and loads a user provided file that must be located within the
     * user_uploads folder.
     */
    function load_file() {
        let name = window.prompt("Enter file name (without the file extension)"),
            filename = name + ".json",
            loaded_JSON = require(`./user_uploads/${filename}`);
        parse_JSON(loaded_JSON);
    }

    function write_file() {
        let branch = window.prompt("Enter the branch name: ");
        let name = window.prompt("Enter the file name: ");


        set(ref(database, branch+'/'+name + '/'), {
            name: name,
        });
    }

    // Properties
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

    // Node properties
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

    ///download from firebase here

    // HTML
    return (
        <div>
            {/* Workable area needs to be wrapped in Xwrapper so Xarrows dynamically re-render */}
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
                        {storage.map((node, i) => ( <Node
                                {...nodeProps}
                                key={i} // this seems to be the way to make sure every child has a unique id in a list
                                node={node}
                                position="absolute"
                                sidePos="middle"
                            />
                        ))}
                        {/* Add Node Popup Menu */}
                        <div className="form-popup" id="popup">
                            <div className="form-container" id="form">
                                <h2>Input Node Information</h2>
                                <b>Node Name</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="inputName"
                                       onChange={getName}/>
                                <b>Description</b>
                                <input type="text"
                                       placeholder="Description"
                                       id="inputDesc"
                                       onChange={getDesc}/>
                                <br/>
                                <b>Classification</b>
                                {/*tqi, quality_aspects, product_factors, measures, diagnostics*/}
                                {/* drop-down messed up for showing values or resetting value*/}
                                <Select id="inputType"
                                        options={options}
                                        value={"Other"}
                                        onChange={getType} />
                                <br/>
                                <b>Positive? (for Measures)</b>
                                <Select id="positiveType"
                                        options={bool_options}
                                        value={"Bool"}
                                        onChange={getBool} />
                                <br/>
                                <b>Tool Name (for Diagnostics)</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="toolName"
                                       onChange={getTool}/>
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
                                <p className="tab" id="info-name">Name</p>
                                <b>Description</b>
                                <p className="tab" id="info-desc">Desc</p>
                                <b>Classification</b>
                                <p className="tab" id="info-type">Type</p>
                                <Button
                                    tooltip="Exit"
                                    styles={{backgroundColor: "red", color: "#FFFFFF"}} onClick={closeInfo}
                                />
                            </div>
                        </div>
                        {/* Menu Interface */}
                        <div className="Menu">
                            <Menu menuButton={<MenuButton className="btn-primary">Menu</MenuButton>}>
                                <MenuItem onClick={load_file}>Upload</MenuItem>
                                <MenuItem onClick={nameFile}>Save</MenuItem>
                                {<><SubMenu label="Preset">
                                    {/*<MenuItem id="csharp" value="test" onClick={function(){load_preset("csharp")}}>Csharp Model</MenuItem>*/}
                                    <MenuItem id="csharp"
                                              value="test"
                                              onClick={function(){load_preset('pique-csharp-sec-model')}}
                                    >Csharp Model
                                    </MenuItem>
                                    <MenuItem id="bin"
                                              value="test"
                                              onClick={function(){load_preset('pique-bin-model')}}
                                    >Bin Model
                                    </MenuItem>
                                    {/*TODO: Add more presets here, if necessary*/}
                                </SubMenu></>}
                            </Menu>
                        </div>
                    </div>
                    {/* Xarrow Connections for Building New Models */}
                    {lines.map((line, i) => (
                        <Xarrow
                            key={line.props.root + "-" + line.props.end + i}
                            line={line}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    ))}
                    {/* Xarrow Connections for Loading Preset and Existing Models */}
                    {childlines.map((line, i) => (
                        <Xarrow
                            key={line.props.start + "-" + line.props.end + i}
                            line={line}
                            start={line.props.start}
                            end={line.props.end}
                        />
                    ))}
                </div>
            </Xwrapper>
        </div>
    );
};

export default App;
