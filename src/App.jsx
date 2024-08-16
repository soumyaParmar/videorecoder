import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import Verify from './components/main/Verify';
import Quespage from './components/main/Quespage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Verify/>}/>
          <Route path='/test_screen' element={<Quespage/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
