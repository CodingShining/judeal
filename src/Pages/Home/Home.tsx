import "./Home.scss";
import juImg from "@/assets/juTokenIcon.png";
import usdtImg from "@/assets/usdtTokenIcon.png"
import {useState} from "react";

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
    return (
        <div className="homePgae columnCenter">
            <div className="title">Exchange at Your Fingertips Anywhere, Anytime</div>
            <div className="controlBox flexCenter">
                <div className="contentBox">
                    <div className="inputItem">
                        <div className="title">Sell</div>
                        <input type="number" placeholder="请输入出售数量" />
                        <div className="selectBox flexStart">
                            <div className="icon columnCenter">
                                <img src={juImg} alt="" />
                            </div>
                            <div className="name columnCenter">Ju</div>
                        </div>
                    </div>
                    <div className="inputItem">
                        <div className="title">Buy</div>
                        <input type="number" placeholder="请输入购买数量" />
                        <div className="selectBox flexStart">
                            <div className="icon columnCenter">
                                <img src={usdtImg} alt="" />
                            </div>
                            <div className="name columnCenter">USDT</div>
                        </div>
                    </div>
                    <div className="confirmBut columnCenter">确定交易</div>
                </div>
            </div>
        </div>
    )
}

export default Home;