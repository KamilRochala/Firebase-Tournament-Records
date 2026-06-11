import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Simracing from './Simracing'
import Overcooked from './Overcooked'
import Menu from './Menu'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Menu />} />
        

        <Route path='/simracing' element={<Simracing/>} />
        <Route path='/overcooked' element={<Overcooked/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;