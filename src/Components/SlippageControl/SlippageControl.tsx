import "./SlippageControl.scss";
import {useState} from "react";

interface SlippageControlProps{
    onClose: () => void;
    seetIngAction: (amount:string)=>void;
}

function SlippageControl(Props:SlippageControlProps) {
    const [slippageAmount, setSlippageAmount] = useState("");

    // 确定按钮执行
    const confrimButAction = ()=>{
        if(slippageAmount) {
            Props.seetIngAction(slippageAmount);
        }
        Props.onClose();
    }
    return (
        <div className="slippageControlPage columnCenter">
            <div className="alignBox flexCenter">
                <div className="inBox">
                    <div className="titleAndClose">
                        <div className="title">滑点上限设置</div>
                        <div className="close" onClick={()=>{Props.onClose()}}></div>
                    </div>
                    <div className="title">输入滑点设置：</div>
                    <div className="input">
                        <input type="number" placeholder="请输入滑点" value={slippageAmount} onChange={(e)=>setSlippageAmount(e.target.value)} />
                        <div className="uni">%</div>
                    </div>
                    <div className="confirmBut flexCenter columnCenter" onClick={()=>{confrimButAction()}}>确定</div>
                </div>
            </div>
        </div>
    )
}

export default SlippageControl;