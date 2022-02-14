import './App.css';
import { Container, Button } from 'react-floating-action-button'
import {
   Menu,
    MenuItem,
    MenuButton,
    SubMenu
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';


import React from "react";

function App() {
  
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
            styles={{ backgroundColor: "#00B1E1", color: "#FFFFFF" }}
            onClick={() => alert("Button Click")} />
        </Container>
      </header>

    </div>
  )
}export default App;
