export interface Module {
  moduleId: number;
  courseId: number;
  title: string;
  description: string;
  orderNumber: number;
}

export interface CreateModuleRequest {
  courseId?: number; // Optional vì sẽ được set từ URL path
  title: string;
  description: string;
  orderNumber: number;
}

export interface UpdateModuleRequest {
  moduleId?: number; // Optional vì sẽ được set từ URL path
  courseId: number;
  title: string;
  description: string;
  orderNumber: number;
}
