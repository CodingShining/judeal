import Erc20ABI from "@/Contract/ABI/ERC20.json";
import RouterV2ABI from "@/Contract/ABI/RouterV2.json";
import RouterV3ABI from "@/Contract/ABI/RouterV3.json";
import FactoryV2ABI from "@/Contract/ABI/FactoryV2.json";
import FactoryV3ABI from "@/Contract/ABI/FactoryV3.json";
import QuoterV2ABI from "@/Contract/ABI/QuoterV2.json";
import MulticallABI from "@/Contract/ABI/Multicall.json"

const ContractObje = {
    JuChain: {
        USDTToken: {
            "address": "0xc8e19C19479a866142B42fB390F2ea1Ff082E0D2",
            "abi": Erc20ABI
        },
        Nativetoken: {
            "address": "0x4d1B49B424afd7075d3c063adDf97D5575E1c7E2",
            "abi": Erc20ABI
        },
        RouterV2: {
            "address": "0x09f58Aa3C7A8101062855C66E43a83920EB23511",
            "abi": RouterV2ABI
        },
        Multicall: {
            "address": "",
            "abi": []
        }
    },

    BNBChain: {
        USDTToken: {
            "address": "0x55d398326f99059fF775485246999027B3197955",
            "abi": Erc20ABI
        },
        Nativetoken: {
            "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            "abi": Erc20ABI
        },
        RouterV2: {
            "address": "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            "abi": RouterV2ABI
        },
        RouterV3: {
            "address": "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
            "abi": RouterV3ABI
        },
        FactoryV2: {
            "address": "0xCA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
            "abi": FactoryV2ABI
        },
        FactoryV3: {
            "address": "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
            "abi": FactoryV3ABI
        },
        QuoterV2: {
            "address": "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
            "abi": QuoterV2ABI
        },
        Multicall: {
            "address": "0xcA11bde05977b3631167028862bE2a173976CA11",
            "abi": MulticallABI
        }
    }
}

export default ContractObje