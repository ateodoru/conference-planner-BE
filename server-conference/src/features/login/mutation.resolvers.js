// const { prisma } = require('../../prisma')

// const LoginMutationResolver = {
//   Mutation: {
//     login: async (_parent, { input }, _ctx, _info) => {
//       const { email, password } = input
//       const user = await prisma.user.findUnique({ where: { email } })

//       if (!user) {
//         throw new Error('User does not exist!')
//       }
//       if (user.password !== password) {
//         throw new Error('Invalid password!')
//       }
//       console.log('Received email:', email)
//       console.log('Received password:', password)

//       return user.email
//     }
//   }
// }
// module.exports = LoginMutationResolver
