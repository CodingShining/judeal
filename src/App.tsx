import './App.css'

import { DownOutlined } from '@ant-design/icons';
import {Drawer, type MenuProps} from 'antd';
import { Dropdown, Space } from 'antd';

import logoImg from "@/assets/logo.png";
import juChainIcon from "@/assets/juTokenIcon.png";
import bnbChainIcon from "@/assets/bnbTokenIcon.png";

import RouterView from "@/Router/Router.tsx";
import ChainControlPage from "@/Components/ChainControl/ChainControl.tsx";
import {useEffect, useState} from "react";
import {connectWallert, formatWallertAddress} from "@/Util/Util.ts";

// 链列表
const chainTypeList = new Map([
    ["0x33450", {name: "JuChain", icon: juChainIcon}],
    ["0x38", {name: "BNBChain", icon: bnbChainIcon}]
])

function App() {
    // 菜单选项
    const tradeItems:MenuProps['items'] = [
        {key: '1',label: (<div className="menuItem">兑换</div>)},
        {key: '2',label: (<div className="menuItem">购买加密货币</div>)}
    ]
    const floatItems:MenuProps['items'] = [
        {key: '1',label: (<div className="menuItem">添加流动性</div>)},
        {key: '2',label: (<div className="menuItem">移除流动性</div>)}
    ]

    // 链信息图片
    const [chainImg, setChainImg] = useState<string>(juChainIcon);

    // 链信息名称
    const [chainName, setChainName] = useState<string>("JuChain");

    // 是否显示链切换
    const [showChangeChain, setShowChangeChain] = useState(false);

    // 是否显示移动端菜单
    const [shwoMobileMenu, setShwoMobileMenu] = useState<boolean>(false)

    // 当前钱包
    const [userWallert, setUserWallert] = useState<string>("")

    // 链接钱包
    const connectWallertAction = ()=>{
        connectWallert().then((wallertAddress)=>{
            if(wallertAddress){
                setUserWallert(wallertAddress);
            }
        })
    }

    // 获取当前链
    const getCurrChainInfo = async ()=>{
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainInfo = chainTypeList.get(chainId)!;
        if(chainInfo) {
            setChainImg(chainInfo.icon);
            setChainName(chainInfo.name);
        }
    }

    // 切换链成功后
    const changeChainInfo = ()=>{
        setShowChangeChain(false);
        getCurrChainInfo()
    }

    useEffect(()=>{
        // 链接钱包
        connectWallertAction();
        getCurrChainInfo();
    }, [])
  return (
      <div className="appBox flexCenter">
          <div className="appContent">
              <div className="floatMenu" onClick={()=>{setShwoMobileMenu(true)}}></div>
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
                      <div className="chainBox flexStart" onClick={()=>{setShowChangeChain(true)}}>
                          <div className="icon columnCenter">
                              <img src={chainImg} alt="" />
                          </div>
                          <div className="name columnCenter">{chainName}</div>
                      </div>
                  </div>
              </div>
              <RouterView />
              {/*移动端菜单*/}
              <Drawer open={shwoMobileMenu} rootClassName="mobileMenuDrawer" closable={false} placement="left" size="60%">
                  <div className="mobileMenuBox">
                      <div className="titleAndClose">
                          <div className="title columnCenter">菜单</div>
                          <div className="close" onClick={()=>{setShwoMobileMenu(false)}}></div>
                      </div>
                      <div className="wallert">{userWallert ? formatWallertAddress(userWallert) : '链接钱包'}</div>
                      <div className="menuItem columnCenter">交易</div>
                      <div className="menuItem columnCenter">流动性</div>
                  </div>
              </Drawer>
          </div>
          {
              showChangeChain ?
                  <ChainControlPage onClose={()=>{changeChainInfo()}} />
              :
                  null
          }
      </div>
  )
}

export default App
