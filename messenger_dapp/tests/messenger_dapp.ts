import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import assert from 'assert'
import { MessengerDapp } from '../target/types/messenger_dapp';

describe('messenger_dapp', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.MessengerDapp as Program<MessengerDapp>;
  let _baseAccount

  it('An account is initialized!', async () => {
    const baseAccount = anchor.web3.Keypair.generate()
    await program.rpc.initialize("First message", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [baseAccount]
    })

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey)
    console.log('Data: ', account.data)
    assert.ok(account.data === "First message")
    _baseAccount = baseAccount;
    
  });

  it("Update the account previously created", async () => {
    const baseAccount = _baseAccount;

    await program.rpc.update("Second message", {
      accounts: {
        baseAccount: baseAccount.publicKey,
      }
    })

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey)
    console.log('Data: ', account.data)
    console.log('Data list: ', account.dataList)
    
    assert.ok(account.data === "Second message")
    assert.ok(account.dataList.length === 2)
  })
});
