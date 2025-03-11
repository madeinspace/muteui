import Devices from "./components/Devices/Devices";
import { Modules } from "./components/Modules/Modules";
import { Settings } from "./components/Settings/Settings";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
function App() {
  return (
    <main className="grid grid-cols-[30%_45%_25%] flex-grow">
      <DndProvider debugMode={true} backend={HTML5Backend}>
        <Devices />
        <Modules />
        <Settings />
      </DndProvider>
    </main>
  );
}

export default App;
