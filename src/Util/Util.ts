// 链接钱包
import {message} from "antd";
// 合约数据
import ContractList from "@/Contract/Contract.ts";

declare global {
    interface Window {
        ethereum?: any;
    }
}

type ChainName = keyof typeof ContractList;
type ContractName = keyof typeof ContractList[ChainName];

const chainType = new Map<string, ChainName>([
    ['0x33450','JuChain'],
    ['0x38', 'BNBChain']
]);


// 链接钱包
const connectWallert = async ()=> {
    const { ethereum } = window as any;
    if (!window.ethereum) {
        console.error("未检测到钱包环境");
        return "";
    }

    const currentChainId = await ethereum.request({ method: 'eth_chainId' });

    const BNB_PARAMS = {
        chainId: '0x38',
        chainName: 'BNB Smart Chain Mainnet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
    };

    const JU_PARAMS = {
        chainId: '0x33450',
        chainName: 'JuChain',
        nativeCurrency: {
            name: 'Ju',
            symbol: 'Ju',
            decimals: 18
        },
        rpcUrls: ['https://rpc.techcircles.win'],
        blockExplorerUrls: ['https://testnet.juscan.io']
    };

    let accounts: string[] = [];

    try {
        accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
    } catch (err: any) {
        if (err.code == -32002) {
            return "";
        }else{
            return "";
        }
    }

    // 监听是否切换了链
    window.ethereum.on("chainChanged", () => {
        window.location.reload();
    });

    if (accounts.length > 0) {
        try {
            const normalizedChainId = String(currentChainId).toLowerCase();
            if (normalizedChainId === JU_PARAMS.chainId || normalizedChainId === BNB_PARAMS.chainId) {
                // 已经在BNB链或JU链
                return accounts[0]
            }else{
                // // 尝试切换到BNB
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: JU_PARAMS.chainId }]
                });
                window.location.reload();
                return accounts[0];
            }
        } catch (error: any) {
            // 4902 表示链未添加
            if (error.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [JU_PARAMS]
                    });
                    window.location.reload();
                    return accounts[0];
                } catch (addError: any) {
                    message.error("添加 BNB 网络失败：" + addError.message);
                    return "";
                }
            } else {
                message.error("请手动切换至 BNB 主链：" + error.message);
                return "";
            }
        }
    } else {
        return "";
    }
}

// 格式化钱包地址
const formatWallertAddress = (address:string) =>{
    if(address) {
        const headString = address.substring(0,4);
        const lendString = address.substring(address.length - 4, address.length);
        return headString + "...." + lendString;
    }else{
        return "";
    }
}

// 获取对应的合约对象
const getContracts = async (contractName:ContractName)=>{
    const { ethereum } = window as any;
    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
    const chainName = chainType.get(currentChainId)!;
    return ContractList[chainName][contractName];
}

export {connectWallert, formatWallertAddress, getContracts}