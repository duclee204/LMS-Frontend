export interface Assignment {
  assignmentId?: number;
  contentId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  maxPoints?: number;
  createdAt?: Date;
}

export interface CreateAssignmentRequest {
  contentId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  maxPoints?: number;
}

export interface UpdateAssignmentRequest {
  assignmentId: number;
  contentId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  maxPoints?: number;
}

export interface AssignmentSubmission {
  submissionId?: number;
  assignmentId: number;
  studentId: number;
  submissionText?: string;
  fileUrl?: string;
  submittedAt?: Date;
  pointsEarned?: number;
  feedback?: string;
  gradedAt?: Date;
}

export interface CreateSubmissionRequest {
  assignmentId: number;
  submissionText?: string;
}

export interface GradeSubmissionRequest {
  points: number;
  feedback: string;
}
