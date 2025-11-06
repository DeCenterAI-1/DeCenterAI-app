import { NextRequest, NextResponse } from 'next/server';

const HEDERA_TESTNET_MIRROR = 'https://testnet.mirrornode.hedera.com';
const USDC_TOKEN_ID = '0.0.429274'; // USDC on Hedera testnet

// Convert EVM address to Hedera account ID
function evmToHederaId(evmAddress: string): string | null {
    try {
        // Remove 0x prefix and convert to number
        const hex = evmAddress.toLowerCase().replace('0x', '');
        const num = parseInt(hex, 16);
        return `0.0.${num}`;
    } catch {
        return null;
    }
}

async function verifyUSDCTransfer(
    transactionHash: string,
    expectedSender: string,
    expectedReceiver: string,
    expectedAmount: number,
    retries = 3
): Promise<any> {

    for (let i = 0; i < retries; i++) {
        try {
            // Query by transaction hash
            const url = `${HEDERA_TESTNET_MIRROR}/api/v1/contracts/results/${transactionHash}`;
            const response = await fetch(url);

            if (!response.ok) {
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                return {
                    verified: false,
                    error: `Transaction not found: ${response.status}`
                };
            }

            const data = await response.json();

            // Get the full transaction details
            const txUrl = `${HEDERA_TESTNET_MIRROR}/api/v1/transactions/${data.hash}`;
            const txResponse = await fetch(txUrl);

            if (!txResponse.ok) {
                return {
                    verified: false,
                    error: 'Could not fetch transaction details'
                };
            }

            const txData = await txResponse.json();
            const tx = txData.transactions[0];

            // Check if transaction was successful
            if (tx.result !== 'SUCCESS') {
                return {
                    verified: false,
                    error: `Transaction failed with status: ${tx.result}`
                };
            }

            // Convert EVM addresses to Hedera IDs
            const senderHederaId = evmToHederaId(expectedSender);
            const receiverHederaId = evmToHederaId(expectedReceiver);

            if (!senderHederaId || !receiverHederaId) {
                return {
                    verified: false,
                    error: 'Invalid account addresses'
                };
            }

            // Find USDC token transfers
            const usdcTransfers = tx.token_transfers?.filter(
                (transfer: any) => transfer.token_id === USDC_TOKEN_ID
            ) || [];

            if (usdcTransfers.length === 0) {
                return {
                    verified: false,
                    error: 'No USDC transfers found in this transaction'
                };
            }

            // USDC has 6 decimals, so multiply by 1,000,000
            const expectedAmountInSmallestUnit = expectedAmount * 1_000_000;

            // Find the sender (negative amount) and receiver (positive amount)
            const senderTransfer = usdcTransfers.find(
                (t: any) => t.account === senderHederaId && t.amount < 0
            );

            const receiverTransfer = usdcTransfers.find(
                (t: any) => t.account === receiverHederaId && t.amount > 0
            );

            // Verify all conditions
            const senderMatches = senderTransfer &&
                Math.abs(senderTransfer.amount) === expectedAmountInSmallestUnit;

            const receiverMatches = receiverTransfer &&
                receiverTransfer.amount === expectedAmountInSmallestUnit;

            if (senderMatches && receiverMatches) {
                return {
                    verified: true,
                    transaction: {
                        id: tx.transaction_id,
                        timestamp: tx.consensus_timestamp,
                        sender: senderHederaId,
                        receiver: receiverHederaId,
                        amount: expectedAmount,
                        tokenId: USDC_TOKEN_ID
                    }
                };
            } else {
                return {
                    verified: false,
                    error: 'Transfer amounts or accounts do not match expected values',
                    details: {
                        senderMatches,
                        receiverMatches,
                        foundTransfers: usdcTransfers
                    }
                };
            }

        } catch (error: any) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            return {
                verified: false,
                error: `Verification failed: ${error.message}`
            };
        }
    }

    return {
        verified: false,
        error: 'Max retries exceeded'
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            transactionHash,
            senderAddress,
            receiverAddress,
            amount
        } = body;

        // Validate inputs
        if (!transactionHash || !senderAddress || !receiverAddress || !amount) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields'
                },
                { status: 400 }
            );
        }

        // Verify the transaction
        const result = await verifyUSDCTransfer(
            transactionHash,
            senderAddress,
            receiverAddress,
            parseFloat(amount)
        );

        if (result.verified) {
            // Transaction verified - log the purchase
            const { credits } = body;

            console.log('✅ Payment Verified and Logged:');
            console.log({
                transactionId: result.transaction.id,
                timestamp: result.transaction.timestamp,
                sender: senderAddress,
                senderHedera: result.transaction.sender,
                receiver: receiverAddress,
                receiverHedera: result.transaction.receiver,
                amountUSDC: amount,
                credits: credits,
                tokenId: result.transaction.tokenId
            });

            // TODO: Send tokens to user's backend wallet address
            // Implementation for later:
            // 1. Get user's backend wallet from database using senderAddress
            // 2. Transfer {credits} tokens to that wallet

            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                transaction: result.transaction,
                creditsToAdd: credits
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment verification failed',
                    error: result.error,
                    details: result.details
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: `Server error: ${error.message}`
            },
            { status: 500 }
        );
    }
}
