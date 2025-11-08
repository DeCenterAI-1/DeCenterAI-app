import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { TopicCreateTransaction, TopicMessageSubmitTransaction,  } from '@hashgraph/sdk';
import { createInstance } from '../api/hedera-client.ts';

const hederaClient = createInstance();


/* ---------------- SCHEMAS + TYPES ---------------- */

const createTopicSchema = z.object({
  memo: z.string().describe('A memo for the topic'),
});
type CreateTopicInput = z.infer<typeof createTopicSchema>;

const submitMessageSchema = z.object({
  topicId: z.string().describe('The ID of the HCS topic to submit a message to'),
  message: z.string().describe('The text of the message to submit'),
});
type SubmitMessageInput = z.infer<typeof submitMessageSchema>;

/* ---------------- CMD_HCS_CREATE_TOPIC ---------------- */

const commandHcsCreateTopicDef = {
  name: 'CMD_HCS_CREATE_TOPIC',
  description: 'Create a new Hedera Consensus Service topic',
  schema: createTopicSchema,
};

async function commandHcsCreateTopicImpl({ memo }: CreateTopicInput) {
  console.log('CMD_HCS_CREATE_TOPIC called → memo:', memo);

  const tx = await new TopicCreateTransaction()
    .setTopicMemo(memo)
    .freezeWith(hederaClient);

  const signed = await tx.signWithOperator(hederaClient);
  const submitted = await signed.execute(hederaClient);
  const receipt = await submitted.getReceipt(hederaClient);

  if (!receipt.topicId) {
    throw new Error("Hedera returned no topicId. Check operator keys and network status.");
  }

  return {
    txId: submitted.transactionId.toString(),
    topicId: receipt.topicId.toStringWithChecksum(hederaClient),
  };
}

const commandHcsCreateTopicTool = tool(commandHcsCreateTopicImpl, commandHcsCreateTopicDef);

/* ---------------- CMD_HCS_SUBMIT_TOPIC_MESSAGE ---------------- */

const commandHcsSubmitTopicMessageDef = {
  name: 'CMD_HCS_SUBMIT_TOPIC_MESSAGE',
  description: 'Submit a message to an existing HCS topic',
  schema: submitMessageSchema,
};

async function commandHcsSubmitTopicMessageImpl({ topicId, message }: SubmitMessageInput) {
  console.log('CMD_HCS_SUBMIT_TOPIC_MESSAGE called →', topicId, message);

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .freezeWith(hederaClient);

  const signed = await tx.signWithOperator(hederaClient);
  const submitted = await signed.execute(hederaClient);
  const receipt = await submitted.getReceipt(hederaClient);

  return {
    txId: submitted.transactionId.toString(),
    topicSequenceNumber: receipt.topicSequenceNumber,
  };
}

const commandHcsSubmitTopicMessageTool = tool(
  commandHcsSubmitTopicMessageImpl,
  commandHcsSubmitTopicMessageDef
);

/* ---------------- EXPORT ALL TOOLS ---------------- */

const allHederaTools = [
  commandHcsCreateTopicTool,
  commandHcsSubmitTopicMessageTool,
];

export {
  commandHcsCreateTopicTool,
  commandHcsSubmitTopicMessageTool,
  allHederaTools,
};
