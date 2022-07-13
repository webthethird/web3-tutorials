import Head from "next/head"
import Image from "next/image"
import Header from "../components/Header"
import styles from "../styles/Home.module.css"
import { abi } from "../constants/abi"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Decentralized Lottery</title>
                <meta name="description" content="Our smart contract lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            {/* header / nav bar with connect button */}
        </div>
    )
}
