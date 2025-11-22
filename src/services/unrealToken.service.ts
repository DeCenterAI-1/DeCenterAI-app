"use server";

import {
  Chain,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "@/lib/thirdweb";
import { activeChain, activeChainConfig } from "@/utils/chains";

// Load private key of your treasury wallet
const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY!;
const account = privateKeyToAccount({
  client,
  privateKey: treasuryPrivateKey,
});

export async function sendWelcomeTokens(toWallet: string, amount: number) {
  try {
    // Get the Unreal token contract (ERC20)
    const contract = getContract({
      client,
      chain: activeChain,
      address: activeChainConfig.custom.tokens.UnrealToken.address,
    });

    // ERC20 usually has 18 decimals → convert to base units
    const decimals = activeChainConfig.custom.tokens.UnrealToken.decimals;
    const value = BigInt(amount) * BigInt(10 ** decimals);

    // Prepare transfer
    const tx = prepareContractCall({
      contract,
      method: "function transfer(address to, uint256 value)",
      params: [toWallet, value],
    });

    console.debug(
      `Prepare sending welcome token value:${value} to ${toWallet}`
    );

    // Execute transaction
    const receipt = await sendTransaction({
      account,
      transaction: tx,
    });

    console.log(
      `Sent ${amount} Unreal tokens to ${toWallet}, txHash: ${receipt.transactionHash}`
    );
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error("Failed to send welcome tokens:", error);
    return { success: false, message: String(error) };
  }
}

export async function executePermitWithRelayer(
  signature: string,
  userAddress: string,
  chain: Chain,
  tokenAddress: string,
  spender: string,
  amount: bigint,
  deadline: number
) {
  try {
    // split signature into r, s, v
    const sig = signature.slice(2);
    const r = "0x" + sig.slice(0, 64);
    const s = "0x" + sig.slice(64, 128);
    let v = Number("0x" + sig.slice(128, 130));
    if (v < 27) v += 27;

    // Load contract
    const contract = getContract({
      client,
      address: tokenAddress,
      chain,
    });

    // Prepare permit() call
    const transaction = await prepareContractCall({
      contract,
      method:
        "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)",
      params: [
        userAddress,
        spender,
        amount,
        BigInt(deadline),
        v,
        r as `0x${string}`,
        s as `0x${string}`,
      ],
    });

    // Send tx — relayer pays gas
    return await sendTransaction({
      account, // gas payer
      transaction,
    });
  } catch (error) {
    console.error("Error execute permit:", error);
    throw error;
  }
}
