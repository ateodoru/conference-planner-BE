const { prisma } = require('../../prisma')

const LoginQueryResolver = {
  Query: {
    login: async (_parent, { input }, _ctx, _info) => {
      const { email, password } = input
      const user = await prisma().user.findUnique({ where: { email } })

      if (!user) {
        return 'User does not exist!'
        //return false
      }
      if (user.password !== password) {
        return 'Invalid password!'
        //return false
      }

      return 'You are authenticated!'
    }
  }
}
module.exports = LoginQueryResolver
