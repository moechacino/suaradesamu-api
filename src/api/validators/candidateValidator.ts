export class CandidateValidator {
  static createOrganization(): object {
    const schema = {
      body: {
        type: "object",
        required: ["title", "periodStart"],
        properties: {
          title: { type: "string" },
          periodStart: { type: "string", format: "date" },
          periodEnd: { type: "string" },
        },
      },
    };
    return schema;
  }

  static createWorkExperience(): object {
    const schema = {
      body: {
        type: "object",
        required: ["title", "periodStart"],
        properties: {
          title: { type: "string" },
          periodStart: { type: "string", format: "date" },
          periodEnd: { type: "string" },
        },
      },
    };
    return schema;
  }

  static createEducation(): object {
    const schema = {
      body: {
        type: "object",
        required: ["degree", "institution", "periodStart"],
        properties: {
          title: { type: "string" },
          institution: { type: "string" },
          periodStart: { type: "string", format: "date" },
          periodEnd: { type: "string" },
        },
      },
    };
    return schema;
  }

  static createWorkPlan(): object {
    const schema = {
      body: {
        type: "object",
        required: ["title", "detail"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
      },
    };
    return schema;
  }
}
