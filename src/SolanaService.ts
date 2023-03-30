
import * as buffer from "buffer";

import { PublicKey } from "@solana/web3.js";
import * as web3 from '@solana/web3.js'

import { getOrCreateAssociatedTokenAccount,  getAssociatedTokenAddress, transfer, createTransferInstruction } from "@solana/spl-token";
import { Connection, Transaction } from "@solana/web3.js";
import bs58 from "bs58";

const SOLANA_MAINNET_USDC_PUBKEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_MAINNET_USDT_PUBKEY = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"

const USDC = new web3.PublicKey(SOLANA_MAINNET_USDC_PUBKEY)
const USDT = new web3.PublicKey(SOLANA_MAINNET_USDT_PUBKEY)

declare const window: any;

const fromWallet =  new web3.PublicKey('GeKcUd7Ftqhyyvf2zE9JNx5bud5N7QvUBnBQkYWwRnHg') // wallet bot

export interface SignedTransaction {
    hex: string;
}

interface SendToken {
    amount: number;
    address: string;
}

interface SendUSDCResult extends SignedTransaction {
    hex: string;
    toTokenAccountAddress: string;
}

export interface SendUSDC extends SendToken {
}

export interface SendUSDT extends SendToken {
}

export async function sendRawTransaction(transaction: Buffer) {

    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/zQCP8Bt8cAq63ToBYunRGWyag8HdzWp-');

    return connection.sendRawTransaction(transaction)

}

export async function sendAndConfirmRawTransaction(transaction: Buffer) {

    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/zQCP8Bt8cAq63ToBYunRGWyag8HdzWp-');

    const sendAndConfirmResult = await web3.sendAndConfirmRawTransaction(connection, transaction)

    console.log("sendAndConfirmResult", sendAndConfirmResult)

    return sendAndConfirmResult

}


export async function getTokenAddress(accountAddress: string, token: PublicKey): Promise<string> {

    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/zQCP8Bt8cAq63ToBYunRGWyag8HdzWp-');

    const provider = getProvider()

    var toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        provider,
        token,
        new PublicKey(accountAddress)
    )
    console.log({ toTokenAccount }, toTokenAccount.address.toBase58())

  return toTokenAccount.address.toBase58()
}

export async function sendUSDC({ address, amount }: SendUSDC): Promise<SendUSDCResult> {

    window.Buffer = buffer.Buffer;

    const {provider} = await connectProvider()

    const toWallet = new PublicKey(address)

    /*

    console.log('SEND USDC')

    const provider1 = getProvider();

    console.log(provider1)
const connection1 = new Connection('https://api.mainnet-beta.solana.com');
const transaction1 = new Transaction();
const signedTransaction = await provider1.request({
    method: "signTransaction",
    params: {
         message: bs58.encode(transaction1.serializeMessage()),
    },
});
const signature = await connection1.sendRawTransaction(signedTransaction.serialize());



    console.log({connection, provider})
    /* createTransferInstruction
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number | bigint,
    */
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/zQCP8Bt8cAq63ToBYunRGWyag8HdzWp-');

  const fromAccountInfo = await connection.getAccountInfo(fromWallet)
  console.log({ fromAccountInfo })
  const toAccountInfo = await connection.getAccountInfo(toWallet);
  console.log({ toAccountInfo })

  // Create associated token accounts for my token if they don't exist yet
  var fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    provider, // payer
    USDC, // mint
    fromWallet // owner
  )
  console.log({ fromTokenAccount })

  var toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    provider,
    USDC,
    toWallet
  )
  console.log({ toTokenAccount }, toTokenAccount.address.toBase58())
  /*

  const transferToken = await transfer(
    connection,
    provider,
    fromTokenAccount.address,
    toTokenAccount.address,
    provider,
    1
  );

  console.log('transfer.result', transferToken)*/

  const instruction = createTransferInstruction(
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet,
    1_000_000 * amount
  )

  var transaction = new web3.Transaction()

  transaction.add(instruction)

  //var conn = new web3.Connection(provider);

  //@ts-ignore
  window.provider = provider

  transaction.feePayer = await  provider.publicKey;
  let blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = await blockhashObj.blockhash;

  const result = await provider.signTransaction(transaction)

  console.log('provider.signTransaction.result', result)

    return {
        hex: transaction.serialize().toString('hex'),
        toTokenAccountAddress: toTokenAccount.address.toBase58()
    }

}

export function getProvider() {
    if ('phantom' in window) {
      const phantom: any = window.phantom
      const provider = phantom.solana;
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
};

export async function connectProvider(): Promise<any> {

    const provider = getProvider(); // see "Detecting the Provider"
    try {
        const connection = await provider.connect();
        console.log('provider.connect.result', connection)
        console.log('publicKey', connection.publicKey.toString());

        provider.on('accountChanged', (publicKey: web3.PublicKey) => {
            if (publicKey) {
                // Set new public key and continue as usual
                console.log(`Switched to account ${publicKey.toBase58()}`);
            } 
        });

        return {provider, connection};
        // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }
}
