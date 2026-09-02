import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import IssuesList from './IssuesList';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <IssuesList/>
    </>
  );
}

export default App;
