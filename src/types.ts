export interface HomeworkItem {
  id: string;
  subjectName: string;
  title: string;
  fileName: string;
  fileData?: string; // base64 data URL for real uploaded files
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface ScheduleDocument {
  id: string;
  category: 'timetable' | 'datesheet';
  title: string;
  fileName: string;
  fileData?: string;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  dateUploaded: string;
  academicYear?: string;
  examTerm?: string;
}

export interface AppConfig {
  institutionName: string;
  classInfo: string;
  shiftInfo: string;
  customLogoUrl?: string; // Teacher can upload their own logo image
}

export type ActiveTab = 'homework' | 'timetable' | 'datesheet' | 'faculty';

export interface PortalDataResponse {
  homework: HomeworkItem[];
  timetable: ScheduleDocument | null;
  datesheet: ScheduleDocument | null;
  config: AppConfig;
  updatedAt?: number;
}
