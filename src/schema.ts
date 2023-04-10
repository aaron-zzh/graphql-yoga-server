import { makeExecutableSchema } from '@graphql-tools/schema'
import type { GraphQLContext } from './context'
import type { Link, Comment, User, Prisma  } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { APP_SECRET } from './auth'
import { hash,compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

const parseIntSafe = (value: string): number | null => {
  if (/^(\d+)$/.test(value)) {
    return parseInt(value, 10)
  }
  return null
}

const applyTakeConstraints = (params: {
  min: number
  max: number
  value: number
}) => {
  if (params.value < params.min || params.value > params.max) {
    throw new GraphQLError(
      `'take' argument value '${params.value}' is outside the valid range of '${params.min}' to '${params.max}'.`
    )
  }
  return params.value
}

const typeDefinitions = /* GraphQL */ `
  type Query {
    hello: String!
    info: String!
    feed(filterNeedle: String, skip: Int, take: Int, orderBy: LinkOrderByInput): [Link!]!
    comment(id: ID!): Comment
    link(id: ID): Link
    me: User!
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!): Comment!
    signup(email: String!, password: String!, name: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    vote(linkId: ID!): Vote
  }

  type Vote {
    id: ID!
    link: Link!
    user: User!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type User {
    id: ID!
    name: String!
    email: String!
    links: [Link!]!
  }

  type Link {
    id: ID!
    description: String!
    url: String!
    comments: [Comment!]!
    postedBy: User
    votes: [Vote!]!
  }

  type Comment {
    id: ID!
    body: String!
    link: Link
  }
  
  type Subscription {
    newLink: Link!
    newVote: Vote!
  }

  input LinkOrderByInput {
    description: Sort
    url: Sort
    createdAt: Sort
  }
  
  enum Sort {
    asc
    desc
  }
`

// type Link = {
//   id: string
//   url: string
//   description: string
// }

// 2
// const links: Link[] = [
//   {
//     id: 'link-0',
//     url: 'https://graphql-yoga.com',
//     description: 'The easiest way of setting up a GraphQL server'
//   }
// ]

const resolvers = {
  Query: {
    hello: () => 'Hello World!',
    info: () => `This is the API of a Hackernews Clone`,
    me(parent: unknown, args: {}, context: GraphQLContext) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }
      return context.currentUser
    },
    // 3 
    // feed: () => links
    // feed: (parent: unknown, args: {}, context: GraphQLContext) =>
    //   context.prisma.link.findMany(),
    async feed(
      parent: unknown,
      args: { filterNeedle?: string; skip?: number; take?: number,
        orderBy?: {
          description?: Prisma.SortOrder
          url?: Prisma.SortOrder
          createdAt?: Prisma.SortOrder
        }
      },
      context: GraphQLContext
    ) {
      const where = args.filterNeedle
        ? {
            OR: [
              { description: { contains: args.filterNeedle } },
              { url: { contains: args.filterNeedle } }
            ]
          }
        : {}
      const take = applyTakeConstraints({
        min: 1,
        max: 50,
        value: args.take ?? 30
      })
      return context.prisma.link.findMany({
        where, 
        skip: args.skip,
        take,
        orderBy: args.orderBy
      })
    },
    async comment(
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) {
      return context.prisma.comment.findUnique({
        where: { id: parseInt(args.id) }
      })
    },
    async link(
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) {
      return context.prisma.link.findUnique({
        where: { id: parseInt(args.id) }
      })
    }
  },
  Link: {
    comments(parent: Link, args: {}, context: GraphQLContext) {
      return context.prisma.comment.findMany({
        where: {
          linkId: parent.id
        }
      })
    },
    postedBy(parent: Link, args: {}, context: GraphQLContext) {
      if (!parent.postedById) {
        return null
      }

      return context.prisma.link
        .findUnique({ where: { id: parent.id } })
        .postedBy()
    },
    votes: (parent: Link, args: {}, context: GraphQLContext) =>
      context.prisma.link.findUnique({ where: { id: parent.id } }).votes()
  },
  Vote: {
    link: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).link(),
    user: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).user()
  },
  Comment: {
    link(parent: Comment, args: {}, context: GraphQLContext) {
      return context.prisma.link.findUnique({
        where: {
          id: parent.linkId || 1
        }
      })
    }
  },
  User: {
    links: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).links()
  },
  // 4 在第一层调用Query.Feed解析器并返回存储在链接中的整个数据。
  // 第二层 GraphQL 服务器(基于schema，它知道要返回Link元素列表)
  // 为前一个解析器级别上返回的列表中的每个元素调用Link类型的解析器。
  // 因此，在 Link 三个链接解析器中，传入的父对象 parent 都是 links 中的元素。  可以删除该解析器
  // Link: {
  //   id: (parent: Link) => parent.id,
  //   description: (parent: Link) => parent.description,
  //   url: (parent: Link) => parent.url
  // },
  // 访问本地内存变量
  // Mutation: {
  //   postLink: (parent: unknown, args: { description: string; url: string }) => {
  //     // 1
  //     let idCount = links.length
  //     // 2
  //     const link: Link = {
  //       id: `link-${idCount}`,
  //       description: args.description,
  //       url: args.url
  //     }
  //     links.push(link)
  //     return link
  //   }
  // }
  Mutation: {
    async signup(
      parent: unknown,
      args: { email: string; password: string; name: string },
      context: GraphQLContext
    ) {
      const password = await hash(args.password, 10)
      const user = await context.prisma.user.create({
        data: { ...args, password }
      })
      const token = sign({ userId: user.id }, APP_SECRET)
      return { token, user }
    },
    async login(
      parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) {
      const user = await context.prisma.user.findUnique({
        where: { email: args.email }
      })
      if (!user) {
        throw new Error('No such user found')
      }
      const valid = await compare(args.password, user.password)
      if (!valid) {
        throw new Error('Invalid password')
      }
      const token = sign({ userId: user.id }, APP_SECRET)
      return { token, user }
    },
    async postLink(
      parent: unknown,
      args: { description: string; url: string },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }
      const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
          postedBy: { connect: { id: context.currentUser.id } }
        }
      })
      context.pubSub.publish('newLink', { newLink })
      return newLink
    },
    async postCommentOnLink(
      parent: unknown,
      args: { linkId: string; body: string },
      context: GraphQLContext
    ) {
      const linkId = parseIntSafe(args.linkId)
      if (linkId === null) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post comment on non-existing link with id '${args.linkId}'.`
          )
        )
      }
      const newComment = await context.prisma.comment.create({
        data: {
          linkId,
          body: args.body
        }
      }).catch((err: unknown) => {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
          return Promise.reject(
            new GraphQLError(
              `Cannot post comment on non-existing link with id '${args.linkId}'.`
            )
          )
        }
        return Promise.reject(err)
      })
 
      return newComment
    },
    async vote(
      parent: unknown,
      args: { linkId: string },
      context: GraphQLContext
    ) {
      if (!context.currentUser) {
        throw new GraphQLError('You must login in order to use upvote!')
      }
      const userId = context.currentUser.id
      const vote = await context.prisma.vote.findUnique({
        where: {
          linkId_userId: {
            linkId: Number(args.linkId),
            userId: userId
          }
        }
      })
      if (vote !== null) {
        throw new Error(`Already voted for link: ${args.linkId}`)
      }
      const newVote = await context.prisma.vote.create({
        data: {
          user: { connect: { id: userId } },
          link: { connect: { id: Number(args.linkId) } }
        }
      })
      context.pubSub.publish('newVote', { newVote })
      return newVote
    }
  },
  Subscription: {
    newLink: {
      subscribe: (parent: unknown, args: {}, context: GraphQLContext) =>
        context.pubSub.subscribe('newLink')
    },
    newVote: {
      subscribe: (parent: unknown, args: {}, context: GraphQLContext) =>
        context.pubSub.subscribe('newVote')
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})