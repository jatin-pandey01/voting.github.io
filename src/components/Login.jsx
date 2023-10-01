import React from 'react'

const Login = (props) => {
  const clickHandler = ()=>{
    props.connectWallet(); 
    props.setCheck(true);
    console.log('login');
  }
  return (
    <div className="login-container">
        <h1 className="Welcome Message">Welcome to decentralized voting application </h1>
        <button className="login-button" onClick={()=>{clickHandler()}} >Login Metamask </button>
    </div>
  )
}

export default Login