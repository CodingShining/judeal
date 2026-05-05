import "./Home.scss";
import ChainConfig from "@/ChainConfig/config.ts";
import {useEffect, useRef, useState} from "react";
import USDTTokenIcon from "@/assets/usdtTokenIcon.png";
import {ethers} from "ethers";
import ERC20 from "@/Contract/ABI/ERC20.json";

import TokenControlPage from "@/Components/TokenControl/TokenControl.tsx";
import SlippageControl from "@/Components/SlippageControl/SlippageControl.tsx";
import {conversV2Info} from "@/Util/CountUtil.ts";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

function Home() {
    // 出售代币
    const [inToken, setinToken] = useState<TokenInterface>({
        name: "Ju",
        address: "",
        icon: "",
        decimals: 18,
        isNative: true
    })
    // 购买代币
    const [outToken, setoutToken] = useState<TokenInterface>({
        name: "USDT",
        address: "",
        icon: "",
        decimals: 18,
        isNative: false
    })
    // 出售代币数量
    const [inTokenAmount, setInTokenAmount] = useState<string>("");
    // 购买代币数量
    const [outTokenAmount, setOutTokenAmount] = useState<string>("");
    // 过渡出售代币数量
    const [transitionInTokenAmount, setTransitionInTokenAmount] = useState<string>("");
    // 过渡购买代币数量
    const [transitionOutTokenAmount, setTransitionOutTokenAmount] = useState<string>("");
    // 监听购买数量
    const watchInTokenAmount = useRef<bigint>(0n);
    // 监听出售数量
    const watchOutAmount = useRef<bigint>(0n);
    // 余额
    const [inTokenBalance, setInTokenBalance] = useState<string>("0");
    const [outTokenBalance, setOutTokenBalance] = useState<string>("0");
    // 交易池子 1 v2 2 v3
    const [poolType, setPoolType] = useState<number>(1);
    // V2路径
    const [pathV2, setPathV2] = useState<string[]>([]);
    // 滑点上限
    const [slippage, setSlippage] = useState("0.5");
    // 出售数量防抖
    const sellRefTime =  useRef<NodeJS.Timeout | null>(null);
    // 购买数量防抖
    const buyRefTime = useRef<NodeJS.Timeout | null>(null);
    // 是否显示代币选择
    const [showTokenChoose, setShowTokenChoose] = useState<boolean>(false);
    // 是否显示滑点设置
    const [showSlippage, setShowSlippage] = useState<boolean>(false);
    // 选择操作代币的选项 1出售代币 2购买代币
    const [chooseTokenType, setChooseTokenType] = useState<number>(1);

    // 初始化代币选项
    const initTokenPair = async ()=>{
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainTokenObj = ChainConfig.get(chainId)!;
        const Nativetoken:TokenInterface = {
            address: chainTokenObj.contract.Nativetoken.address,
            icon: chainTokenObj.icon,
            decimals: chainTokenObj.decimals,
            name: chainTokenObj.nativeName ?? "",
            isNative: true
        }
        const UsdtToken:TokenInterface = {
            address: chainTokenObj.contract.USDTToken.address,
            icon: USDTTokenIcon,
            decimals: chainTokenObj.decimals,
            name: "USDT",
            isNative: false
        }
        setinToken(Nativetoken);
        setoutToken(UsdtToken);
    }

    // 选择代币
    const chooseTokenAction = (index:number)=>{
        setChooseTokenType(index);
        setShowTokenChoose(true);
    }

    // 确定代币执行函数
    const confirmChooseTokenAction = (Token:TokenInterface)=>{
        if(chooseTokenType == 1) {
            setinToken(Token);
        }else{
            setoutToken(Token);
        }
    }

    // 获取输入出售值
    const captureSellAmount = (value:string)=>{
        setInTokenAmount(value);
        setTransitionInTokenAmount(value);
        if(value && Number(value) > 0) {
            watchInTokenAmount.current = ethers.parseUnits(value,inToken.decimals);
        }
    }

    // 获取输入购买值
    const captureBuyAmount = (value:string)=>{
        setOutTokenAmount(value);
        setTransitionOutTokenAmount(value);
        if(value && Number(value) > 0) {
            watchOutAmount.current = ethers.parseUnits(value,outToken.decimals);
        }
    }

    // 确定滑点
    const confirmSlippage = (amount:string)=>{
        setSlippage(amount);
    }
    
    // 调换位置
    const exchangeTokenPosition = ()=>{
        const store:TokenInterface = inToken;
        setinToken(outToken);
        setoutToken(store);
        setInTokenAmount("");
        setOutTokenAmount("");
        setTransitionInTokenAmount("");
        setTransitionOutTokenAmount("");
        watchInTokenAmount.current = 0n;
        watchOutAmount.current = 0n;
    }

    const getInTokenBalance = async ()=>{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        if(inToken.isNative) {
            const balance = await provider.getBalance(signer.address);
            setInTokenBalance(ethers.formatUnits(balance,inToken.decimals));
        }else{
            const Contract = new ethers.Contract(inToken.address, ERC20,provider);
            const balance = await Contract.balanceOf(signer.address);
            setInTokenBalance(ethers.formatUnits(balance,inToken.decimals));
        }
    }

    const getOutTokenBalance = async ()=>{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        if(outToken.isNative) {
            const balance = await provider.getBalance(signer.address);
            setOutTokenBalance(ethers.formatUnits(balance,outToken.decimals));
        }else{
            const Contract = new ethers.Contract(outToken.address, ERC20,provider);
            const balance = await Contract.balanceOf(signer.address);
            setOutTokenBalance(ethers.formatUnits(balance,outToken.decimals));
        }
    }

    useEffect(()=>{
        initTokenPair();
    },[]);

    useEffect(() => {
        if(inToken.address) {
            getInTokenBalance();
        }
    }, [inToken.address]);

    useEffect(() => {
        if(outToken.address) {
            getOutTokenBalance();
        }
    }, [inToken.address]);

    useEffect(()=>{
        if(sellRefTime.current) {
            clearTimeout(sellRefTime.current);
        }
        const countAction = async ()=>{
            if(transitionInTokenAmount && Number(transitionInTokenAmount) > 0) {
                if(poolType == 1) {
                    const conversioninfo = await conversV2Info(watchInTokenAmount.current,inToken,outToken,true);
                    if(conversioninfo) {
                        watchOutAmount.current = conversioninfo.amount;
                        setOutTokenAmount(ethers.formatUnits(conversioninfo.amount, outToken.decimals));
                        setPathV2(conversioninfo.path);
                    }
                }
            }else{
                setOutTokenAmount("");
                watchOutAmount.current = 0n;
            }
        }
        sellRefTime.current = setTimeout(()=>{
            countAction();
        },500);
    },[transitionInTokenAmount,inToken.name,outToken.name])

    useEffect(()=>{
        if(buyRefTime.current) {
            clearTimeout(buyRefTime.current);
        }
        const countAction = async ()=>{
            if(transitionOutTokenAmount && Number(transitionOutTokenAmount) > 0) {
                if(poolType === 1) {
                    const conversioninfo = await conversV2Info(watchOutAmount.current,inToken,outToken,false);
                    if(conversioninfo) {
                        watchInTokenAmount.current = conversioninfo.amount;
                        setInTokenAmount(ethers.formatUnits(conversioninfo.amount, outToken.decimals));
                        setPathV2(conversioninfo.path);
                    }
                }
            }else{
                setInTokenAmount("");
                watchInTokenAmount.current = 0n;
            }
        }
        buyRefTime.current = setTimeout(()=>{
            countAction();
        },500);
    },[transitionOutTokenAmount,inToken.name,outToken.name])

    return (
        <div className="homePgae columnCenter">
            <div className="title">Exchange at Your Fingertips Anywhere, Anytime</div>
            <div className="controlBox flexCenter">
                <div className="contentBox">
                    <div className="inputOutBox">
                        <div className="inputItem">
                            <div className="title">Sell</div>
                            <input type="number" placeholder="请输入出售数量" value={inTokenAmount} onChange={(event)=>{captureSellAmount(event.target.value)}} />
                            <div className="balance">余额：{inTokenBalance} {inToken.name}</div>
                            <div className="selectBox flexStart" onClick={()=>{chooseTokenAction(1)}}>
                                <div className="icon columnCenter">
                                    <img src={inToken.icon} alt="" />
                                </div>
                                <div className="name columnCenter">{inToken.name}</div>
                            </div>
                        </div>
                        <div className="inputItem">
                            <div className="title">Buy</div>
                            <input type="number" placeholder="请输入购买数量" value={outTokenAmount} onChange={(event)=>{captureBuyAmount(event.target.value)}} />
                            <div className="balance">余额：{outTokenBalance} {outToken.name}</div>
                            <div className="selectBox flexStart" onClick={()=>{chooseTokenAction(2)}}>
                                <div className="icon columnCenter">
                                    <img src={outToken.icon} alt="" />
                                </div>
                                <div className="name columnCenter">{outToken.name}</div>
                            </div>
                        </div>
                        <div className="exchangeTokenBut" onClick={()=>{exchangeTokenPosition()}}></div>
                    </div>
                    <div className="label flexBetween">
                        <div className="name columnCenter">交易池</div>
                        <div className="select flexStart">
                            <div className={"item columnCenter " + (poolType == 1 ? 'select' : '')} onClick={()=>{setPoolType(1)}}>V2</div>
                            <div className={"item columnCenter " + (poolType == 2 ? 'select' : '')} onClick={()=>{setPoolType(2)}}>V3</div>
                        </div>
                    </div>
                    <div className="label flexBetween">
                        <div className="name columnCenter">滑点上限</div>
                        <div className="value columnCenter" onClick={()=>{setShowSlippage(true)}}>{slippage}%</div>
                    </div>
                    <div className="confirmBut columnCenter sy_confirmBut">确定交易</div>
                </div>
            </div>
            {/*代币选择*/}
            {
                showTokenChoose ?
                    <TokenControlPage onClose={()=>{setShowTokenChoose(false)}} onConfrim={confirmChooseTokenAction} />
                :
                    null
            }
            {/*滑点上限设置*/}
            {
                showSlippage ?
                    <SlippageControl seetIngAction={confirmSlippage} onClose={()=>{setShowSlippage(false)}} />
                :
                    null
            }
        </div>
    )
}

export default Home;