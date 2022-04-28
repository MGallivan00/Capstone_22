// Forked from: https://github.com/Eliav2/react-xarrows/tree/master/examples
import React from "react";
import "./Node.css";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows";

const Node = (props) => {
    const updateXarrow = useXarrow();
    const handleClick = (e) => {
        //so only the click event on the node will fire on not on the container itself
        e.stopPropagation();
        if (props.actionState === "Normal") {
            props.handleSelect(e);
        } else if (
            props.actionState === "Add Connections" &&
            props.selected.id !== props.node.id
        ) {
            props.setLines((lines) => [
                ...lines,
                {
                    props: { start: props.selected.id, end: props.node.id },
                }
            ]);
        } else if (props.actionState === "Remove Connections") {
            props.setLines((lines) =>
                lines.filter(
                    (line) =>
                        !(line.root === props.selected.id && line.end === props.node.id)
                )
            );
        }
    };

    let background = null;
    if (props.selected && props.selected.id === props.node.id) {
        background = "#24bd57";
    } else if (
        (props.actionState === "Add Connections" &&
            props.lines.filter(
                (line) => line.root === props.selected.id && line.end === props.node.id
            ).length === 0) ||
        (props.actionState === "Remove Connections" &&
            props.lines.filter(
                (line) => line.root === props.selected.id && line.end === props.node.id
            ).length > 0)
    ) {
        background = "#ffeb33";
        // Keep the model name and the config nodes the normal color to imply that you don't draw connections to it
        if ((props.node.type === "name") || (props.node.type === "global_config")) {
            background = "#00b1e1"
        }
    }

    return (
        <React.Fragment>
            <Draggable
                onStart={() => props.position !== "static"}
                bounds="parent"
                onDrag={updateXarrow}
            >
                <div
                    ref={props.node.reference}
                    className={`${props.node.shape} ${props.position} hoverMarker`}
                    style={{
                        left: props.node.x,
                        top: props.node.y,
                        background
                    }}
                    onClick={handleClick}
                    id={props.node.id}
                >
                    {props.node.name ? props.node.name : props.node.id}
                </div>
            </Draggable>
        </React.Fragment>
    );
};

export default Node;
