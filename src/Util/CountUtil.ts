import {getContracts} from "@/Util/Util.ts";
import {ethers} from "ethers";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

const conversV2Info = async (amount: bigint,tokenA:TokenInterface,tokenB:TokenInterface,isSell:boolean)=>{
    if((tokenA.isNative || tokenB.isNative) && (tokenA.address == tokenB.address)) {
        return {
            path: [tokenA.address, tokenB.address],
            amount: amount
        }
    }
    const nativeToken = await getContracts("Nativetoken");
    const routerContractInfo = await getContracts("RouterV2");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const routerV2Contract = new ethers.Contract(routerContractInfo.address, routerContractInfo.abi, provider);
    const path1 = [tokenA.address, tokenB.address];
    const path2 = [tokenA.address, nativeToken.address, tokenB.address];
    if(isSell) {
        const AmountResult = await Promise.allSettled([
            routerV2Contract.getAmountsOut(amount, path1),
            routerV2Contract.getAmountsOut(amount, path2),
        ]);
        if(AmountResult[0].status === "fulfilled") {
            return {
                path: path1,
                amount: AmountResult[0].value[1]
            }
        }
        if(AmountResult[1].status === "fulfilled") {
            return {
                path: path2,
                amount: AmountResult[1].value[2]
            }
        }
    }else{
        const AmountResult = await Promise.allSettled([
            routerV2Contract.getAmountsIn(amount, path1),
            routerV2Contract.getAmountsIn(amount, path2),
        ]);
        if(AmountResult[0].status === "fulfilled") {
            return {
                path: path1,
                amount: AmountResult[0].value[0]
            }
        }
        if(AmountResult[1].status === "fulfilled") {
            return {
                path: path2,
                amount: AmountResult[1].value[0]
            }
        }
    }
}
export {conversV2Info}