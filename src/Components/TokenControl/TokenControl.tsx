import "./TokenControl.scss";
import juTokenIcon from "@/assets/juTokenIcon.png";
import bnbTokenIcon from "@/assets/bnbTokenIcon.png";
import usdtTokenIcon from "@/assets/usdtTokenIcon.png";
import elseTokenIcon from "@/assets/elseTokenIcon.png";
import ERC20ABI from "@/Contract/ABI/ERC20.json";
import {useEffect, useState} from "react";
import {formatWallertAddress} from "@/Util/Util.ts";
import {ethers} from "ethers";
import {message, Spin} from "antd";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

interface TokenControlProps {
    onClose: () => void;
    onConfrim: (token:TokenInterface) => void;
}

function TokenControl(Props:TokenControlProps) {
    // 当前链的token列表
    const [currChainTokenList,setCurrChainTokenList] = useState<TokenInterface[]>([]);
    // 本地存储的token列表
    const [localTokenList, setLocalTokenList] = useState<TokenInterface[]>([]);
    // 查询token列表
    const [searchTokenList, setSearchTokenList] = useState<TokenInterface[]>([]);
    // 需要查询的代币地址
    const [tokenAddress, setTokenAddress] = useState<string>("");
    // 加载中
    const [isLoading, setIsLoading] = useState(false);

    // 获取当前链的token列表
    const getCurrChainTokenListAction = async ()=>{
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const juChainTokenList:TokenInterface[] = [
            {
                name: "Ju",
                address: "0x4d1B49B424afd7075d3c063adDf97D5575E1c7E2",
                icon: juTokenIcon,
                decimals: 18,
                isNative: true
            },
            {
                name: "WJu",
                address: "0x4d1B49B424afd7075d3c063adDf97D5575E1c7E2",
                icon: juTokenIcon,
                decimals: 18,
                isNative: false
            },
            {
                name: "USDT",
                address: "0xc8e19C19479a866142B42fB390F2ea1Ff082E0D2",
                icon: usdtTokenIcon,
                decimals: 18,
                isNative: false
            }
        ]
        const bnbTokenList:TokenInterface[] = [
            {
                name: "BNB",
                address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                icon: bnbTokenIcon,
                decimals: 18,
                isNative: true
            },
            {
                name: "WBNB",
                address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                icon: bnbTokenIcon,
                decimals: 18,
                isNative: false
            },
            {
                name: "USDT",
                address: "0x55d398326f99059fF775485246999027B3197955",
                icon: usdtTokenIcon,
                decimals: 18,
                isNative: false
            }
        ]
        if(chainId == "0x33450") {
            setCurrChainTokenList(juChainTokenList);
        }else if(chainId == "0x38"){
            setCurrChainTokenList(bnbTokenList);
        }
    }

    // 获取本地代币信息
    const getLocalTokenListAction =  async ()=>{
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const localStoreName = "TokenList" + chainId;
        const localList = localStorage.getItem(localStoreName);
        let list:TokenInterface[] = [];
        if(localList) {
            list = JSON.parse(localList);
        }
        setLocalTokenList(list);
    }

    // 确定选择代币
    const confirmChooseTokenAction = async (token:TokenInterface)=>{
        Props.onConfrim(token);
        Props.onClose()
    }

    // 查询代币
    const searchTokenAction = async ()=>{
        if(!tokenAddress) {
            return;
        }
        const serachPushValue:TokenInterface[] = []
        for(let i=0; i < currChainTokenList.length; i++) {
            if(currChainTokenList[i].address === tokenAddress || currChainTokenList[i].name.toLowerCase() === tokenAddress.toLowerCase()){
                serachPushValue.push(currChainTokenList[i]);
            }
        }
        for(let i=0; i< localTokenList.length; i++) {
            if(localTokenList[i].address === tokenAddress || localTokenList[i].name.toLowerCase() === tokenAddress.toLowerCase()){
                serachPushValue.push(currChainTokenList[i]);
            }
        }
        if(serachPushValue.length > 0) {
            setSearchTokenList(serachPushValue);
            return;
        }
        if(!ethers.isAddress(tokenAddress)){
            message.warning("请输入正确的代币合约地址");
            return;
        }
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
        const Result = await Promise.allSettled([
            tokenContract.decimals(),
            tokenContract.symbol()
        ]);
        const searchResult:TokenInterface = {
            address: tokenAddress,
            name: "",
            icon: elseTokenIcon,
            decimals: 18,
            isNative: false
        }
        if(Result[0].status === "fulfilled") {
            searchResult.decimals = Number(Result[0].value.toString());
        }
        if(Result[1].status === "fulfilled") {
            searchResult.name = Result[1].value;
        }
        if(searchResult.name) {
            setSearchTokenList([searchResult]);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const localStoreName = "TokenList" + chainId;
            const localList = localStorage.getItem(localStoreName);
            let list:TokenInterface[] = [];
            if(localList) {
                list = JSON.parse(localList);
            }
            list.push(searchResult);
            localStorage.setItem(localStoreName, JSON.stringify(list));
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getCurrChainTokenListAction();
        getLocalTokenListAction();
    }, []);

    useEffect(() => {
        if(!tokenAddress) {
            setSearchTokenList([]);
        }
    }, [tokenAddress]);

    return (
        <div className="tokenControlBox columnCenter">
            <div className="alignBox flexCenter">
                <div className="contentBox">
                    <div className="titleAndClose">
                        <div className="title">代币选择</div>
                        <div className="close" onClick={()=>{Props.onClose()}}></div>
                    </div>
                    <div className="inputBox">
                        <div className="input">
                            <input type="text" placeholder="请输入代币地址" value={tokenAddress} onChange={(event)=>{setTokenAddress(event.target.value)}} />
                        </div>
                        {
                            isLoading ?
                                <div className="searchBut columnCenter"><Spin /></div>
                            :
                                <div className="searchBut columnCenter" onClick={()=>{searchTokenAction()}}>搜索/添加</div>
                        }
                    </div>
                    <div className="scrollBox">
                        {
                            searchTokenList.length == 0 ?
                                currChainTokenList.map((item:TokenInterface,index:number)=>{
                                    return (
                                        <div className="tokenItem flexStart" key={index}>
                                            <div className="icon columnCenter">
                                                <img src={item.icon} alt="" />
                                            </div>
                                            <div className="nameAndAddress">
                                                <div className="name">{item.name}</div>
                                                <div className="address"><span>{formatWallertAddress(item.address)}</span></div>
                                            </div>
                                            <div className="chooseItem" onClick={()=>{confirmChooseTokenAction(item)}}></div>
                                        </div>
                                    )
                                })
                            :
                                searchTokenList.map((item:TokenInterface,index:number)=>{
                                    return (
                                        <div className="tokenItem flexStart" key={index}>
                                            <div className="icon columnCenter">
                                                <img src={item.icon} alt="" />
                                            </div>
                                            <div className="nameAndAddress">
                                                <div className="name">{item.name}</div>
                                                <div className="address"><span>{formatWallertAddress(item.address)}</span></div>
                                            </div>
                                            <div className="chooseItem" onClick={()=>{confirmChooseTokenAction(item)}}></div>
                                        </div>
                                    )
                                })
                        }
                        {
                            searchTokenList.length == 0 ?
                                localTokenList.map((item:TokenInterface,index:number)=>{
                                    return (
                                        <div className="tokenItem flexStart" key={index}>
                                            <div className="icon columnCenter">
                                                <img src={elseTokenIcon} alt="" />
                                            </div>
                                            <div className="nameAndAddress">
                                                <div className="name">{item.name}</div>
                                                <div className="address"><span>{formatWallertAddress(item.address)}</span></div>
                                            </div>
                                            <div className="chooseItem" onClick={()=>{confirmChooseTokenAction(item)}}></div>
                                        </div>
                                    )
                                })
                            :
                                null
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TokenControl;