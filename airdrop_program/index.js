const { Connection, LAMPORTS_PER_SOL, Keypair, clusterApiUrl, PublicKey } = require('@solana/web3.js')

const newPair = new Keypair();

async function getBalance(publicKey) {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), "confirmed")
    const balance = await connection.getBalance(publicKey)
    return balance
  } catch (err) {
    console.error({ err })
    return null
  }
}

async function airdropSol(amountInSol, address) {
  try {
    const connection  = new Connection(clusterApiUrl('devnet'), "confirmed")
    
    const publicKey = new PublicKey(address)
    const amountInLamports = amountInSol * LAMPORTS_PER_SOL

    const balanceBeforeAirdrop = await getBalance(publicKey)
    console.log('Balance before airdrop: ', balanceBeforeAirdrop)
    
    const tx = await connection.requestAirdrop(publicKey, amountInLamports)

    const balanceAfterAirdrop = await getBalance(publicKey)
    console.log('Balance after airdrop: ', balanceAfterAirdrop)
  } catch(error) {
    console.log({ error })
  }
}


const driverFunction = async () => {
  const publicKey = newPair.publicKey.toBase58()
  await airdropSol(1, address);
}
driverFunction();