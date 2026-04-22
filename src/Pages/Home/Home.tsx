import "./Home.scss";
import juImg from "@/assets/juTokenIcon.png";
import usdtImg from "@/assets/usdtTokenIcon.png"
import {useRef, useState} from "react";

import {getContracts} from "@/Util/Util.ts";
import {ethers} from "ethers";

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
    // 监听购买数量
    const watchSellAmount = useRef<bigint>(0n);
    // 监听出售数量
    const watchBuyAmount = useRef<bigint>(0n);
    // 交易池子 1 v2 2 v3
    const [poolType, setPoolType] = useState<number>(1);
    // 滑点上限
    const [slippage, setSlippage] = useState("0.5");

    // 测试
    const testAction = async ()=>{
        const contracts = await getContracts("USDTToken");
        console.log(contracts);
    }

    // 获取输入出售值
    const captureSellAmount = (value:string)=>{
        setSellAmount(value);
        watchSellAmount.current = ethers.parseUnits(value,sellToken.decimals);
    }

    // 获取输入购买值
    const captureBuyAmount = (value:string)=>{
        setBuyAmount(value);
        watchBuyAmount.current = ethers.parseUnits(value,buyToken.decimals);
    }

    return (
        <div className="homePgae columnCenter">
            <div className="title">Exchange at Your Fingertips Anywhere, Anytime</div>
            <div className="controlBox flexCenter">
                <div className="contentBox">
                    <div className="inputOutBox">
                        <div className="inputItem">
                            <div className="title">Sell</div>
                            <input type="number" placeholder="请输入出售数量" value={sellAmount} onChange={(event)=>{captureSellAmount(event.target.value)}} />
                            <div className="selectBox flexStart">
                                <div className="icon columnCenter">
                                    <img src={juImg} alt="" />
                                </div>
                                <div className="name columnCenter">Ju</div>
                            </div>
                        </div>
                        <div className="inputItem">
                            <div className="title">Buy</div>
                            <input type="number" placeholder="请输入购买数量" value={buyAmount} onChange={(event)=>{captureBuyAmount(event.target.value)}} />
                            <div className="selectBox flexStart" onClick={()=>{testAction()}}>
                                <div className="icon columnCenter">
                                    <img src={usdtImg} alt="" />
                                </div>
                                <div className="name columnCenter">USDT</div>
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
        </div>
    )
}

export default Home;