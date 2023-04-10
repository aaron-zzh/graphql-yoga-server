import { execute, parse } from 'graphql'
import { schema } from './schema'
import { createContext } from './context'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'

// async function main() {
//   const myQuery = parse(/* GraphQL */ `
//     query {
//       hello 
//     }
//   `)

//   const result = await execute({
//     schema,
//     document: myQuery
//   })

//   console.log(result)
// }


// curl -X POST http://localhost:4000/graphql -H "Content-type: application/json" --data-raw '{"query": "query { hello }"}'
function main() {
  const yoga = createYoga({ schema, context: createContext })
  const server = createServer(yoga)
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

main()