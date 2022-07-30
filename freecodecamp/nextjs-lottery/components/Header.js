import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div>
            <span>Decentralized Lottery</span>
            <ConnectButton moralisAuth={false} />
        </div>
    )
}
