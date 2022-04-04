import React, {useState} from "react";
import "./App.css";
import Node from "./components/Node";
import TopBar from "./components/TopBar";
import Xarrow from "./components/Xarrow";
import {Xwrapper} from "react-xarrows";
import {Button} from 'react-floating-action-button'
import {Menu, MenuButton, MenuItem, SubMenu} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import Select from 'react-select'; //https://react-select.com/home
import {getDatabase, onValue, ref, set} from "firebase/database";
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


const options = [
    {value:"tqi", label: 'TQI'},
    {value:"quality_aspects", label: 'Quality Aspects'},
    {value:"product_factors", label: 'Product Factors'},
    {value:"measures", label: 'Measures'},
    {value:"diagnostics", label: 'Diagnostics'}];

const storage = [];
const TYPE = ["node"];
const model_object = {
    "factors": {
        "tqi": {},
        "quality_aspects": {},
        "product_factors": {}
    },
    "measures": {},
    "diagnostics": {}
};

const storage_object = {
    id:"",
    desc:"",
    type:"",
    children:[],
    shape:"node",
    x: 500,
    y:500
}

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
        // // Pushes node entry into JSON model object to match expected format
        // switch (nodeType) {
        //     case "tqi":
        //         model_object.factors.tqi[nodeName] = {};
        //         model_object.factors.tqi[nodeName].description = nodeDesc;
        //         break;
        //     case "quality_aspects":
        //         model_object.factors.quality_aspects[nodeName] = {};
        //         model_object.factors.quality_aspects[nodeName].description = nodeDesc;
        //         break;
        //     case "product_factors":
        //         model_object.factors.product_factors[nodeName] = {};
        //         model_object.factors.product_factors[nodeName].description = nodeDesc;
        //         break;
        //     case "measures":
        //         model_object.measures[nodeName] = {};
        //         model_object.measures[nodeName].description = nodeDesc;
        //         break;
        //     case "diagnostics":
        //         model_object.diagnostics[nodeName] = {};
        //         model_object.diagnostics[nodeName].description = nodeDesc;
        //         break;
        // }
        // console.log(JSON.stringify(model_object));
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

    // Uses the package 'flat' to flatten a structured/nested JSON object
    function unnest(object) {
        const flatten = require('flat');
        return flatten(object);
    }

    // Uses the package 'flat' to inflate a flattened/un-nested JSON object
    function nest(object) {
        const unflatten = require('flat').unflatten;
        return unflatten(object);
    }

    function nameFile(){
        parse_JSON();
        // let d = new Date();
        // let t = d.getMonth() + "_" + d.getDay() + "_" + d.getHours() + ":" + d.getMinutes();
        // let fileName = window.prompt("Enter the filename: ", t)
        // toJSON(fileName);
    }

    function findNode(node){
        return (node.id === this);
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


    function parse_JSON(){
        // makes JSON object parse-able
        const obj = JSON.parse(JSON.stringify(JSON_preset));
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
                    // let entries = [];
                    for (const name in qa_type) {
                        store_node_from_JSON(
                            name,
                            qa_type[name].description,
                            factor,
                            qa_type[name].children
                        )
                        // entries.push(name);
                    }
                    // console.log(entries);
                    // entries.forEach(index => store_node_from_JSON(
                    //     index,
                    //     qa_type[index].description,
                    //     factor,
                    //     qa_type[index].children));
                    break;
                case "product_factors":
                    let pf_type = factors.product_factors;
                    // let entries = [];
                    for (const name in pf_type) {
                        store_node_from_JSON(
                            name,
                            pf_type[name].description,
                            factor,
                            pf_type[name].children
                        )
                        // entries.push(name);
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

    // Formats incoming JSON into the proper format for viewing on screen
    // TODO: Parameters?
    function store_node_from_JSON(nodeName, nodeDesc, nodeType, nodeChildren){
        let object = TYPE[0];
        let newNode = {
            id: nodeName,
            desc: nodeDesc,
            type: nodeType,
            children: nodeChildren,
            shape: object};
        setNodes([...nodes, newNode]);
        storage.push(newNode);
        console.log(storage);
    }

    // Formats entries into the proper nested format before writing to file
    function save_format(arr){
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
                let entryValue = {description: node.desc, children: node.children}
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
        let s = save_format(storage);
        const data = new Blob([JSON.stringify(s)], {type: 'application/json'});
        const a = document.createElement('a');
        a.download = (prop + ".json");
        a.href = URL.createObjectURL(data);
        a.addEventListener('click', (e) => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
        window.alert("JSON data is save to " + prop + ".json");
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
    }

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
