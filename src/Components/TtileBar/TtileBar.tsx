import "./TtileBar.scss";

import { useNavigate } from "react-router-dom";

interface TitleBarProps {
    title: string;
}

function TtileBar(Props:TitleBarProps) {
    // 路由方法
    const navigate = useNavigate();
    return (
        <div className="titleBar">
            <div className="back" onClick={()=>{navigate(-1)}}></div>
            <div className="title columnCenter">{Props.title}</div>
        </div>
    )
}

export default TtileBar;