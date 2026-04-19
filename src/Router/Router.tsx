import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AliveScope, KeepAlive } from 'react-activation';

import HomePage from "@/Pages/Home/Home.tsx";  // 开始密码

function Router() {
    return (
        <BrowserRouter>
            <AliveScope>
                <Routes>
                    <Route path="/" element={<KeepAlive><HomePage /></KeepAlive>} />
                </Routes>
            </AliveScope>
        </BrowserRouter>
    )
}

export default Router;