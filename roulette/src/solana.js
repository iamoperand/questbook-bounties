const {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require('@solana/web3.js')

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

async function getWalletBalance(address) {
  try {
    const publicKey = new PublicKey(address)

    const balance = await connection.getBalance(publicKey)
    return balance
  } catch (error) {
    console.error({ error })
    return null
  }
}

async function airdropSol(amountInSol, address) {
  try {
    const publicKey = new PublicKey(address)
    const amountInLamports = amountInSol * LAMPORTS_PER_SOL
    console.log({ amountInLamports })

    const balanceBeforeAirdrop = await getWalletBalance(address)
    console.log(`Balance before airdrop for ${address}: ${balanceBeforeAirdrop}`)

    const tx = await connection.requestAirdrop(publicKey, amountInLamports)

    const balanceAfterAirdrop = await getWalletBalance(address)
    console.log(`Balance after airdrop for ${address}: ${balanceAfterAirdrop}`)
  } catch (error) {
    console.log({ error })
  }
}

async function transferSol(from, to, transferAmount) {
  try {
    const fromPubkey = new PublicKey(from.publicKey.toString())
    const toPubkey = new PublicKey(to.publicKey.toString())

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: transferAmount * LAMPORTS_PER_SOL,
      }),
    )
    const signature = await sendAndConfirmTransaction(connection, transaction, [from])
    return signature
  } catch (error) {
    console.error({ error })
    return null
  }
}

module.exports = {
  getWalletBalance,
  airdropSol,
  transferSol,
  connection,
}
