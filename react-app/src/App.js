//citation for button click: https://upmostly.com/tutorials/calling-a-react-component-on-button-click

import './App.css';
import { ListNode } from "./ListNode";
import { useState } from 'react';
import { Container, Button } from 'react-floating-action-button'

function App() {

    const [nodes, setNode] = useState(["Node"]);
    const [nodeNames, setNodeNames] = useState([ "Node" ]); //this will become the question


    function addComponent(){
            setNode([...nodes, nodeNames[0]]); //this will become the metadata
    }
  return (
    <div className="App">
      <header className="App-header">
          <Container>
              <Button
                  tooltip="New Node"
                  icon="fas fa-plus"
                  styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}} onClick={addComponent}
              />
          </Container>

          {nodes.map((item, i) => ( <ListNode text={item} /> ))}
      </header>
    </div>
  );
}

export default App;
