import {useState,useEffect} from 'react';
import {ethers} from 'ethers';
import {contractAbi,contractAddress} from './constant/constants';
import Login from './components/Login'; 
import Connected from './components/Connected';
import Finished from './components/Finished';
import './App.css';

function App() {
  const [provider,setProvider] =useState(null);
  const [account,setAccount]=useState(null);
  const [isConnected,setIsConnected]=useState(false);
  const [votingStatus, setVotingStatus]=useState(true);
  const [remainingTime,setremainingTime]=useState();
  const [candidates,setCandidates]=useState([]);
  const [number,setNumber]=useState('');
  const [check,setCheck] = useState(false);
  const [CanVote,setCanVote]=useState(true);

  if(check){getRemainingTime();}

  useEffect( () =>{
    // getCandidates();
    // getRemainingTime();
    // getCurrentStatus();
    if(window.ethereum){
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return()=>{
      if(window.ethereum){
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  },[]
  );
  async function vote(){
    try {
      const provider=new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer=provider.getSigner();
    const contractInstance= new ethers.Contract(
      contractAddress,contractAbi,signer
    );
    const tx=await contractInstance.vote(number);
    await tx.wait();
    canVote();
    } catch (error) {
      throw new Error('HEllo i\'m in vote');
      // console.log(object);
    }
  }

  async function canVote() {
    try{
      const provider=new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer=provider.getSigner();
      const contractInstance= new ethers.Contract (
        contractAddress,contractAbi,signer
      );
      const voteStatus=await contractInstance.voters(await signer.getAddress());
      setCanVote(voteStatus);
    }
    catch(e){
      throw new Error('HEllo i\'m in canvote');
      // console.log(object);
    }
  }

  async function getCandidates(){
    try {
      const provider=new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer=provider.getSigner();
      const contractInstance= new ethers.Contract (
        contractAddress,contractAbi,signer
      );
      const candidatesList= await contractInstance.getAllVotesOfCandiates();
      const formattedCandidates = candidatesList.map((candidate,index)=>{
        return{
          index: index,
          name:candidate.name,
          voteCount: candidate.voteCount.toNumber()
        }
      });
      setCandidates(formattedCandidates);
    } 
    catch (error) {
      throw new Error('HEllo i\'m in getCandidates');
    }

  }
  async function getCurrentStatus(){
    const provider=new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer=provider.getSigner();
    const contractInstance= new ethers.Contract (
      contractAddress,contractAbi,signer
    );
    const status= await contractInstance.getVotingStatus();
    console.log(status);
    setVotingStatus(status);
  }
  async function getRemainingTime() {
    const provider=new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer=provider.getSigner();
    const contractInstance= new ethers.Contract (
      contractAddress,contractAbi,signer
    );
    const time= await contractInstance.getRemainingTime();
    setremainingTime(parseInt(time,16));
  } 

  function handleAccountsChanged(accounts) {
    if (accounts.length>0 && account !== accounts[0]){
      setAccount(accounts[0]);
      canVote();
    }else{
      setIsConnected(false);
      setAccount(null);
    }
  }
  async function connectToMetamask(){
    if(window.ethereum){
      try{
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer=provider.getSigner();
        const address= await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected:" +address);
        setIsConnected(true);
        canVote();
        getCandidates();
      }catch(err){
        console.error(err);
      }
    }
    else{
      console.error("Metamask is not detected in the browser")
    }
  }
  async function handleNumberChange(e) {
    setNumber(e.target.value);
  }
  return (
    <div className="App">
     { votingStatus ? 
        (isConnected ? 
          (<Connected 
              account = {account}
              candidates = {candidates}
              remainingTime = {remainingTime}
              number= {number}
              handleNumberChange = {handleNumberChange}
              voteFunction = {vote}
              showButton = {CanVote}/>) : 
          (<Login connectWallet = {connectToMetamask} setCheck={setCheck}/>)) : 
        (<Finished />) }
    </div>
  );
}

export default App;
