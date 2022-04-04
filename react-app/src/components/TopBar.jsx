import React from 'react';
import './TopBar.css';
// import MaterialIcon from "material-icons-react";

// XArrows Code forked from: https://github.com/Eliav2/react-xarrows/tree/master/examples
const actions = {
    // node: ['Add Connections', 'Remove Connections', 'Delete'],
    node: ['Edit Name', 'Add Connections', 'Delete', 'Show Information'],
    arrow: ['Edit Properties', 'Remove Connection'],
};

const TopBar = (props) => {
    const handleEditAction = (action) => {
        switch (action) {
            case 'Edit Name':
                props.setNodes((nodes) => {
                    let newName = prompt('Enter new name: ');
                    while ([...nodes, ...props.interfaces].map((a) => a.id).includes(newName))
                        newName = prompt('Name already in use, please choose another: ');
                    if (newName === null) {
                        return;
                    }
                    return nodes.map((node) => (node.id === props.selected.id ? { ...node, id: newName } : node));
                });
                break;
            case 'Add Connections':
                props.setActionState(action);
                break;
            case 'Remove Connections':
                props.setActionState(action);
                break;
            case 'Show Information':
                props.showInfo(props.selected.id);
                break;
            case 'Remove Connection':
                props.setLines((lines) =>
                    lines.filter(
                        (line) => !(line.props.root === props.selected.id.root && line.props.end === props.selected.id.end)
                    )
                );
                break;
            case 'Edit Properties':
                props.setLines((lines) =>
                    lines.map((line) =>
                        line.props.root === props.selected.id.root && line.props.end === props.selected.id.end
                            ? {
                                ...line,
                                menuWindowOpened: true,
                            }
                            : line
                    )
                );
                break;
            case 'Delete':
                if (window.confirm(`Are you sure you want to delete ${props.selected.id}?`)) {
                    // first remove any lines connected to the node.
                    props.setLines((lines) => {
                        return lines.filter(
                            (line) => !(line.props.root === props.selected.id || line.props.end === props.selected.id)
                        );
                    });
                    // if it is a node remove from nodes
                    if (props.nodes.map((box) => box.id).includes(props.selected.id)) {
                        props.setNodes((nodes) => nodes.filter((box) => !(box.id === props.selected.id)));
                    }
                    props.handleSelect(null);
                }
                break;
            default:
        }
    };

    const returnTopBarAppearance = () => {
        let allowedActions = [];
        if (props.selected) allowedActions = actions[props.selected.type];
        switch (props.actionState) {
            case 'Normal':
                return (
                    <div className="actionBubbles">
                        {allowedActions.map((action, i) => (
                            <div className="actionBubble" key={i} onClick={() => handleEditAction(action)}>
                                {action}
                            </div>
                        ))}
                    </div>
                );
            case 'Add Connections':
                return (
                    <div className="actionBubbles">
                        <p>Which node do you want to connect to?</p>
                        <div className="actionBubble" onClick={() => props.setActionState('Normal')}>
                            Finish
                        </div>
                    </div>
                );

            case 'Remove Connections':
                return (
                    <div className="actionBubbles">
                        <p>Which connection do you want to remove?</p>
                    </div>
                );
            default:
        }
    };

    return (
        <div
            className="topBarStyle"
            style={{ height: props.selected === null ? '0' : '60px' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="topBarLabel" onClick={() => props.handleSelect(null)}> </div>
            {returnTopBarAppearance()}
        </div>
    );
};

export default TopBar;
