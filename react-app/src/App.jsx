import React, {useState} from "react";
import "./App.css";
import Node from "./components/Node";
import TopBar from "./components/TopBar";
import Xarrow from "./components/Xarrow";
import {Xwrapper} from "react-xarrows";
import {Menu, MenuButton, MenuItem, SubMenu} from '@szhsin/react-menu';
import {getDatabase, onValue, ref, set} from "firebase/database";
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
    database = getDatabase();

// Possible Node Types
const options = [
    {value:"tqi", label: 'TQI'},
    {value:"quality_aspects", label: 'Quality Aspects'},
    {value:"product_factors", label: 'Product Factors'},
    {value:"measures", label: 'Measures'},
    {value:"diagnostics", label: 'Diagnostics'}];

const
    // Arrays for storing nodes and lines
    storage = [],
    childlines = [],
    // For formatting shapes
    TYPE = ["node"],
    // Example of an exported node
    model_object = {
        "factors": {
            "tqi": {},
            "quality_aspects": {},
            "product_factors": {}
        },
        "measures": {},
        "diagnostics": {}
    };

// Load from preset variable for testing
const JSON_preset = {
    "factors": {
        "tqi": {
            "TQI": {
                "description": "Total software quality",
                "children": {
                    "QualityAspect 01": {

                    },
                    "QualityAspect 02": {

                    },
                    "QualityAspect 03": {

                    },
                    "QualityAspect 04": {

                    }
                }
            }
        },
        "quality_aspects": {
            "QualityAspect 01": {
                "description": "Performance",
                "children": {
                    "ProductFactor 01": {

                    }
                }
            },
            "QualityAspect 02": {
                "description": "Compatibility",
                "children": {
                    "ProductFactor 02": {

                    }
                }
            },
            "QualityAspect 03": {
                "description": "Maintainability",
                "children": {
                    "ProductFactor 03": {

                    },
                    "ProductFactor 04": {

                    }
                }
            },
            "QualityAspect 04": {
                "description": "Security",
                "children": {
                    "ProductFactor 05": {

                    },
                    "ProductFactor 06": {

                    }
                }
            }
        },
        "product_factors": {
            "ProductFactor 01": {
                "description": "Runtime",
                "children": {
                    "Measure 02": {

                    }
                }
            },
            "ProductFactor 02": {
                "description": "Interoperability",
                "children": {
                    "Measure 03": {

                    }
                }
            },
            "ProductFactor 03": {
                "description": "Modifiability",
                "children": {
                    "Measure 01": {

                    },
                    "Measure 04": {

                    }
                }
            },
            "ProductFactor 04": {
                "description": "Reusability",
                "children": {
                    "Measure 02": {

                    },
                    "Measure 04": {

                    }
                }
            },
            "ProductFactor 05": {
                "description": "Confidentiality",
                "children": {
                    "Measure 03": {

                    }
                }
            },
            "ProductFactor 06": {
                "description": "Integrity",
                "children": {
                    "Measure 02": {

                    },
                    "Measure 04": {

                    }
                }
            }
        }
    },
    "measures": {
        "Measure 01": {
            "description": "Formatting",
            "positive": false,
            "children": {
                "RCS1036": {

                }
            }
        },
        "Measure 02": {
            "description": "Unused variable",
            "positive": false,
            "children": {
                "CS0649": {

                },
                "RCS1163": {

                },
                "RCS1213": {

                }
            }
        },
        "Measure 03": {
            "description": "Certifications",
            "positive": false,
            "children": {
                "SCS0004": {

                }
            }
        },
        "Measure 04": {
            "description": "Naming",
            "positive": false,
            "children": {
                "VSTHRD200": {

                }
            }
        }
    },
    "diagnostics": {
        "CS0649": {
            "description": "Field is never assigned to, and will always have its default value",
            "toolName": "Roslynator"
        },
        "RCS1036": {
            "description": "Remove redundant empty line",
            "toolName": "Roslynator"
        },
        "RCS1163": {
            "description": "Unused parameter",
            "toolName": "Roslynator"
        },
        "RCS1213": {
            "description": "Remove unused member declaration",
            "toolName": "Roslynator"
        },
        "SCS0004": {
            "description": "Certificate Validation has been disabled",
            "toolName": "Roslynator"
        },
        "VSTHRD200": {
            "description": "Use &quot;Async&quot; suffix for async methods",
            "toolName": "Roslynator"
        }
    }
}

const App = () => {
    /* References:
     * https://www.delftstack.com/howto/javascript/arraylist-in-javascript/
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
     */
    let
        nodeName = "",
        nodeDesc = "",
        nodeType = "other";

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

    /**
     * Handles node drag-drop functionality. Pushes node information into an entry on the local "storage"
     * array. In addition, when a node is added a properly formatted JSON object is pushed onto the "model_object"
     * that is used in exporting to a JSON file.
     * @const
     */
    const handleDropDynamic = (e) => {
        let l = nodes.length;
        let { x, y } = e.target.getBoundingClientRect();
        let object = TYPE[0];
        while (checkExistence("node" + l)) l++;
        if(nodeName === ""){
            nodeName = "node" + l;
        }
        // This adds to the local storage array containing all nodes
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
        storage.push(newNode);
        console.log(storage);
        closeForm();
        // Pushes node entry into JSON model object to match expected format
        switch (nodeType) {
            case "tqi":
                model_object.factors.tqi[nodeName] = {};
                model_object.factors.tqi[nodeName].description = nodeDesc;
                model_object.factors.tqi[nodeName].children = {};
                break;
            case "quality_aspects":
                model_object.factors.quality_aspects[nodeName] = {};
                model_object.factors.quality_aspects[nodeName].description = nodeDesc;
                model_object.factors.quality_aspects[nodeName].children = {};
                break;
            case "product_factors":
                model_object.factors.product_factors[nodeName] = {};
                model_object.factors.product_factors[nodeName].description = nodeDesc;
                model_object.factors.product_factors[nodeName].children = {};
                break;
            case "measures":
                model_object.measures[nodeName] = {};
                model_object.measures[nodeName].description = nodeDesc;
                model_object.measures[nodeName].children = {};
                break;
            case "diagnostics":
                model_object.diagnostics[nodeName] = {};
                model_object.diagnostics[nodeName].description = nodeDesc;
                break;
        }
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

    // Prompts user for file name
    function nameFile(){
        // parse_JSON(JSON_preset);
        let d = new Date();
        let t = d.getMonth() + "_" + d.getDay() + "_" + d.getHours() + ":" + d.getMinutes();
        let fileName = window.prompt("Enter the filename: ", t)
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
        console.log(JSON.stringify(model_object));
        const data = new Blob([JSON.stringify(model_object)], {type: 'application/json'});
        const a = document.createElement('a');
        a.download = (prop + ".json");
        a.href = URL.createObjectURL(data);
        a.addEventListener('click', (e) => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
        window.alert("JSON data is save to " + prop + ".json");
    }

    /**
     * Takes the incoming JSON file that needs to be stored into a JSON object locally,
     * parses though it and adds entries to our local storage object. Later that object
     * is iterated over and the nodes are populated onto the screen.
     * @function
     */
    function parse_JSON(incoming_json){
        // makes JSON object parse-able
        const obj = JSON.parse(JSON.stringify(incoming_json));
        const
            factors = obj.factors,
            measures = obj.measures,
            diagnostics = obj.diagnostics;
        for (let factor in factors){
            switch(factor) {
                case "tqi":
                    let tqi_type = factors.tqi;
                    for (const name in tqi_type) {
                        store_node_from_JSON(
                            name,
                            tqi_type[name].description,
                            factor,
                            tqi_type[name].children
                        )
                    }
                    break;
                case "quality_aspects":
                    let qa_type = factors.quality_aspects;
                    for (const name in qa_type) {
                        store_node_from_JSON(
                            name,
                            qa_type[name].description,
                            factor,
                            qa_type[name].children
                        )
                    }
                    break;
                case "product_factors":
                    let pf_type = factors.product_factors;
                    for (const name in pf_type) {
                        store_node_from_JSON(
                            name,
                            pf_type[name].description,
                            factor,
                            pf_type[name].children
                        )
                    }
                    break;
            }
        }
        for (let name in measures) {
            store_node_from_JSON(
                name,
                measures[name].description,
                "measures",
                measures[name].children
            )
        }
        for (let name in diagnostics) {
            store_node_from_JSON(
                name,
                diagnostics[name].description,
                "diagnostics",
                diagnostics[name].children
            )
        }
    }

    // variables to remember number of each type of node passed to store_node_from_JSON
    let t;
    let c = 0;
    // Formats incoming JSON into the proper format for viewing on screen
    function store_node_from_JSON(nodeName, nodeDesc, nodeType, nodeChildren){
        let object = TYPE[0];
        let nodewidth = nodeName.toString().length;
        let xpos, ypos;

        // sets height of node by Type
        switch (nodeType){
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
        }
        //console.log(t + " : "  + nodeType)
        if(t !== nodeType){
            c = 0;
            t = nodeType;
        } else{
            c++;
        }
        //sets x placement of node by number type already places
        //xpos = 850 + c*150*(Math.pow(-1, storage.length % 2)); //more centered
        xpos = 250 - nodewidth*3.2 + c*200; //left justified
        //console.log(nodeName + " Storage length: " + storage.length + " x: " + xpos + " y: " + ypos);

        //creates the node from load
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: nodeChildren,
            x: xpos,
            y: ypos,
            shape: object};
        setNodes([...nodes, newNode]);
        storage.push(newNode);
        //console.log(storage);
        for (let k in nodeChildren) {
            let p = {props: {start: nodeName, end: k}};
            //console.log(p);
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
        //I just don't know why it won't reset like inputName and Desc
        //document.getElementsByTagName("Select").defaultValue = {value: "other", label: 'Other'};
    }

    // Fetch from JSON Youtube: https://www.youtube.com/watch?v=aJgAwjP20RY
    // TODO: Maria does not know what this function is for
    function load_file() {
        // parse_JSON(JSON_preset);
        let name = window.prompt("Enter file name ");
        const test = ref(database, name + '/');
        return onValue(test), (snapshot) => {
            const test2 = (snapshot.val() && snapshot.val().test2) || 'Testing';
        },
            {onlyOnce: true}
    }

    // TODO: Maria does not know what this function is for
    function write_file() {
        let name = window.prompt("Enter the file name: ");
        set(ref(database, name + '/'), {
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
                    {/* Drag and Drop Tool Box*/}
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
                                {/*tqi, quality_aspects, product_factors, measures, diagnostics*/}
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
                                <MenuItem onClick={load_file}>Load</MenuItem>
                                <MenuItem onClick={nameFile}>Save</MenuItem>
                                {<><SubMenu label="Preset">
                                    <MenuItem id="csharp" value="test" onClick={load_file}>Csharp Model</MenuItem>
                                    <MenuItem id="bin" value="test" onClick={load_file}> Bin Model</MenuItem>
                                {/* TODO: What is the database button supposed to do? */}
                                </SubMenu><MenuItem onClick={write_file}>Database</MenuItem>
                                    <MenuItem>Export</MenuItem></>}
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
