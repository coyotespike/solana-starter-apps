import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import AddressForm from '../components/AddressForm'
import * as web3 from '@solana/web3.js'

const Home: NextPage = () => {
    const [balance, setBalance] = useState(0)
    const [address, setAddress] = useState('')
    const [accountInfo, setAccountInfo] = useState(false)

    const addressSubmittedHandler = (address: string) => {
        try {
            // validates as Solana key
            // ofc want to catch error and display, not just crash app
            const key = new web3.PublicKey(address);

            setAddress(key.toBase58())

            const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
            connection.getAccountInfo(key).then(accountInfo => {
                setAccountInfo(accountInfo.executable)
            })
            connection.getBalance(key).then(balance => {
                setBalance(balance / web3.LAMPORTS_PER_SOL)
            })
        }
        catch (error) {
            setAddress('')
            setBalance(0)
            alert(error)
        }

    }

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <p>
          Start Your Solana Journey
        </p>
        <AddressForm handler={addressSubmittedHandler} />
        <p>{`Address: ${address}`}</p>
        <p>{`Balance: ${balance} SOL`}</p>
        <p>{`Is it executable? ${accountInfo.executable ? 'Yep' : 'Nope'}`}</p>
      </header>
    </div>
  )
}

export default Home
