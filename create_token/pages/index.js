import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import { Box, Text, Button } from '@chakra-ui/react'

import MintUi from '../components/mint'

const getWalletProvider = async () => {
  if ('solana' in window) {
    const walletProvider = window.solana
    if (walletProvider.isPhantom) {
      return walletProvider
    }
  } else {
    window.open('https://www.phantom.app/', '_blank')
  }
}

function Home() {
  const [isWalletConnected, setWalletConnected] = React.useState(false)
  const [provider, setProvider] = React.useState()
  const [loading, setLoading] = React.useState()

  const handleAuthentication = async () => {
    if (isWalletConnected) {
      setProvider()
      setWalletConnected(false)
      return
    }

    const walletProvider = await getWalletProvider()
    if (walletProvider) {
      try {
        const provider = await walletProvider.connect()
        setProvider(provider)
        setWalletConnected(true)
      } catch (error) {
        console.error({ error })
      }
    }
  }

  return (
    <Box>
      <Head>
        <title>Create your own token | Solana</title>
        <meta name="description" content="Create your own token | Solana" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main">
        <Text>welcome</Text>

        {isWalletConnected && <Text>Public key: {provider.publicKey.toString()}</Text>}
        <Button onClick={handleAuthentication} disabled={loading}>
          {isWalletConnected ? 'Disconnect Wallet' : 'Connect wallet'}
        </Button>

        <MintUi provider={provider} />
      </Box>
    </Box>
  )
}

export default Home
