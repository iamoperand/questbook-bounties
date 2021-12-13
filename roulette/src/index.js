require('dotenv').config()
const chalk = require('chalk')
const inquirer = require('inquirer')
const { Keypair } = require('@solana/web3.js')

const { transferSol } = require('./solana')
const { getRandomNumber } = require('./helper')

const log = console.log

const programWalletPrivateKey = process.env.PROGRAM_WALLET_PRIVATE_KEY
const playerWalletPrivateKey = process.env.PLAYER_WALLET_PRIVATE_KEY

const programWalletSeed = programWalletPrivateKey.slice(0, 32)
const playerWalletSeed = playerWalletPrivateKey.slice(0, 32)

const programKeypair = Keypair.fromSeed(Uint8Array.from(programWalletSeed))
const playerKeypair = Keypair.fromSeed(Uint8Array.from(playerWalletSeed))

async function startGame() {
  log(chalk.green('Hey hey, hope you have a good time.'))
  log('')

  log(chalk.red('Note: The max bidding amount is 2.5 SOL here.'))

  const prompts = await inquirer.prompt([
    {
      type: 'number',
      name: 'amount',
      message: 'What is the amount of SOL you want to stake?',
      validate(value) {
        const pass = value <= 2.5
        if (pass) {
          return true
        }
        return `Amount can't be greater than 2.5 SOL`
      },
    },
    {
      type: 'input',
      name: 'ratio',
      message: 'How much leverage do you want to risk? (2, 3, ...)',
    },
  ])

  const { amount, ratio } = prompts
  const winningAmount = amount * ratio

  log(
    chalk.bold(
      `You need to pay ${amount} SOL to move forward, you'll get ${winningAmount} SOL back on winning.`,
    ),
  )

  const confirmationPrompt = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'value',
      message: `Do you want to continue?`,
    },
  ])

  const shouldContinue = confirmationPrompt.value
  if (!shouldContinue) {
    log(chalk.bold('Finish.'))
    return
  }

  log(chalk.bold('Transferring the stake amount to the program.'))
  const stakeTxSignature = await transferSol(playerKeypair, programKeypair, amount)
  log(chalk.greenBright('Stake transaction signature: ', stakeTxSignature))

  const randomNumberPrompt = await inquirer.prompt([
    {
      type: 'number',
      name: 'value',
      message: 'Guess a random number from 1 to 5 (both 1, 5 included)',
      validate(value) {
        const pass = value >= 1 && value <= 5
        if (pass) {
          return true
        }
        return `Number must be from 1 to 5.`
      },
    },
  ])

  const randomNumber = randomNumberPrompt.value
  const answer = getRandomNumber()

  if (answer !== randomNumber) {
    log(chalk.red(`Correct guess is ${answer}. Better luck next time.`))
    return
  }

  log(
    chalk.greenBright(
      `You made the correct guess. Winning amount is being transferred to you as we speak...`,
    ),
  )

  const winningTxSignature = await transferSol(programKeypair, playerKeypair, winningAmount)
  log(chalk.greenBright('Winning transaction signature: ', winningTxSignature))
}

startGame()
