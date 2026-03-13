import Miner from "../components/Miner"
import WalletConnect from "../components/WalletConnect"

export default function Home() {

 return (

  <main className="flex flex-col items-center justify-center h-screen gap-6">

   <WalletConnect/>

   <Miner/>

  </main>

 )

}