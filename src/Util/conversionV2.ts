import ChainConfig from "@/ChainConfig/config.ts";
import ERC20 from "@/Contract/ABI/ERC20.json";
import {ethers} from "ethers";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

// 1 交易完成 -1 交易失败 -2 取消交易 -3 授权失败
const conversion = async (inToken:TokenInterface,outToken:TokenInterface,inAmount:bigint,path:string[],slippage:string)=>{
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainTokenObj = ChainConfig.get(chainId)!;
    const ContractObje = chainTokenObj.contract;
    const routerContractInfo = ContractObje.RouterV2;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const routerContractObj = new ethers.Contract(routerContractInfo.address, routerContractInfo.abi,signer);
    const inTokenContractObj = new ethers.Contract(inToken.address,ERC20,signer);
    // 如果是 原生代币兑换W原生代币
    if((inToken.isNative || outToken.isNative) && (inToken.address == outToken.address)) {
        const WNativeABI = [
            "function deposit() payable",
            "function withdraw(uint wad)"
        ];
        const WNativeContract = new ethers.Contract(
            inToken.address,
            WNativeABI,
            signer
        );
        let tx;
        if(inToken.isNative){
            try {
                tx = await WNativeContract.deposit({
                    value: inAmount
                });
            }catch (e) {
                return -2
            }
        }else{
            try {
                tx = await WNativeContract.withdraw({
                    value: inAmount
                });
            }catch (e) {
                return -2;
            }
        }
        const nativeEceipt =  await tx.wait();
        if (nativeEceipt?.status === 1) {
            return 1
        } else {
            return -1;
        }
    }
    // 如果inToken不是原生代币而是ERC20代币的话需要检查授权
    let isApprove = false;
    if(!inToken.isNative) {
        const approveAmount = await inTokenContractObj.allowance(signer.address, routerContractInfo.address);
        if(approveAmount < inAmount) {
            const gasLimit = await inTokenContractObj.approve.estimateGas(
                signer.address,
                inAmount
            );
            const finalGasLimit = gasLimit * 120n / 100n;
            const feeData = await provider.getFeeData();
            try {
                const approveTx = await inTokenContractObj.approve(routerContractInfo.address, inAmount,{
                    gasLimit: finalGasLimit,
                    gasPrice: feeData.gasPrice
                });
                const approveReceipt = await approveTx.wait();
                if (approveReceipt.status === 1) {
                    isApprove = true;
                } else {
                    isApprove = false;
                }
            }catch(e){
                isApprove = false;
            }
        }else{
            isApprove = true;
        }
        if(!isApprove) {
            return -3;
        }
    }
    const conversionInfo = await routerContractObj.getAmountsOut(inAmount,path);
    const conversionAmount = conversionInfo[path.length - 1];
    const slippageBps = BigInt(Math.floor(Number(slippage) * 100));
    const minOut = conversionAmount * (10000n - slippageBps) / 10000n;
    let methodsName = "";
    if (inToken.isNative && !outToken.isNative) {
        methodsName = "swapExactETHForTokensSupportingFeeOnTransferTokens";
    }
    if (!inToken.isNative && outToken.isNative) {
        methodsName = "swapExactTokensForETHSupportingFeeOnTransferTokens";
    }
    if (!inToken.isNative && !outToken.isNative) {
        methodsName = "swapExactTokensForTokensSupportingFeeOnTransferTokens";
    }
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    let routerTx;
    if(inToken.isNative) {
        const gasLimit = await routerContractObj[methodsName].estimateGas(
            minOut,
            path,
            signer.address,
            deadline,
            {
                value: inAmount
            }
        );
        const finalGasLimit = gasLimit * 120n / 100n;
        const feeData = await provider.getFeeData();
        try {
            routerTx = await routerContractObj[methodsName](
                minOut,
                path,
                signer.address,
                deadline,
                {
                    gasLimit: finalGasLimit,
                    gasPrice: feeData.gasPrice,
                    value: inAmount
                }
            )
        }catch (e) {
            return -2;
        }
    }else{
        const gasLimit = await routerContractObj[methodsName].estimateGas(
            inAmount,
            minOut,
            path,
            signer.address,
            deadline
        );
        const finalGasLimit = gasLimit * 120n / 100n;
        const feeData = await provider.getFeeData();
        try {
            routerTx = await routerContractObj[methodsName](
                inAmount,
                minOut,
                path,
                signer.address,
                deadline,
                {
                    gasLimit: finalGasLimit,
                    gasPrice: feeData.gasPrice,
                }
            )
        }catch (e) {
            return -2;
        }
    }
    const routerReceipt = await routerTx.wait();
    if(routerReceipt?.status === 1) {
        return 1
    } else {
        return -1;
    }
}

export {conversion}