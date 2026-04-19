import './App.css'

import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';

import logoImg from "@/assets/logo.png";

import RouterView from "@/Router/Router.tsx";
import {useEffect, useState} from "react";
import {connectWallert, formatWallertAddress} from "@/Util/Util.ts";

function App() {
    // 菜单选项
    const tradeItems:MenuProps['items'] = [
        {key: '1',label: (<div className="menuItem">V2</div>)},
        {key: '2',label: (<div className="menuItem">V3</div>)}
    ]
    const floatItems:MenuProps['items'] = [
        {key: '1',label: (<div className="menuItem">添加流动性</div>)},
        {key: '2',label: (<div className="menuItem">溢出流动性</div>)}
    ]
    // 当前钱包
    const [userWallert, setUserWallert] = useState<string>("")

    const connectWallertAction = ()=>{
        connectWallert().then((wallertAddress)=>{
            if(wallertAddress){
                setUserWallert(wallertAddress);
            }
        })
    }

    useEffect(()=>{
        // 链接钱包
        connectWallertAction();
    }, [])
  return (
      <div className="appBox flexCenter">
          <div className="appContent">
              <div className="menuBox flexBetween">
                  <div className="logoAndMenu flexStart">
                      <div className="logo columnCenter">
                          <img src={logoImg} alt="" />
                      </div>
                      <div className="menu flexStart">
                          <div className="menuItem columnCenter">
                            <Dropdown menu={{items:tradeItems}}>
                              <Space>
                                  交易
                                  <DownOutlined />
                              </Space>
                            </Dropdown>
                          </div>
                          <div className="menuItem columnCenter">
                              <Dropdown menu={{items:floatItems}}>
                                  <Space>
                                      流动性
                                      <DownOutlined />
                                  </Space>
                              </Dropdown>
                          </div>
                      </div>
                  </div>
                  <div className="langAndConnect flexStart">
                      <div className="lan"></div>
                      <div className="wallert columnCenter"><span className="columnCenter">{userWallert ? formatWallertAddress(userWallert) : '链接钱包'}</span></div>
                  </div>
              </div>
              <RouterView />
          </div>
      </div>
  )
}

export default App
