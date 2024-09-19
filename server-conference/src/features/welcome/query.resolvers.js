const welcomeQueryResolvers = {
    Query: {
        // resolverul primeste mereu o functie cu 4  //(_parent, _arguments, _context, _info)
        helloThere: (_parent, _args, _ctx, _info) => {
            return 'Hello there 👋'
        }
    }
}
module.exports = welcomeQueryResolvers