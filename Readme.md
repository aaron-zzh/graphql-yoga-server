# graphql server 教程

- typescript is the basic TypeScript language support and compiler.
- @types/node is a package that contains the basic TypeScript types for Node.js environment.
- ts-node and ts-node-dev are libraries that allow you to run .ts files directly, without a compilation step to JavaScript and automatically re-run your files after you apply file changes.
- cross-env allows providing environment variables cross-platform (windows environment variables are different 🤷).

- graphql is the GraphQL engine implementation.
- @graphql-tools/schema is a library for creating GraphQL executable schemas.

``` graphql
#
# Welcome to Yoga GraphiQL
#
# Yoga GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will see intelligent
# typeaheads aware of the current GraphQL type schema and live syntax and
# validation errors highlighted within the text.
#
# GraphQL queries typically start with a "{" character. Lines that start
# with a # are ignored.
#
# An example GraphQL query might look like:
#
#     {
#       field(arg: "value") {
#         subField
#       }
#     }
#
# Keyboard shortcuts:
#
#  Prettify Query:  Shift-Ctrl-P (or press the prettify button above)
#
#     Merge Query:  Shift-Ctrl-M (or press the merge button above)
#
#       Run Query:  Ctrl-Enter (or press the play button above)
#
#   Auto Complete:  Ctrl-Space (or just start typing)
#
# mutation {
#   postLink(
#     url: "www.prisma.io"
#     description: "Prisma replaces traditional ORMs"
#   ) {
#     id
#   }
# }
# {
#   feed {
#     id,
#     description
#   }
# }

# mutation postCommentOnLink {
#   postCommentOnLink(linkId: "1", body: "This is my first comment!") {
#     id
#     body
#   }
# }

# query comment {
#   comment(id:1) {
#     id
#     body
#     link {
#       id
#       description
#     }
#   }
# }

# query feed {
#   link(id:2) {
#     description
#   }
# }

# mutation postCommentOnLink {
#   postCommentOnLink(linkId: "uuuuuu", body: "This is my second comment!") {
#     id
#     body
#   }
# }


# query {
#   feed(filterNeedle: "QL") {
#     id
#     description
#     url
#   }
# }

# query {
#   feed(take: 1, skip: 1) {
#     id
#     description
#     url
#   }
# }

# query {
#   feed(take: 30) {
#     id
#     description
#     url
#   }
# }

# mutation {
#   signup(email: "test@mail.com", name: "Dotan Simha", password: "123456") {
#     token
#     user {
#       id
#       name
#       email
#     }
#   }
# }

# {
#   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4MTA1MDgzNH0.JO2MrtNpoqm4jUoNqhvJKT2apUP_ZmPJWw9k51DeZPI"
# }
# mutation {
#   login(email: "test@mail.com", password: "123456") {
#     token
#     user {
#       id
#       name
#       email
#     }
#   }
# }

# query {
#   me {
#     id
#     name
#   }
# }

# mutation {
#   postLink(
#     url: "www.graphqlconf.org"
#     description: "An awesome GraphQL conference33"
#   ) {
#     id
#   }
# }

# query {
#   feed {
#     id
#     description
#     url
#     postedBy {
#       id
#       name
#     }
#   }
# }

# query feed {
#   feed(orderBy: { createdAt: desc }) {
#     id
#     description
#     url
#   }
# }


mutation {
  vote(linkId: "3") {
    link {
      url
      description
    }
    user {
      name
      email
    }
  }
}

# subscription {
#   newLink {
#     id
#     url
#     description
#     postedBy {
#       id
#       name
#       email
#     }
#   }
# }

# subscription {
#   newVote {
#     id
#     link {
#       url
#       description
#     }
#     user {
#       name
#       email
#     }
#   }
# }

```