import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Adminlogin from './auth/form/Adminlogin'
import Enoclogin from './auth/form/Enoclogin'
import Mislogin from './auth/form/Mislogin'
import Adminentrypage from './pages/Adminentrypage'
import Enocteamentrypage from './pages/Enocteamentrypage'
import Misteamentrypageunit1 from './pages/Misteamentrypageunit1'
import Verifydataadmin from './pages/Verifydataadmin'
import Dataentrypage from './pages/Dataentrypage'
import Dataentrypage2 from './pages/Dataentrypage2'
import Finalviewstation from './pages/Finalviewstation'
import CheckDateStation from './pages/CheckDateStation'
import Modifydata from './pages/Modifydata'
import Verifymodifieddata from './pages/Verifymodifieddata'
import Tablemodify from './pages/Tablemodify'
import Upload from './pages/Upload'
import Messagesend from './pages/Messagesend'
function App() {

  return (
    <main>
       <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/adminlogin" element={<Adminlogin/>} />
              <Route path="/enoclogin" element={<Enoclogin/>}/>
              <Route path="/mislogin" element={<Mislogin/>}/>
              <Route path="/adminentrypage" element={<Adminentrypage/>}/>
              <Route path="/enocteamentrypage" element={<Enocteamentrypage/>}/>
              <Route path="/misteamentrypageunit" element={<Misteamentrypageunit1/>}/>
              <Route path="/dataentrypage" element={<Dataentrypage/>}/>
              <Route path="/verifydata" element={<Verifydataadmin/>}/>
              <Route path="/dataentrypage2" element={<Dataentrypage2/>}/>
              <Route path="/finalsubmit" element={<Finalviewstation/>}/>
              <Route path="/checkk" element={<CheckDateStation/>}/>
              <Route path="/modifydata" element={<Modifydata/>}/>
              <Route path="/verifymodifydata" element={<Verifymodifieddata/>}/>
              <Route path="/modifytable" element={<Tablemodify/>}/>
              <Route path="/upload" element={<Upload/>}/>
              <Route path="/message" element={<Messagesend/>}/>
       </Routes>
    </main>
  )
}

export default App
