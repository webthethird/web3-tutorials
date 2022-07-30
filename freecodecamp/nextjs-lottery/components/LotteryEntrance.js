// Need a function to allow users to enter the lottery
import { useWeb3Contract } from "react-moralis"
import {abi} from "../constants/abi"

export default function LotteryEntrance() {
    const  {runContractFunction: enterRaffle} = useWeb3Contract{
        abi: abi,
        // contractAddress: ,
        // functionName: ,
        // params: {},
        // msgValue:
    }

    return <div>Lottery Entrance</div>
}
