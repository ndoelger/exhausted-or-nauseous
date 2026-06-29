import { useState } from 'react';
import Login from './login';
import Home from './home';
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  }

const Index = () => {

    const [user, setUser] = useState<User | null>(null);
    

  return (
    !user ? <Login setUser={setUser} /> : <Home user={user} />
  )
}



export default Index;

    