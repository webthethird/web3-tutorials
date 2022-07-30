// React Components are standalone, reusable functions that return HTML elements
import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, isWeb3EnableLoading, deactivateWeb3, Moralis } =
        useMoralis()

    // useEffect is a core React hook, which constantly checks for changes to any of the
    // values given in the dependency array, and runs the function when a change occurs
    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])
    // Without dependency array, runs anytime something re-renders
    // CAREFUL! This can cause circular rendering

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("connected")
                }
                deactivateWeb3()
                console.log("null account found")
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()

                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
