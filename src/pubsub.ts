import { createPubSub } from '@graphql-yoga/subscription'
import { Link, Vote } from '@prisma/client'

export type PubSubChannels = {
  newLink: [{ newLink: Link }]
  newVote: [{ newVote: Vote }]
}

// 2
export const pubSub = createPubSub<PubSubChannels>()
