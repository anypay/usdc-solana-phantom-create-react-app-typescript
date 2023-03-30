import React from 'react';
import logo from './logo.svg';
import './App.css';

import SolanaPayUSDCButton from './SolanaPayUSDCButton'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={'https://play-lh.googleusercontent.com/k2H0kCkMJmMr3XT3SUe282s7S4_O6dIKfAvrR9-VTOOce6QQBJFSHDa_k0h6w5tZM5WO=s256-rw'} className="App-logo" alt="logo" />


          <SolanaPayUSDCButton address={"Ef9ca7Uwkw9rrbdaWnUrrdMZJqPYykZ1dPLEv9yMpEjB"} amount={0.01}></SolanaPayUSDCButton>
      </header>
    </div>
  );
}

export default App;
