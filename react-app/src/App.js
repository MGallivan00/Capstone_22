import './App.css';
import { Container, Button } from 'react-floating-action-button'

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <Container>
              <Button
                  tooltip="New Node"
                  styles={{backgroundColor: "#00B1E1", color: "#FFFFFF"}}
                  onClick={() => alert("Button Click")}
              />
          </Container>
      </header>
    </div>
  );
}

export default App;
