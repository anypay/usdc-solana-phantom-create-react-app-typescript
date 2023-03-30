

import * as Web3 from '@solana/web3.js'

import { PublicKey, Transaction } from '@solana/web3.js'

import { decodeTransferInstruction } from '@solana/spl-token';

import { getTokenAddress, sendAndConfirmRawTransaction, sendRawTransaction, sendUSDC } from './SolanaService';

interface SolanaPayUSDCProps {
    amount: number;
    address: string;
}

interface Output {
    address: string;
    amount: number;
}

interface ValidateTransaction {
    template: Output[];
    txhex: string;
}

interface InstructionOutput {
    amount: number;
    source: string;
    destination: string;
    owner: string;
    programId: string;
}

async function validateTransaction({template, txhex}: ValidateTransaction): Promise<[boolean, any | null]> {

    const usdc = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")


    const errors = []

    const transaction: Transaction = Transaction.from(Buffer.from(txhex, 'hex'))

    const outputs: (InstructionOutput | undefined)[] | any[] = transaction.instructions.map(instruction => {

        try {

            let decoded = decodeTransferInstruction(instruction)

            const output: InstructionOutput = {
                amount: parseInt(decoded.data.amount.toString()),
                source: decoded.keys.source.pubkey.toBase58(),
                destination: decoded.keys.destination.pubkey.toBase58(),
                owner: decoded.keys.owner.pubkey.toBase58(),
                programId: decoded.programId.toBase58()
            }

            return output

        } catch(error) {

            console.debug(error)
        }

    }).filter((output: any) => !!output)


    for (let expectedOutput of template) {

        let destination = await getTokenAddress(expectedOutput.address, usdc)

        const matching = outputs.find((output: InstructionOutput) => {

            let expectedAmount = 1_000_000 * expectedOutput.amount

            return (destination === output.destination) && (expectedAmount === output.amount)

        })

        if (!matching) {

            errors.push(expectedOutput)
        }

    }

    if (errors.length > 0) {

        return [false, errors]

    } else {

        return [true, null]
    }

}

export default function SolanaPayUSDCButton(props: SolanaPayUSDCProps) {

    const { amount } = props

    //@ts-ignore
    window.web3 = Web3

    const sender = new PublicKey("GeKcUd7Ftqhyyvf2zE9JNx5bud5N7QvUBnBQkYWwRnHg")
    const receiver = new PublicKey(props.address)
    const usdc = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")

    async function onClick(): Promise<void> {

        console.log('onClick', { amount, sender, receiver, usdc })

        const {toTokenAccountAddress, hex} = await sendUSDC({
            address: props.address,
            amount: props.amount
        })

        console.log('sendUSDC.result', {toTokenAccountAddress, hex})

        const transaction = Transaction.from(Buffer.from(hex, 'hex'))

        const validation = await validateTransaction({
            template: [{
                address: props.address,
                amount: props.amount
            }],
            txhex: transaction.serialize().toString('hex')
        })

        console.log('VALIDATION', validation)

        const [isValid] = validation

        if (isValid) {

            const sendResult = await sendRawTransaction(transaction.serialize())

            console.log('send.result', sendResult)

            const confirmResult = await sendAndConfirmRawTransaction(transaction.serialize())

            console.log('confirmResult', confirmResult)

        }
 
        //@ts-ignore
        window.transaction = transaction

    }

    return (
        <>
            <button onClick={onClick}>Pay USDC with Phantom</button>
        </>
    )

}