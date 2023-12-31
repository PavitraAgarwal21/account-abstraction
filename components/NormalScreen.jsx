import Account from "@/components/Account";
import Header from "@/components/Header";
import Receive from "@/components/Receive";
import Send from "@/components/Send";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Presets } from "userop";

export default function NormalScreen() {
    let privateKeyAA;
    const [refresh, setRefresh] = useState(false)
    const [userAddress, setuserAddress] = useState("");
    const [privateKey, setPrivateKey] = useState();
    const [balance, setBalance] = useState();
    const [config, setConfig] = useState({


        rpcUrl: `https://api.stackup.sh/v1/node/d5fda1549f44e9e800917c598f9ee0d507a5c7d259e24fb047027c0fe0baa3ef`,
        signingKey: "0x89780505858565b2a598e55c06cc1a8ec9786487aa34db97e48411342573f5fd",
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        simpleAccountFactory: "0x9406Cc6185a346906296840746125a0E44976454",
        paymaster: {
            rpcUrl: "https://api.stackup.sh/v1/paymaster/d5fda1549f44e9e800917c598f9ee0d507a5c7d259e24fb047027c0fe0baa3ef",
            context: {},
        },
    })

    async function init() {
        setRefresh(true)
        if (typeof window !== 'undefined') {
            privateKeyAA = localStorage.getItem('privateKeyAA');
            if (privateKeyAA == undefined) {
                privateKeyAA = new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey;
                localStorage.setItem('privateKeyAA', privateKeyAA);
                setPrivateKey(privateKeyAA);

            }
            setPrivateKey(privateKeyAA);
            await address()
            await balanceOfAddress()
            setRefresh(false)
        }
    }

    async function address() {
        try {
            const simpleAccount = await Presets.Builder.SimpleAccount.init(
                new ethers.Wallet(privateKey),
                config.rpcUrl,
                config.entryPoint,
                config.simpleAccountFactory
            );
            const address = simpleAccount.getSender();
            console.log(`SimpleAccount address: ${address}`);
            setuserAddress(address);
        } catch (error) {
            console.log(error)
        }
    }

    async function balanceOfAddress() {
        // const provider = new ethers.providers.Web3Provider(window.ethereum)
        // const alchemyApiKey = process.env.API_KEY;
        // const providerUrl = `https://eth-mumbai.alchemyapi.io/v2/${alchemyApiKey}`;
        const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
        try {
            let bal = await provider.getBalance(userAddress);
            console.log(bal.toString());
            setBalance(ethers.utils.formatEther(bal.toString()));
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        init()
    }, [userAddress, balance, privateKey])

    useEffect(() => {
        setConfig(prevConfig => {
            return {
                ...prevConfig,
                signingKey: privateKey
            }
        })
    }, [privateKey])
    return (
        <div className="lg:mx-44 mx-4 bg-black rounded-lg h-full">
            <Header balance={balance} config={config} privateKey={privateKey} setPrivateKey={setPrivateKey} />
            <div className="bg-black p-10 rounded-xl shadow-lg ">
                <Account balance={balance} refresh={refresh} address={userAddress} privateKey={privateKey} init={init} />
                <div className="flex flex-wrap justify-center gap-14 pt-10">
                    <Send balance={balance} config={config} init={init} />
                    <Receive userAddress={userAddress} />
                </div>
            </div>
        </div>
    );
}

