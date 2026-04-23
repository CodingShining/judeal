import ERC20ABI from "@/Contract/ABI/ERC20.json";

import {getContracts} from "@/Util/Util.ts";
import {ethers} from "ethers";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

const conversV2Amount = async (amount: bigint,tokenA:TokenInterface,tokenB:TokenInterface,isSell:boolean)=>{
    const nativeToken = await getContracts("Nativetoken");
    const routerContractInfo = await getContracts("RouterV2");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const routerV2Contract = new ethers.Contract(routerContractInfo.address, routerContractInfo.abi, provider);
    if(isSell) {
        const path1 = [tokenA, tokenB];
        const path2 = [tokenA, nativeToken.address, tokenB];
        let result;
        const AmountResult = await Promise.allSettled([
            routerV2Contract.getAmountsOut(ethers.parseUnits(amount,tokenA.decimals), path1),
            routerV2Contract.getAmountsOut(ethers.parseUnits(amount,tokenA.decimals), path2),
        ]);
        if(AmountResult[0].status === "fulfilled") {
            console.log(AmountResult[0].value);
        }
        if(AmountResult[1].status === "fulfilled") {
            console.log(AmountResult[1].value);
        }
    }else{

    }
}

export {conversV2Amount}