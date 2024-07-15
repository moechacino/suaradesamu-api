export class adminValidator {
  static login(): object {
    const schema = {
      body: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
      },
    };
    return schema;
  }
}
