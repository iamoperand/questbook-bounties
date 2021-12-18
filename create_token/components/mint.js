import { Button, Box, Text } from '@chakra-ui/react'
import React from 'react'
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'

function Mint({ provider }) {
  const [isTokenCreated, setTokenCreated] = React.useState(false)
  const [tokenPubkey, setTokenPubkey] = React.useState(null)
  const [tokenSecretKey, setTokenSecretKey] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  const handleInitialMint = async () => {
    try {
      const mintRequester = provider.publicKey

      setLoading(true)
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

      const mintWallet = await Keypair.generate()
      setTokenSecretKey(JSON.stringify(mintWallet.secretKey))

      const airdropSignature = await connection.requestAirdrop(mintWallet.publicKey, LAMPORTS_PER_SOL)
      await connection.confirmTransaction(airdropSignature, 'confirmed')

      const token = await Token.createMint(connection, mintWallet, mintWallet.publicKey, null, 9, TOKEN_PROGRAM_ID)
      const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(mintWallet.publicKey)
      await token.mintTo(fromTokenAccount.address, mintWallet.publicKey, [], 1000 * LAMPORTS_PER_SOL)

      const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(mintRequester)
      const transaction = new Transaction().add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromTokenAccount.address,
          toTokenAccount.address,
          mintWallet.publicKey,
          [],
          1000 * LAMPORTS_PER_SOL,
        ),
      )
      const signature = await sendAndConfirmTransaction(connection, transaction, [mintWallet], {
        commitment: 'confirmed',
      })
      console.log('SIGNATURE: ', signature)

      setTokenSecretKey(token.publicKey.toString())
      setTokenCreated(true)
      setLoading(false)
    } catch (error) {
      console.log({ error })
      setLoading(false)
    }
  }

  return (
    <Box>
      <Button onClick={handleInitialMint}>initial mint</Button>
    </Box>
  )
}

export default Mint
