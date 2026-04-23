import "./Home.scss";
import juImg from "@/assets/juTokenIcon.png";
import usdtImg from "@/assets/usdtTokenIcon.png"
import {useEffect, useRef, useState} from "react";

import {getContracts} from "@/Util/Util.ts";
import {ethers} from "ethers";

import TokenControlPage from "@/Components/TokenControl/TokenControl.tsx";

interface TokenInterface {
    name: string,
    address: string,
    icon: string,
    decimals: number,
    isNative: boolean
}

function Home() {
    // 出售代币
    const [sellToken, setSellToken] = useState<TokenInterface>({
        name: "Ju",
        address: "",
        icon: "",
        decimals: 18,
        isNative: true
    })
    // 购买代币
    const [buyToken, setBuyToken] = useState<TokenInterface>({
        name: "USDT",
        address: "",
        icon: "",
        decimals: 18,
        isNative: false
    })
    // 出售代币数量
    const [sellAmount, setSellAmount] = useState<string>("");
    // 购买代币数量
    const [buyAmount, setBuyAmount] = useState<string>("");
    // 过渡出售代币数量
    const [transitionSellAmount, setTransitionSellAmount] = useState<string>("");
    // 过渡购买代币数量
    const [transitionBuyAmount, setTransitionBuyAmount] = useState<string>("");
    // 监听购买数量
    const watchSellAmount = useRef<bigint>(0n);
    // 监听出售数量
    const watchBuyAmount = useRef<bigint>(0n);
    // 交易池子 1 v2 2 v3
    const [poolType, setPoolType] = useState<number>(1);
    // 滑点上限
    const [slippage, setSlippage] = useState("0.5");
    // 出售数量防抖
    const sellRefTime =  useRef<NodeJS.Timeout | null>(null);
    // 购买数量防抖
    const buyRefTime = useRef<NodeJS.Timeout | null>(null);
    // 是否显示代币选择
    const [showTokenChoose, setShowTokenChoose] = useState<boolean>(false);
    // 选择操作代币的选项 1出售代币 2购买代币
    const [chooseTokenType, setChooseTokenType] = useState<number>(1);

    // 初始化代币选项
    const initToken = async ()=>{
        const contracts = await getContracts("USDTToken");
        console.log(contracts);
    }

    // 选择代币
    const chooseTokenAction = (index:number)=>{
        setChooseTokenType(index);
        setShowTokenChoose(true);
    }

    // 确定代币执行函数
    const confirmChooseTokenAction = (Token:TokenInterface)=>{
        if(chooseTokenType == 1) {
            setSellToken(Token);
        }else{
            setBuyToken(Token);
        }
    }

    // 获取输入出售值
    const captureSellAmount = (value:string)=>{
        setSellAmount(value);
        setTransitionSellAmount(value);
        if(value && Number(value) > 0) {
            watchSellAmount.current = ethers.parseUnits(value,sellToken.decimals);
        }
    }

    // 获取输入购买值
    const captureBuyAmount = (value:string)=>{
        setBuyAmount(value);
        setTransitionBuyAmount(value);
        if(value && Number(value) > 0) {
            watchBuyAmount.current = ethers.parseUnits(value,buyToken.decimals);
        }
    }

    useEffect(()=>{

    },[])

    useEffect(()=>{
        if(sellRefTime.current) {
            clearTimeout(sellRefTime.current);
        }
        const countAction = ()=>{
            if(transitionSellAmount && Number(transitionSellAmount) > 0) {

            }else{
                setBuyAmount("");
                watchBuyAmount.current = 0n;
            }
        }
        sellRefTime.current = setTimeout(()=>{
            countAction();
        },800);
    },[transitionSellAmount,sellToken.name,buyToken.name])

    useEffect(()=>{
        if(buyRefTime.current) {
            clearTimeout(buyRefTime.current);
        }
        const countAction = ()=>{
            if(transitionBuyAmount && Number(transitionBuyAmount) > 0) {

            }else{
                setSellAmount("");
                watchSellAmount.current = 0n;
            }
        }
        buyRefTime.current = setTimeout(()=>{
            countAction();
        },800);
    },[transitionBuyAmount,sellToken.name,buyToken.name])

    return (
        <div className="homePgae columnCenter">
            <div className="title">Exchange at Your Fingertips Anywhere, Anytime</div>
            <div className="controlBox flexCenter">
                <div className="contentBox">
                    <div className="inputOutBox">
                        <div className="inputItem">
                            <div className="title">Sell</div>
                            <input type="number" placeholder="请输入出售数量" value={sellAmount} onChange={(event)=>{captureSellAmount(event.target.value)}} />
                            <div className="selectBox flexStart" onClick={()=>{chooseTokenAction(1)}}>
                                <div className="icon columnCenter">
                                    <img src={sellToken.icon} alt="" />
                                </div>
                                <div className="name columnCenter">{sellToken.name}</div>
                            </div>
                        </div>
                        <div className="inputItem">
                            <div className="title">Buy</div>
                            <input type="number" placeholder="请输入购买数量" value={buyAmount} onChange={(event)=>{captureBuyAmount(event.target.value)}} />
                            <div className="selectBox flexStart" onClick={()=>{chooseTokenAction(2)}}>
                                <div className="icon columnCenter">
                                    <img src={buyToken.icon} alt="" />
                                </div>
                                <div className="name columnCenter">{buyToken.name}</div>
                            </div>
                        </div>
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
                        <div className="value columnCenter">{slippage}%</div>
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
        </div>
    )
}

export default Home;