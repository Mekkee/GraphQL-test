const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql')

const app = express()

// FAKE DATABASE
const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
  { id: 4, name: 'William Shakespeare' },
  { id: 5, name: 'Ernest Hemingway' },
]

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 },
  { id: 9, name: 'All’s Well that Ends well', authorId: 4 },
  { id: 10, name: 'As you like it', authorId: 4 },
  { id: 11, name: 'Comedy of Errors', authorId: 4 },
  { id: 12, name: 'Farewell to Arms, A', authorId: 5 },
  { id: 13, name: 'For whom the Bell Tolls', authorId: 5 },
]

// GRAPHQL API
const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'Represents the book written by the author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) }, // the value will always be an integer and never a null value.
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId)
      },
    },
  }),
})
// Using functions in the fields instead of objects because they reference each other, so that everything can get defined before they actually start getting called.
const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'Represents the author of the book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id)
      },
      /* 
        {
            authors {
                id
                name
                books {
                    name
                }
            }
        }  
      */
    },
  }),
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Rooy Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'Single book',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
      /* 
        {
            book(id: 1) {
                name
                author {
                    name
                }
            }
        }
      */
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: 'Single authors',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add an book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        }
        books.push(book)
        return book
      },
      /* 
        mutation {
            addBook(name: "new book", authorId: 4) {
                id
                name
            }
        }
      */
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        }
        authors.push(author)
        return author
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
)
app.listen(5000, () => console.log('server running'))
