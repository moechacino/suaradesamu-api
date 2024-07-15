import { Candidate } from "@prisma/client";

export type CandidateCreateRequest = {
  name: string;
  age: number;
  noUrut: number;
  visi: string;
};

export type OrganizationCreateRequest = {
  title: string;
  periodStart: Date;
  periodEnd: Date;
};

export type WorkExperienceCreateRequest = {
  title: string;
  periodStart: Date;
  periodEnd: Date;
};
export type EducationCreateRequest = {
  degree: string;
  institution: string;
  periodStart: Date;
  periodEnd: Date;
};

export type WorkPlanCreateRequest = {
  title: string;
  detail: string;
};

export type CandidateResponse = {
  id: number;
  name: string;
  age: number;
  noUrut: number;
  visi: string;
  photoProfileUrl: string;
  photoProfileAlt: string;
  workPlan?: object[] | null;
  education?: object[] | null;
  workExperience?: object[] | null;
  organization?: object[] | null;
  misi?: object[] | null;
};

export function toCandidateResponse(candidate: Candidate): CandidateResponse {
  return {
    id: candidate.id,
    name: candidate.name,
    age: candidate.age,
    visi: candidate.visi,
    noUrut: candidate.noUrut,
    photoProfileUrl: candidate.photoProfileUrl,
    photoProfileAlt: candidate.photoProfileAlt,
  };
}
