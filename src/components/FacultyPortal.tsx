import React, { useState, useRef, useEffect } from 'react';
import { HomeworkItem, ScheduleDocument, AppConfig } from '../types';
import { STANDARD_SUBJECTS } from '../data/initialData';
import { KVSLogo } from './KVSLogo';
import {
  Lock,
  Unlock,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Image,
  Key,
  AlertCircle,
  Plus,
  Mail,
  Cloud
} from 'lucide-react';
import {
  apiVerifyTeacherPin,
  apiUpdateTeacherPin,
  apiAddHomework,
  apiDeleteHomework,
  apiUpdateTimetable,
  apiUpdateDatesheet,
  apiUpdateConfig
} from '../utils/storage';
import {
  initAuth,
  googleSignIn,
  logout
} from '../utils/googleAuth';
import {
  listDriveFiles,
  downloadDriveFile,
  sendEmailNotification,
  DriveFile
} from '../utils/googleWorkspace';
import { User } from 'firebase/auth';

interface FacultyPortalProps {
  appConfig: AppConfig;
  onUpdateAppConfig: (newConfig: AppConfig) => void;
  homeworkItems: HomeworkItem[];
  onAddHomework: (item: HomeworkItem) => void;
  onDeleteHomework: (id: string) => void;
  timetableDoc: ScheduleDocument | null;
  onUpdateTimetable: (doc: ScheduleDocument | null) => void;
  datesheetDoc: ScheduleDocument | null;
  onUpdateDatesheet: (doc: ScheduleDocument | null) => void;
  isAuthenticated: boolean;
  onAuthenticate: (status: boolean) => void;
}

export const FacultyPortal: React.FC<FacultyPortalProps> = ({
  appConfig,
  onUpdateAppConfig,
  homeworkItems,
  onAddHomework,
  onDeleteHomework,
  timetableDoc,
  onUpdateTimetable,
  datesheetDoc,
  onUpdateDatesheet,
  isAuthenticated,
  onAuthenticate
}) => {
  // Login State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Google Workspace State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [isFetchingDrive, setIsFetchingDrive] = useState(false);
  const [notifyStudents, setNotifyStudents] = useState(false);
  const [studentEmails, setStudentEmails] = useState('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    try {
      await googleSignIn();
    } catch (err) {
      console.error('Google login failed:', err);
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
  };

  const fetchDriveFiles = async () => {
    setIsFetchingDrive(true);
    try {
      const files = await listDriveFiles("mimeType='application/pdf'");
      setDriveFiles(files);
      setShowDrivePicker(true);
    } catch (err) {
      console.error('Error fetching drive files', err);
      alert('Failed to load Drive files. Please ensure you have signed in.');
    } finally {
      setIsFetchingDrive(false);
    }
  };

  const handleSelectDriveFile = async (file: DriveFile) => {
    setIsFetchingDrive(true);
    try {
      const dataUrl = await downloadDriveFile(file.id);
      setHwFile({
        name: file.name,
        size: 'Drive PDF',
        dataUrl
      });
      setShowDrivePicker(false);
    } catch (err) {
      console.error('Error downloading drive file', err);
      alert('Failed to load file from Drive.');
    } finally {
      setIsFetchingDrive(false);
    }
  };

  // Active faculty sub-tab
  const [adminTab, setAdminTab] = useState<'upload_hw' | 'upload_schedule' | 'branding' | 'security'>('upload_hw');

  // Homework Upload Form State
  const [selectedSubject, setSelectedSubject] = useState<string>(STANDARD_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDate, setHwDate] = useState(new Date().toISOString().split('T')[0]);
  const [hwFile, setHwFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');
  const [isPublishingHw, setIsPublishingHw] = useState(false);
  const hwFileInputRef = useRef<HTMLInputElement>(null);

  // Timetable upload state
  const [timetableFile, setTimetableFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [timetableTitle, setTimetableTitle] = useState(timetableDoc?.title || 'Class 11th Weekly Timetable (Shift 1)');
  const [timetableSuccess, setTimetableSuccess] = useState('');
  const timetableInputRef = useRef<HTMLInputElement>(null);

  // Datesheet upload state
  const [datesheetFile, setDatesheetFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [datesheetTitle, setDatesheetTitle] = useState(datesheetDoc?.title || 'Class 11th Examination Date Sheet');
  const [datesheetSuccess, setDatesheetSuccess] = useState('');
  const datesheetInputRef = useRef<HTMLInputElement>(null);

  // Logo & Branding state
  const [schoolName, setSchoolName] = useState(appConfig.institutionName);
  const [classInfo, setClassInfo] = useState(appConfig.classInfo);
  const [shiftInfo, setShiftInfo] = useState(appConfig.shiftInfo);
  const [brandingSuccess, setBrandingSuccess] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Change PIN State
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');

  // Handle Login Submit with Server Check
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const isValid = await apiVerifyTeacherPin(pinInput);
    setIsVerifying(false);
    if (isValid) {
      onAuthenticate(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // File Upload Helper (converts file to base64 Data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: { name: string; size: string; dataUrl: string } | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter({
          name: file.name,
          size: sizeStr,
          dataUrl: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Homework PDF to Server
  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = selectedSubject === 'OTHER' ? customSubject.trim() : selectedSubject;
    if (!finalSubject) return;

    setIsPublishingHw(true);
    const newItem: HomeworkItem = {
      id: `hw-${Date.now()}`,
      subjectName: finalSubject,
      title: hwTitle.trim() || hwFile?.name || `${finalSubject} Homework Worksheet`,
      fileName: hwFile?.name || `${finalSubject}_Homework_${hwDate}.pdf`,
      fileData: hwFile?.dataUrl,
      fileSize: hwFile?.size || '1.2 MB',
      fileType: 'pdf',
      date: hwDate,
      createdAt: Date.now()
    };

    onAddHomework(newItem);
    await apiAddHomework(newItem);
    setIsPublishingHw(false);

    setHwSuccessMsg(`Published ${finalSubject} homework PDF! It is now live for all students.`);
    
    // Send email notification if checked
    if (notifyStudents && studentEmails.trim() && googleUser) {
      const emails = studentEmails.split(',').map(e => e.trim()).filter(e => e);
      for (const email of emails) {
        try {
          await sendEmailNotification(
            email,
            `New Homework: ${finalSubject} - ${hwDate}`,
            `Hello,\n\nA new homework PDF "${newItem.title}" has been uploaded for ${finalSubject} on ${hwDate}.\nPlease check the portal to view and download it.\n\nRegards,\n${appConfig.institutionName}`
          );
        } catch (err) {
          console.error(`Failed to send email to ${email}`, err);
        }
      }
      setHwSuccessMsg(`Published ${finalSubject} homework PDF and sent email notifications!`);
    }

    setHwFile(null);
    setHwTitle('');
    if (hwFileInputRef.current) hwFileInputRef.current.value = '';
    setTimeout(() => setHwSuccessMsg(''), 5000);
  };

  // Delete Homework from Server
  const handleDeleteHomeworkItem = async (id: string) => {
    onDeleteHomework(id);
    await apiDeleteHomework(id);
  };

  // Submit Timetable to Server
  const handleTimetableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ScheduleDocument = {
      id: timetableDoc?.id || `doc-timetable-${Date.now()}`,
      category: 'timetable',
      title: timetableTitle.trim() || 'Class 11th Weekly Timetable',
      fileName: timetableFile?.name || timetableDoc?.fileName || 'Class11_Timetable.pdf',
      fileData: timetableFile?.dataUrl || timetableDoc?.fileData,
      fileSize: timetableFile?.size || timetableDoc?.fileSize || '1.5 MB',
      fileType: 'pdf',
      dateUploaded: new Date().toISOString().split('T')[0]
    };
    onUpdateTimetable(updated);
    await apiUpdateTimetable(updated);
    setTimetableSuccess('Class Timetable uploaded & published to all students!');
    setTimetableFile(null);
    setTimeout(() => setTimetableSuccess(''), 5000);
  };

  // Remove Timetable
  const handleRemoveTimetable = async () => {
    onUpdateTimetable(null);
    await apiUpdateTimetable(null);
    setTimetableSuccess('Timetable removed.');
    setTimeout(() => setTimetableSuccess(''), 4000);
  };

  // Submit Datesheet to Server
  const handleDatesheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ScheduleDocument = {
      id: datesheetDoc?.id || `doc-datesheet-${Date.now()}`,
      category: 'datesheet',
      title: datesheetTitle.trim() || 'Class 11th Examination Date Sheet',
      fileName: datesheetFile?.name || datesheetDoc?.fileName || 'Class11_Exam_DateSheet.pdf',
      fileData: datesheetFile?.dataUrl || datesheetDoc?.fileData,
      fileSize: datesheetFile?.size || datesheetDoc?.fileSize || '1.5 MB',
      fileType: 'pdf',
      dateUploaded: new Date().toISOString().split('T')[0]
    };
    onUpdateDatesheet(updated);
    await apiUpdateDatesheet(updated);
    setDatesheetSuccess('Examination Date Sheet uploaded & published to all students!');
    setDatesheetFile(null);
    setTimeout(() => setDatesheetSuccess(''), 5000);
  };

  // Remove Datesheet
  const handleRemoveDatesheet = async () => {
    onUpdateDatesheet(null);
    await apiUpdateDatesheet(null);
    setDatesheetSuccess('Date sheet removed.');
    setTimeout(() => setDatesheetSuccess(''), 4000);
  };

  // Submit Logo Image Upload to Server
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const updated = { ...appConfig, customLogoUrl: reader.result };
        onUpdateAppConfig(updated);
        await apiUpdateConfig(updated);
        setBrandingSuccess('Custom school logo uploaded and saved to server!');
        setTimeout(() => setBrandingSuccess(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to default logo
  const handleResetLogo = async () => {
    const updated = { ...appConfig, customLogoUrl: '' };
    onUpdateAppConfig(updated);
    await apiUpdateConfig(updated);
    setBrandingSuccess('Reset to official KVS emblem.');
    setTimeout(() => setBrandingSuccess(''), 4000);
  };

  // Save Institution Info to Server
  const handleSaveInstitutionInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...appConfig,
      institutionName: schoolName.trim(),
      classInfo: classInfo.trim(),
      shiftInfo: shiftInfo.trim()
    };
    onUpdateAppConfig(updated);
    await apiUpdateConfig(updated);
    setBrandingSuccess('School details saved to server for all students!');
    setTimeout(() => setBrandingSuccess(''), 4000);
  };

  // Change PIN Submit
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setPinChangeError('PIN must be at least 4 characters');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeError('PINs do not match');
      return;
    }
    const success = await apiUpdateTeacherPin(newPin);
    if (success) {
      setPinChangeSuccess('Teacher passcode updated successfully on the server!');
      setPinChangeError('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinChangeSuccess(''), 4000);
    } else {
      setPinChangeError('Could not update PIN on server. Please try again.');
    }
  };

  // LOCKED SCREEN (Teacher PIN Login - No PIN displayed)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-md p-6 sm:p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-2 bg-gradient-to-b from-[#fbfdf9] to-[#f3f6ec] rounded-2xl border border-[#d8decb] shadow-xs">
              <KVSLogo size={70} appConfig={appConfig} />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef0e7] text-[#2d3a16] text-[11px] font-black uppercase tracking-wider border border-[#4a5d23]/30">
              <Lock className="w-3 h-3 text-[#4a5d23]" />
              <span>FACULTY ONLY</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#2d3a16] mt-2">
              Teacher Access Portal
            </h2>
            <p className="text-xs text-[#7a7467] mt-1 max-w-xs mx-auto">
              Please enter your authorized faculty passcode to upload homework PDFs, timetable, and manage school materials.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter Faculty PIN"
                maxLength={8}
                autoFocus
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-2xl bg-[#fcfbf9] border-2 border-[#e0ded8] focus:border-[#4a5d23] focus:ring-2 focus:ring-[#4a5d23]/20 outline-none text-[#2d3a16]"
              />
            </div>

            {pinError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Incorrect passcode. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!pinInput.trim() || isVerifying}
              className="w-full py-3 bg-[#4a5d23] hover:bg-[#3d4e1c] disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Unlock Faculty Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED TEACHER DASHBOARD
  return (
    <div className="space-y-5">
      {/* Top Faculty Header Bar */}
      <div className="bg-[#2d3a16] text-[#fdfcf9] p-4 sm:p-5 rounded-3xl shadow-sm flex items-center justify-between gap-3 flex-wrap border border-[#3f4f1e]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <KVSLogo size={36} appConfig={appConfig} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#eef0e7] bg-[#4a5d23] px-2 py-0.5 rounded border border-[#5d7330]">
                Faculty Control Panel
              </span>
              <span className="text-xs text-[#d8decb] font-medium">{appConfig.classInfo} ({appConfig.shiftInfo})</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold mt-0.5 text-white">
              {appConfig.institutionName}
            </h2>
          </div>
        </div>

        <button
          onClick={() => onAuthenticate(false)}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock & Exit</span>
        </button>
      </div>

      {/* Faculty Sub-Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setAdminTab('upload_hw')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              adminTab === 'upload_hw'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-white text-[#6d6657] hover:bg-[#f8f6f0] border border-[#e5e1da]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Homework PDF</span>
          </button>

          <button
            onClick={() => setAdminTab('upload_schedule')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              adminTab === 'upload_schedule'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-white text-[#6d6657] hover:bg-[#f8f6f0] border border-[#e5e1da]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timetable & Date Sheet</span>
          </button>

          <button
            onClick={() => setAdminTab('branding')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              adminTab === 'branding'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-white text-[#6d6657] hover:bg-[#f8f6f0] border border-[#e5e1da]'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Upload Logo & School Info</span>
          </button>

          <button
            onClick={() => setAdminTab('security')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              adminTab === 'security'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-white text-[#6d6657] hover:bg-[#f8f6f0] border border-[#e5e1da]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Change PIN</span>
          </button>
        </div>
        
        {/* Google Workspace Integration Status */}
        <div className="flex items-center gap-2">
          {googleUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f6f0] border border-[#e5e1da] rounded-xl">
              <img src={googleUser.photoURL || ''} alt="User" className="w-5 h-5 rounded-full" />
              <span className="text-[11px] font-bold text-[#2d3a16] hidden sm:inline">{googleUser.email}</span>
              <button onClick={handleGoogleLogout} className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer ml-1">Disconnect</button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoggingIn}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-[#e5e1da] text-[#2d3a16] text-[11px] font-bold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{isGoogleLoggingIn ? 'Connecting...' : 'Connect Workspace'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. UPLOAD HOMEWORK PDF TAB */}
      {adminTab === 'upload_hw' && (
        <div className="space-y-5">
          <div className="bg-white border border-[#e5e1da] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#2d3a16] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#4a5d23]" />
                <span>Upload Daily Homework PDF</span>
              </h3>
              <p className="text-xs text-[#7a7467] mt-0.5">
                Attach the real PDF file. Once uploaded, it is automatically synchronized to all student devices across the school community.
              </p>
            </div>

            {hwSuccessMsg && (
              <div className="p-3 bg-[#eef0e7] border border-[#4a5d23]/30 rounded-2xl text-[#2d3a16] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4a5d23]" />
                <span>{hwSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleHomeworkSubmit} className="space-y-4">
              {/* Subject & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                    Subject *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] focus:border-[#4a5d23] outline-none text-[#2d3a16] font-semibold"
                  >
                    {STANDARD_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="OTHER">+ Other Custom Subject</option>
                  </select>
                </div>

                {selectedSubject === 'OTHER' && (
                  <div>
                    <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                      Custom Subject Name *
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="e.g. Physical Education"
                      className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] focus:border-[#4a5d23] outline-none text-[#2d3a16]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={hwDate}
                    onChange={(e) => setHwDate(e.target.value)}
                    className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] focus:border-[#4a5d23] outline-none text-[#2d3a16] font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Title / Topic */}
              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Topic / Worksheet Title (Optional)
                </label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Motion in a Plane Numericals"
                  className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] focus:border-[#4a5d23] outline-none text-[#2d3a16]"
                />
              </div>

              {/* Real PDF File Upload Picker */}
              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Select Real PDF / Document File *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-[#d8decb] hover:border-[#4a5d23] rounded-2xl p-4 text-center bg-[#fcfbf9] transition-colors h-full flex flex-col justify-center">
                    <input
                      ref={hwFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, setHwFile)}
                      className="hidden"
                      id="hw-pdf-upload"
                    />
                    <label htmlFor="hw-pdf-upload" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center mx-auto shadow-2xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2d3a16]">Upload from Device</p>
                        <p className="text-[10px] text-[#8c8577]">Supports PDF, DOC, Images</p>
                      </div>
                    </label>
                  </div>
                  
                  <div 
                    onClick={googleUser ? fetchDriveFiles : handleGoogleLogin}
                    className="border-2 border-dashed border-[#d8decb] hover:border-[#4a5d23] rounded-2xl p-4 text-center bg-[#fcfbf9] transition-colors cursor-pointer h-full flex flex-col justify-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs mb-2">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2d3a16]">
                        {isFetchingDrive ? 'Fetching...' : 'Pick from Google Drive'}
                      </p>
                      <p className="text-[10px] text-[#8c8577]">
                        {googleUser ? 'Select PDF from Drive' : 'Requires Google Sign-in'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drive File Picker Modal */}
                {showDrivePicker && (
                  <div className="mt-3 p-3 bg-white border border-[#e5e1da] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#2d3a16]">Select a PDF from Drive</span>
                      <button onClick={() => setShowDrivePicker(false)} type="button" className="text-[10px] text-gray-500 hover:text-gray-800">Close</button>
                    </div>
                    {driveFiles.length === 0 ? (
                      <p className="text-[11px] text-gray-500">No PDF files found in Drive.</p>
                    ) : (
                      <ul className="space-y-1">
                        {driveFiles.map(file => (
                          <li key={file.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectDriveFile(file)}
                              className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-[#eef0e7] rounded flex items-center gap-2 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-red-500" />
                              <span className="truncate">{file.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {hwFile && (
                  <div className="mt-3 p-3 bg-[#f8f6f0] border border-[#e5e1da] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2d3a16] truncate max-w-[200px] sm:max-w-xs">{hwFile.name}</p>
                      <p className="text-[10px] text-[#4a5d23] font-semibold">Ready to upload • {hwFile.size}</p>
                    </div>
                    <button type="button" onClick={() => setHwFile(null)} className="text-xs text-red-600 font-bold px-2 py-1 hover:bg-red-50 rounded">Remove</button>
                  </div>
                )}
              </div>

              {/* Email Notification Option */}
              {googleUser && (
                <div className="p-4 bg-[#fcfbf9] border border-[#e5e1da] rounded-2xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifyStudents}
                      onChange={(e) => setNotifyStudents(e.target.checked)}
                      className="w-4 h-4 text-[#4a5d23] rounded border-gray-300 focus:ring-[#4a5d23]"
                    />
                    <span className="text-xs font-bold text-[#2d3a16] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#4a5d23]" />
                      Send Email Notification to Students
                    </span>
                  </label>
                  {notifyStudents && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#7a7467] mb-1">
                        Student Email Addresses (comma separated)
                      </label>
                      <input
                        type="text"
                        value={studentEmails}
                        onChange={(e) => setStudentEmails(e.target.value)}
                        placeholder="e.g. student1@gmail.com, student2@gmail.com"
                        className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#e0ded8] focus:border-[#4a5d23] outline-none text-[#2d3a16]"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isPublishingHw}
                className="w-full py-3 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isPublishingHw ? 'Publishing to Community...' : 'Publish Homework PDF to All Students'}</span>
              </button>
            </form>
          </div>

          {/* Manage Existing Uploads */}
          <div className="bg-white border border-[#e5e1da] rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-extrabold text-[#2d3a16]">
              Currently Published Homework ({homeworkItems.length})
            </h4>
            {homeworkItems.length > 0 ? (
              <div className="divide-y divide-[#f0eee8] max-h-96 overflow-y-auto">
                {homeworkItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#eef0e7] text-[#2d3a16]">
                          {item.subjectName}
                        </span>
                        <span className="text-[11px] text-[#8c8577]">{item.date}</span>
                      </div>
                      <p className="text-xs font-bold text-[#2d3a16] truncate mt-0.5">{item.title}</p>
                      <p className="text-[10px] text-[#8c8577] truncate font-mono">📄 {item.fileName} ({item.fileSize})</p>
                    </div>
                    <button
                      onClick={() => handleDeleteHomeworkItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete homework"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8c8577] py-2">No homework uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. TIMETABLE & DATE SHEET UPLOAD TAB */}
      {adminTab === 'upload_schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Update Timetable Box */}
          <div className="bg-white border border-[#e5e1da] rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2d3a16] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#4a5d23]" />
                <span>Upload Class Timetable</span>
              </h3>
              <p className="text-xs text-[#7a7467] mt-0.5">
                Upload the official timetable PDF or image for Class 11th.
              </p>
            </div>

            {timetableSuccess && (
              <div className="p-2.5 bg-[#eef0e7] border border-[#4a5d23]/30 rounded-xl text-[#2d3a16] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4a5d23]" />
                <span>{timetableSuccess}</span>
              </div>
            )}

            {timetableDoc && (
              <div className="p-3 bg-[#f8f6f0] rounded-xl border border-[#e5e1da] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2d3a16] truncate">{timetableDoc.title}</p>
                  <p className="text-[10px] text-[#8c8577] font-mono truncate">📄 {timetableDoc.fileName} • {timetableDoc.dateUploaded}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveTimetable}
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-white rounded-lg border border-red-200 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <form onSubmit={handleTimetableSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Timetable Title
                </label>
                <input
                  type="text"
                  value={timetableTitle}
                  onChange={(e) => setTimetableTitle(e.target.value)}
                  placeholder="e.g. Class 11th Weekly Timetable"
                  className="w-full text-xs py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Choose Timetable PDF / Image *
                </label>
                <input
                  ref={timetableInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileUpload(e, setTimetableFile)}
                  className="w-full text-xs py-1.5 px-2 rounded-xl bg-[#fcfbf9] border border-[#e0ded8]"
                />
                {timetableFile && (
                  <p className="text-[11px] text-[#4a5d23] font-bold mt-1">
                    Selected: {timetableFile.name} ({timetableFile.size})
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Save & Publish Timetable
              </button>
            </form>
          </div>

          {/* Update Date Sheet Box */}
          <div className="bg-white border border-[#e5e1da] rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2d3a16] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#87582c]" />
                <span>Upload Exam Date Sheet</span>
              </h3>
              <p className="text-xs text-[#7a7467] mt-0.5">
                Upload the official examination date sheet PDF for Class 11th.
              </p>
            </div>

            {datesheetSuccess && (
              <div className="p-2.5 bg-[#f8f1ea] border border-[#87582c]/30 rounded-xl text-[#2d3a16] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#87582c]" />
                <span>{datesheetSuccess}</span>
              </div>
            )}

            {datesheetDoc && (
              <div className="p-3 bg-[#f8f6f0] rounded-xl border border-[#e5e1da] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2d3a16] truncate">{datesheetDoc.title}</p>
                  <p className="text-[10px] text-[#8c8577] font-mono truncate">📄 {datesheetDoc.fileName} • {datesheetDoc.dateUploaded}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDatesheet}
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-white rounded-lg border border-red-200 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <form onSubmit={handleDatesheetSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Date Sheet Title
                </label>
                <input
                  type="text"
                  value={datesheetTitle}
                  onChange={(e) => setDatesheetTitle(e.target.value)}
                  placeholder="e.g. Class 11th Examination Date Sheet"
                  className="w-full text-xs py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Choose Date Sheet PDF *
                </label>
                <input
                  ref={datesheetInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileUpload(e, setDatesheetFile)}
                  className="w-full text-xs py-1.5 px-2 rounded-xl bg-[#fcfbf9] border border-[#e0ded8]"
                />
                {datesheetFile && (
                  <p className="text-[11px] text-[#87582c] font-bold mt-1">
                    Selected: {datesheetFile.name} ({datesheetFile.size})
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#87582c] hover:bg-[#6e4620] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Save & Publish Date Sheet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. LOGO & SCHOOL BRANDING TAB */}
      {adminTab === 'branding' && (
        <div className="bg-white border border-[#e5e1da] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#2d3a16] flex items-center gap-2">
              <Image className="w-5 h-5 text-[#4a5d23]" />
              <span>Upload Custom School Logo & Info</span>
            </h3>
            <p className="text-xs text-[#7a7467] mt-0.5">
              Upload your own school logo image anytime or edit the school name and shift details. It syncs to all users.
            </p>
          </div>

          {brandingSuccess && (
            <div className="p-3 bg-[#eef0e7] border border-[#4a5d23]/30 rounded-2xl text-[#2d3a16] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4a5d23]" />
              <span>{brandingSuccess}</span>
            </div>
          )}

          {/* Logo Upload Section */}
          <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-[#e5e1da] flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 text-center space-y-1">
              <KVSLogo size={72} appConfig={appConfig} />
              <p className="text-[10px] text-[#8c8577] font-semibold">Current Logo</p>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-[#2d3a16]">Upload New School Logo Image</h4>
              <p className="text-[11px] text-[#8c8577]">
                Upload PNG or JPG image. It will update the logo in the header and login screen across all community users.
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="custom-logo-file"
                />
                <label
                  htmlFor="custom-logo-file"
                  className="px-3 py-1.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Choose Image File
                </label>
                {appConfig.customLogoUrl && (
                  <button
                    onClick={handleResetLogo}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-red-600 border border-gray-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Reset to Default KVS Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* School Name & Class Details */}
          <form onSubmit={handleSaveInstitutionInfo} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                Institution / School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16] font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Class Info
                </label>
                <input
                  type="text"
                  value={classInfo}
                  onChange={(e) => setClassInfo(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                  Shift Info
                </label>
                <input
                  type="text"
                  value={shiftInfo}
                  onChange={(e) => setShiftInfo(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#2d3a16] hover:bg-[#1f280f] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              Save School Info to Server
            </button>
          </form>
        </div>
      )}

      {/* 4. CHANGE PIN TAB */}
      {adminTab === 'security' && (
        <div className="max-w-md bg-white border border-[#e5e1da] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#2d3a16] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#4a5d23]" />
              <span>Change Faculty Passcode (PIN)</span>
            </h3>
            <p className="text-xs text-[#7a7467] mt-0.5">
              Set a private PIN to protect teacher controls. Stored securely on the server.
            </p>
          </div>

          {pinChangeSuccess && (
            <div className="p-3 bg-[#eef0e7] border border-[#4a5d23]/30 rounded-2xl text-[#2d3a16] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4a5d23]" />
              <span>{pinChangeSuccess}</span>
            </div>
          )}

          {pinChangeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{pinChangeError}</span>
            </div>
          )}

          <form onSubmit={handleChangePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                New Faculty Passcode
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4-8 digit PIN"
                className="w-full text-sm py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3a16] mb-1">
                Confirm New Passcode
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter new PIN"
                className="w-full text-sm py-2 px-3 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] text-[#2d3a16]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              Update Faculty PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
