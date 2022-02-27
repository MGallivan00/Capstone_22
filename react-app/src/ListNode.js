import React from 'react';
import { Drag } from "./Draggable";

const ListNode = (props) => {

    return (

        <div className="Node" id={props.text} onMouseDown={Drag} >
            <h1 id={props.text}>{props.text}</h1>
        </div>

    );

};

export {ListNode};