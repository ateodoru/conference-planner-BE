const { prisma } = require('../../prisma')
const { map } = require('ramda')

const SpeakerQueryResolver = {
  Query: {
    speakerList: async () => {
      try {
        // Fetch all speakers with associated conferences and isMainSpeaker status
        const speakers = await prisma.speaker.findMany({
          include: {
            conferences: {
              include: {
                conference: true // Include conference details
              }
            }
          }
        })
        return speakers || []
      } catch (error) {
        console.error('Error fetching speakers:', error)
        throw new Error('Failed to fetch speakers')
      }
    },

    speaker: async (_parent, { id }) => {
      try {
        // Fetch a specific speaker by ID with associated conferences and isMainSpeaker status
        const speaker = await prisma().speaker.findUnique({
          where: { id },
          include: {
            conferences: {
              include: {
                conference: true // Include conference details
              }
            }
          }
        })

        if (!speaker) {
          throw new Error('Speaker not found')
        }

        return speaker
      } catch (error) {
        console.error('Error fetching speaker:', error)
        throw new Error('Failed to fetch speaker')
      }
    }
  },

  Speaker: {
    conferences: async ({ id }) => {
      try {
        // Fetch the conferences for a specific speaker with isMainSpeaker status
        const conferences = await prisma().conferenceXSpeakers.findMany({
          where: { speakerId: id },
          include: {
            conference: true // Include conference details
          }
        })

        return conferences.map(({ isMainSpeaker, conference }) => ({
          isMainSpeaker,
          conference
        }))
      } catch (error) {
        console.error('Error fetching speaker conferences:', error)
        throw new Error('Failed to fetch speaker conferences')
      }
    }
  },

  ConferenceXSpeakers: {
    conference: async ({ conferenceId }) => {
      try {
        // Fetch the conference details by ID
        return await prisma().conference.findUnique({ where: { id: conferenceId } })
      } catch (error) {
        console.error('Error fetching conference:', error)
        throw new Error('Failed to fetch conference')
      }
    }
  }
}

module.exports = SpeakerQueryResolver
