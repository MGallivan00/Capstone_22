import React from "react";
import "./Node.css";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows";

// XArrows Code forked from: https://github.com/Eliav2/react-xarrows/tree/master/examples
const Node = (props) => {
    const updateXarrow = useXarrow();
    const handleClick = (e) => {
        //so only the click event on the box will fire on not on the container itself
        e.stopPropagation();
        if (props.actionState === "Normal") {
            props.handleSelect(e);
        } else if (
            props.actionState === "Add Connections" &&
            props.selected.id !== props.box.id
        ) {
            props.setLines((lines) => [
                ...lines,
                {
                    props: { start: props.selected.id, end: props.box.id },
                    menuWindowOpened: false
                }
            ]);
        } else if (props.actionState === "Remove Connections") {
            props.setLines((lines) =>
                lines.filter(
                    (line) =>
                        !(line.root === props.selected.id && line.end === props.box.id)
                )
            );
        }
    };

    let background = null;
    if (props.selected && props.selected.id === props.box.id) {
        background = "#24bd57";
    } else if (
        (props.actionState === "Add Connections" &&
            // props.sidePos !== "right" &&
            props.lines.filter(
                (line) => line.root === props.selected.id && line.end === props.box.id
            ).length === 0) ||
        (props.actionState === "Remove Connections" &&
            props.lines.filter(
                (line) => line.root === props.selected.id && line.end === props.box.id
            ).length > 0)
    ) {
        background = "#ffeb33";
    }

    return (
        <React.Fragment>
            <Draggable
                onStart={() => props.position !== "static"}
                bounds="parent"
                onDrag={updateXarrow}
            >
                <div
                    ref={props.box.reference}
                    className={`${props.box.shape} ${props.position} hoverMarker`}
                    style={{
                        left: props.box.x,
                        top: props.box.y,
                        background
                    }}
                    onClick={handleClick}
                    id={props.box.id}
                >
                    {props.box.name ? props.box.name : props.box.id}
                </div>
            </Draggable>
        </React.Fragment>
    );
};

export default Node;
