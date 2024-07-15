export class VotingValidator {
  static startVoting(): object {
    const schema = {
      body: {
        type: "object",
        required: ["durationInMiliseconds"],
        properties: {
          durationInMiliseconds: { type: "string" },
        },
      },
    };
    return schema;
  }
}
