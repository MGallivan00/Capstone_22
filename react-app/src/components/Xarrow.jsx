import React, { useState } from 'react';
import Xarrow from 'react-xarrows';

export default ({ setSelected, selected, line: { props } }) => {
    const [state, setState] = useState({ color: 'coral' });
    const defProps = {
        passProps: {
            className: 'xarrow',
            onMouseEnter: () => setState({ color: 'IndianRed' }),
            onMouseLeave: () => setState({ color: 'coral' }),
            onClick: (e) => {
                //so only the click event on the node will fire on not on the container itself
                e.stopPropagation();
                setSelected({
                    id: { start: props.root, end: props.end },
                    type: 'arrow',
                });
            },
            cursor: 'pointer',
        },
    };
    let color = state.color;
    if (selected && selected.type === 'arrow' && selected.id.root === props.root && selected.id.end === props.end)
        // selected.stopPropagation();
        color = 'red';
    return <Xarrow {...{
        ...defProps,
        ...props,
        ...state,
        color,
        // TODO: You can change this field to true to show the heads
        showHead: false,
        path: "straight"}} />;
};
