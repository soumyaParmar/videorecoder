import 'regenerator-runtime/runtime';
import "./App.css";
import Question from './components/Questions/Question';

function App() {
  return (
    <>
    <div className="main">
      <div className="right">
        <Question/>
      </div>
    </div>
    </>
  )
}

export default App
