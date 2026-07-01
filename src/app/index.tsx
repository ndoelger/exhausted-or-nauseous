import { useState } from 'react';
import Login from './login';
import Home from './home';
export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  }

const Index = () => {

    const [profile, setProfile] = useState<Profile | null>(null);
    

  return (
    !profile ? <Login setProfile={setProfile} /> : <Home />
  )
}


export default Index;

    