//citation for button click: https://upmostly.com/tutorials/calling-a-react-component-on-button-click

import './App.css';
import { ListNode } from "./ListNode";
import { useState } from 'react';
import { Container, Button } from 'react-floating-action-button'
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

function App() {

    const [nodes, setNode] = useState(["Node"]);
    const [nodeNames, setNodeNames] = useState([ "Node" ]); //this will become the question


    function addComponent(){
            setNode([...nodes, nodeNames[0]]); //this will become the metadata
    }
  return (
      <div className="App">
          <div className="Menu">
              <Menu menuButton={
                  <MenuButton className="btn-primary">Menu</MenuButton>}>
                  <MenuItem>Load</MenuItem>
                  <SubMenu label="Preset">
                      <MenuItem>preset1.html</MenuItem>
                      <MenuItem>preset2.js</MenuItem>
                  </SubMenu>
                  <MenuItem>Save</MenuItem>
                  <MenuItem>Export </MenuItem>
              </Menu>
          </div>
      <header className="App-header">
          <Container>
              <Button
                  tooltip="New Node"
                  icon={"plus"}
                  styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}} onClick={addComponent}
              />
          </Container>

          {nodes.map((item, i) => ( <ListNode text={item} /> ))}
      </header>
    </div>
  );
}

export default App;
