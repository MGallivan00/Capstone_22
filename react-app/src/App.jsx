/**********************
 * PIQUE (Platform for Investigative software Quality Understanding and Evaluation)
 * Quality Model Creation GUI
 * CSCI 483R: Interdisciplinary Capstone Project
 * Dr. Clemente Izurieta
 * Spring 2022
 **********************
 * Developed by:
 *  Maria Gallivan
 *  Dawson Kanehl
 *  Zoe Norden
 *  Connor Snow
 **********************/

/* Imports */
import React, {useState} from "react";
import "./App.css";
import Node from "./components/Node";
import TopBar from "./components/TopBar";
import Xarrow from "./components/Xarrow";
import {Xwrapper} from "react-xarrows";
import {Menu, MenuButton, MenuItem, SubMenu} from '@szhsin/react-menu';
import {getDatabase} from "firebase/database";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {Button} from 'react-floating-action-button'
import Select from 'react-select';
import '@szhsin/react-menu/dist/index.css';

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

const bool_options = [
    {value: false, label: "False"},
    {value: true, label: "True"}];

const config_options = [
    {value: "benchmark_strategy", label: "Benchmark Strategy"},
    {value: "weights_strategy", label: "Weights Strategy"},
    {value: "normalizer", label: "Normalizer"}];

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
        "global_config":{},
        "factors": {
            "tqi": {},
            "quality_aspects": {},
            "product_factors": {}
        },
        "measures": {},
        "diagnostics": {}
    };

// For copying current info to compare with new info
let currentNodeInfo = {
    nodeName : null,
    nodeDesc : null,
    nodeType : "other",
    toolName : null,
    is_positive : null,
    config_key: null,
}

// Current node gets set when the edit node function is called on the selected node
let currentNode = {};

const App = () => {
    /* References:
     * https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
     */

    // Default node values
    let
        nodeName = null,
        nodeDesc = null,
        nodeType = "other",
        toolName = null,
        is_positive = null,
        config_key = null;

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

    // Set functions for Node properties
    function setName(prop){ nodeName = prop.target.value; }
    function setDesc(prop){ nodeDesc = prop.target.value; }
    function setType(prop){ nodeType = prop.value; }
    function setTool(prop){ toolName = prop.target.value; }
    function setBool(prop){ is_positive = prop.value; }
    function setConfigKey(prop){ config_key = prop.value; }
    // function setConfigValue(prop){ config_value= prop.target.value; }

    /*
     * For all these change (set) functions, they check the initial value of the selected node
     * and compare it to the current value coming in, if they are different, then the user provided
     * changes are written to the standard node fields. If they are not different, then the standard
     * node fields get set to the initial values of teh selected node.
     */
    function changeName(prop){
        if (prop.target.value !== currentNodeInfo.nodeName)
            nodeName = prop.target.value;
        else
            nodeName = currentNodeInfo.nodeName;
    }
    function changeDesc(prop){
        if (prop.target.value !== currentNodeInfo.nodeDesc)
            nodeDesc = prop.target.value;
        else
            nodeDesc = currentNodeInfo.nodeDesc;
    }
    function changeType(prop){
        if (prop.value !== currentNodeInfo.nodeType)
            nodeType = prop.value;
        else
            nodeType = currentNodeInfo.nodeType;
    }
    function changeTool(prop){
        if (prop.target.value !== currentNodeInfo.toolName)
            toolName = prop.target.value;
        else
            toolName = currentNodeInfo.toolName;
    }
    function changeBool(prop){
        if (prop.value !== currentNodeInfo.is_positive)
            is_positive = prop.value;
        else
            is_positive = currentNodeInfo.is_positive;
    }
    function changeConfigKey(prop){
        if (prop.value !== currentNodeInfo.config_key)
            config_key = prop.value;
        else
            config_key = currentNodeInfo.config_key;
    }

    /**
     * Handles node drag-drop functionality. Pushes node information into an entry on the local "storage"
     * array. In addition, when a node is added a properly formatted JSON object is pushed onto the "model_object"
     * that is used in creating the model that is exported to the user.
     * @function
     */
    function handleDropDynamic() {
        closeForm();
        let l = nodes.length;
        /*TODO: Set function to look for event, get the bounding client,
         * and set x, y coordinates to the bounding rectangle client.
         */
        // let { x, y } = e.target.getBoundingClientRect();
        let object = TYPE[0];
        while (checkExistence("node" + l)) l++;
        if(nodeName === null || nodeName === ""){
            nodeName = "node" + l;
        }
        // This adds to the local storage array containing all nodes
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: {},
            positive: is_positive,
            t_name: toolName,
            c_key: config_key,
            x: 500,
            y: 500,
            /*TODO: The x and y coordinates should be mapped to the
             * place they are dropped on the screen
             */
            // x: e.clientX - x,
            // y: e.clientY - y,
            shape: object};
        setNodes([...nodes, newNode]);
        storage.push(newNode);
        console.log(storage);
    }

    /**
     * Grabs the selected node information and manipulates the HTML to display the current node info
     * @function
     */
    function showInfo(selected) {
        const index = nodes.findIndex(item => {
            return item.id === selected;
        });
        const name = document.getElementById("info-name");
        if (nodes[index].id != null)
            name.innerHTML = nodes[index].id.toString();
        const desc = document.getElementById("info-desc");
        if (nodes[index].desc != null)
            desc.innerHTML = nodes[index].desc.toString();
        const type = document.getElementById("info-type");
        if (nodes[index].type != null)
            type.innerHTML = nodes[index].type.toString();
        const pos = document.getElementById("info-pos");
        if (nodes[index].positive != null)
            pos.innerHTML = nodes[index].positive.toString();
        const tool = document.getElementById("info-tool");
        if (nodes[index].t_name != null)
            tool.innerHTML = nodes[index].t_name.toString();
        const config = document.getElementById("info-config");
        if (nodes[index].c_key != null)
            config.innerHTML = nodes[index].c_key.toString();
        openInfo();
    }

    function setEdit(selected) {
        let index = nodes.findIndex(element => element.id === selected);
        currentNode = nodes[index];
        currentNodeInfo.nodeName = currentNode.id;
        currentNodeInfo.nodeDesc = currentNode.desc;
        currentNodeInfo.nodeType = currentNode.type;
        currentNodeInfo.toolName = currentNode.t_name;
        currentNodeInfo.is_positive = currentNode.positive;
        currentNodeInfo.config_key = currentNode.config_key;
        currentNodeInfo.config_value = currentNode.config_value;
        openEdit();
    }

    /**
     * @function
     * Maps all accepted changes to the currently selected node object. Called in the onClick event of
     * the HTML element for the edit menu
     * @param props provided by props const array
     * @param selected when edit is called (within TopBar.jsx) a copy of the selected item in the
     * storage array is assigned to a global currentNode object.
     */
    function acceptEdit(props, selected) {
        closeEdit();
        props.setNodes((storage) => {
            if ([...storage, ...props.interfaces].map((a) => a.id).includes(nodeName)) {
                alert('Name already in use, please choose another!');
            }
            else if (nodeName === null) {
                return;
            }
            return storage.map((node) => (node.id === selected.id ? {
                ...node,
                id: nodeName,
                desc: nodeDesc,
                type: nodeType,
                t_name : toolName,
                is_pos : is_positive,
                c_key: config_key,
            } : node));
        });
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
        nodes.sort((a, b) => (a.type > b.type) ? 1 : -1);
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
            config = obj.global_config,
            factors = obj.factors,
            measures = obj.measures,
            diagnostics = obj.diagnostics;
        // handles model name
        store_node_from_JSON(
            name,
            "",
            "name",
            null,
            null,
            null,
            null);
        for (let config_type in config) {
            switch(config_type) {
                case "benchmark_strategy":
                    store_node_from_JSON(
                        config[config_type],
                        null,
                        "global_config",
                        null,
                        null,
                        null,
                        config_type
                    )
                    break;
                case "normalizer":
                    store_node_from_JSON(
                        config[config_type],
                        null,
                        "global_config",
                        null,
                        null,
                        null,
                        config_type
                    )
                    break;
                case "weights_strategy":
                    store_node_from_JSON(
                        config[config_type],
                        null,
                        "global_config",
                        null,
                        null,
                        null,
                        config_type
                    )
                    break
            }
        }
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
        // Copies loaded JSON into model object for exporting
        populate_model();
    }

    /**
     * Populates the model object when a file is uploaded. The store_node_from_JSON function only populates the
     * local storage array that holds the node info necessary for populating the screen. Without this function,
     * a blank file will be exported.
     * @function
     */
    function populate_model() {
        for (let i = 0; i < nodes.length; i++) {
            let nodeType = nodes[i].type,
                config_key = nodes[i].c_key,
                nodeName = nodes[i].id,
                nodeDesc = nodes[i].desc,
                children = nodes[i].children,
                is_positive = nodes[i].positive,
                toolName = nodes[i].t_name;
            switch (nodeType) {
                case "name":
                    model_object.name = nodeName;
                    break;
                case "global_config":
                    model_object.global_config[config_key] = nodeName;
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
    function store_node_from_JSON(nodeName, nodeDesc, nodeType, nodeChildren, isPositive, toolName, configType){
        let object = TYPE[0],
            nodewidth = nodeName.toString().length,
            xpos, ypos;

        // sets height of node by Type
        switch (nodeType){
            case "name":
                ypos = 90;
                break;
            case "global_config":
                ypos = 180;
                break;
            case "tqi":
                ypos = 270;
                break;
            case "quality_aspects":
                ypos = 360;
                break;
            case "product_factors":
                ypos = 450;
                break;
            case "measures":
                ypos = 540;
                break;
            case "diagnostics":
                ypos = 630;
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

        //creates the node from load
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: nodeChildren,
            positive: isPositive,
            t_name: toolName,
            c_key: configType,
            x: xpos,
            y: ypos,
            shape: object};
        setNodes([...nodes, newNode]);
        nodes.push(newNode);
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
        const name = document.getElementById("info-name");
        name.innerHTML = "No Name";
        const desc = document.getElementById("info-desc");
        desc.innerHTML = "No Description";
        const type = document.getElementById("info-type");
        type.innerHTML = "No Type";
        const pos = document.getElementById("info-pos");
        pos.innerHTML = "Invalid";
        const tool = document.getElementById("info-tool");
        tool.innerHTML = "No Tool Name";
        const config = document.getElementById("info-config");
        config.innerHTML = "No Config Type";
    }
    // Display edit node information popup
    function openEdit() {
        document.getElementById("edit").style.display = "block";
    }
    function closeEdit() {
        document.getElementById("edit").style.display = "none";
        document.getElementById("inputName").value = "";
        document.getElementById("inputDesc").value = "";
        document.getElementById("toolName").value = "";
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


    // Properties
    const props = {
        interfaces,
        setInterfaces,
        nodes: nodes,
        setNodes: setNodes,
        selected,
        showInfo,
        setEdit,
        handleSelect,
        actionState,
        setActionState,
        lines,
        setLines
    };

    // Node properties
    const nodeProps = {
        nodes: nodes,
        setNodes: setNodes,
        selected,
        showInfo,
        setEdit,
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
                        {nodes.map((node, i) => ( <Node
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
                                       onChange={setName}/>
                                <b>Description</b>
                                <input type="text"
                                       placeholder="Description"
                                       id="inputDesc"
                                       onChange={setDesc}/>
                                <br/>
                                <b>Classification</b>
                                {/*tqi, quality_aspects, product_factors, measures, diagnostics*/}
                                {/* drop-down messed up for showing values or resetting value*/}
                                <Select id="inputType"
                                        options={options}
                                        value={"Other"}
                                        onChange={setType} />
                                <br/>
                                <b>Positive? (for Measures)</b>
                                <Select id="positiveType"
                                        options={bool_options}
                                        value={"Bool"}
                                        onChange={setBool} />
                                <br/>
                                <b>Tool Name (for Diagnostics)</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="toolName"
                                       onChange={setTool}/>
                                <br/>
                                <b>Global Config Info</b>
                                <Select type="configType"
                                        options={config_options}
                                        value={"Config"}
                                        onChange={setConfigKey} />
                                {/*<input type="text"*/}
                                {/*       placeholder="Config Value"*/}
                                {/*       id="configValue"*/}
                                {/*       onChange={setConfigValue}/>*/}
                                {/* Submission Button */}
                                <Button
                                    id="submit-btn"
                                    tooltip="Submit"
                                    styles={{backgroundColor: "#04AA6D", color: "#FFFFFF"}}
                                    onClick={handleDropDynamic}
                                />
                            </div>
                        </div>
                        {/* Edit node popup menu*/}
                        <div className="edit-popup" id="edit">
                            <div className="edit-container" id="display-edit">
                                <h2>Edit Node Information</h2>
                                <b>Change Node Name</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="name-change"
                                       onChange={changeName}/>
                                <b>Change Description</b>
                                <input type="text"
                                       placeholder="Description"
                                       id="desc-change"
                                       onChange={changeDesc}/>
                                <br/>
                                <b>Change Classification</b>
                                <Select id="type-change"
                                        options={options}
                                        value={"Other"}
                                        onChange={changeType} />
                                <br/>
                                <b>Change Positive? (for Measures)</b>
                                <Select id="pos-change"
                                        options={bool_options}
                                        value={"Bool"}
                                        onChange={changeBool} />
                                <br/>
                                <b>Change Tool Name (for Diagnostics)</b>
                                <input type="text"
                                       placeholder="Name"
                                       id="tool-change"
                                       onChange={changeTool}/>
                                {/* Submission Button */}
                                <Button
                                    id="submit-btn"
                                    tooltip="Submit"
                                    styles={{backgroundColor: "#f65503", color: "#FFFFFF"}}
                                    onClick={function(){acceptEdit(props, currentNode)}}
                                />
                            </div>
                        </div>
                        {/* Node Information Popup */}
                        <div className="info-popup" id="info">
                            <div className="info-container" id="display-info">
                                <h2>Current Node Info</h2>
                                <b>Name</b>
                                <p className="tab" id="info-name">No Name</p>
                                <b>Description</b>
                                <p className="tab" id="info-desc">No Description</p>
                                <b>Classification</b>
                                <p className="tab" id="info-type">No Type</p>
                                <b>Positive</b>
                                <p className="tab" id="info-pos">Invalid</p>
                                <b>Tool Name</b>
                                <p className="tab" id="info-tool">No Tool Name</p>
                                <b>Config Type</b>
                                <p className="tab" id="info-config">No Config Type</p>
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
