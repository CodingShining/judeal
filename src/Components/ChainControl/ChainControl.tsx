import "./ChainControl.scss";

import juIcon from "@/assets/juTokenIcon.png";
import bnbIcon from "@/assets/bnbTokenIcon.png";
import {useState} from "react";
import {Spin} from "antd";

interface chainInfo {
    name: string;
    icon: string;
    id: string;
}

interface pageProps{
    onClose: ()=>void;
}

function ChainControl(Props:pageProps) {
    // 是否加载中
    const [isLoading, setIsLoading] = useState(false);
    // 链列表
    const chainList:chainInfo[] = [
        {name: "BNB Chain", icon: bnbIcon, id: "0x38"},
        {name: "Ju Chain", icon: juIcon, id: "0x33450"}
    ];

    // 切换链
    const changeChainAction = async (id:string)=>{
        setIsLoading(true);
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: id }]
        });
        Props.onClose();
        setIsLoading(false);
    }
    return (
        <div className="chainControlBox columnCenter">
            <div className="alignBox flexCenter">
                <div className="inBox">
                    <div className="titleAndClose">
                        <div className="title columnCenter">切换链</div>
                        <div className="close" onClick={()=>{Props.onClose()}}></div>
                    </div>
                    {
                        chainList.map((item:chainInfo,index:number)=>{
                            return (
                                <div className="item flexStart" key={index}>
                                    <div className="icon">
                                        <img src={item.icon} alt="" />
                                    </div>
                                    <div className="name columnCenter">{item.name}</div>
                                    {
                                        isLoading ?
                                            <div className="login flexCenter"><Spin /></div>
                                        :
                                            <div className="select" onClick={()=>{changeChainAction(item.id)}}></div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ChainControl;