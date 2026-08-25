import { HomeworkItem, ScheduleDocument, AppConfig } from '../types';

export const STANDARD_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'Hindi',
  'English',
  'Yoga',
  'Physics Lab',
  'Chemistry Lab',
  'Biology Lab',
  'Maths Lab'
];

export const INITIAL_APP_CONFIG: AppConfig = {
  institutionName: 'PM SHRI KENDRIYA VIDYALAYA SITAPUR',
  classInfo: 'Class 11th',
  shiftInfo: 'First Shift',
  customLogoUrl: ''
};

// Start with clean empty state - Teacher will upload official materials
export const INITIAL_HOMEWORK: HomeworkItem[] = [];

export const INITIAL_TIMETABLE: ScheduleDocument | null = null;

export const INITIAL_DATESHEET: ScheduleDocument | null = null;
