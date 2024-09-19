const { map } = require('ramda')
const { prisma } = require('../../prisma')

const conferenceMutationResolver = {
  Mutation: {
    saveConference: async (_parent, { input }, { dataSources }, _info) => {
      const { id: conferenceId, location, typeId, categoryId, speakers, deletedSpeakers, ...restConference } = input
      const { id: locationId, ...restLocation } = location

      const result = await prisma().$transaction(async prismaClient => {
        const upsertedLocation = await prismaClient.location.upsert({
          where: { id: locationId || -1 },
          update: restLocation,
          create: restLocation
        })

        const conferenceInput = {
          ...restConference,
          dictionaryConferenceType: {
            connect: { id: typeId }
          },
          dictionaryCategory: {
            connect: { id: categoryId }
          },
          location: {
            connect: { id: upsertedLocation.id }
          }
        }

        const upsertedConference = await prismaClient.conference.upsert({
          where: { id: conferenceId || -1 },
          update: conferenceInput,
          create: conferenceInput
        })

        if (deletedSpeakers?.length > 0) {
          await prismaClient.conferenceXSpeaker.deleteMany({
            where: { conferenceId, speakerId: { in: deletedSpeakers } }
          })
        }

        await Promise.all(
          map(async ({ id: speakerId, isMainSpeaker, ...restSpeaker }) => {
            const upsertedSpeaker = await prismaClient.speaker.upsert({
              where: { id: speakerId || -1 },
              update: restSpeaker,
              create: restSpeaker
            })

            await prismaClient.conferenceXSpeaker.upsert({
              where: {
                conferenceId_speakerId: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id }
              },
              update: { isMainSpeaker },
              create: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id, isMainSpeaker }
            })
          }, speakers)
        )
        return prismaClient.conference.findUnique({
          where: { id: upsertedConference.id },
          include: { conferenceXSpeaker: { include: { speaker: true } } }
        })
      })

      const updatedSpeakers = result.conferenceXSpeaker.map(s => s.speaker)

      await Promise.all(
        map(async speaker => {
          if (
            result.conferenceXSpeaker.some(x => x.speakerId === speaker.id) &&
            speaker.phoneNumber !== '' &&
            speaker.phoneNumber
          )
            await dataSources.conferenceApi.sendSMSNotification({
              conferenceId: result.id,
              receiverId: speaker.id
            })
        }, updatedSpeakers)
      )
      return result
    },

    changeAttendanceStatus: async (_parent, { input }, _ctx, _info) => {
      await prisma().conferenceXAttendee.upsert({
        where: {
          attendeeEmail_conferenceId: {
            conferenceId: input.conferenceId,
            attendeeEmail: input.attendeeEmail
          }
        },
        update: {
          statusId: input.statusId
        },
        create: {
          conferenceId: input.conferenceId,
          attendeeEmail: input.attendeeEmail,
          statusId: input.statusId
        }
      })
      return null
    },

    deleteConference: async (_parent, { id }, _ctx, _info) => {
      await prisma().conference.delete({ where: { id } })
      return 'Conference deleted successfully!'
    }
  }
}
module.exports = conferenceMutationResolver
