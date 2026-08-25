import { getAccessToken } from './googleAuth';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export const listDriveFiles = async (query = "mimeType='application/pdf'"): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.append('q', query);
  url.searchParams.append('fields', 'files(id, name, mimeType)');
  url.searchParams.append('pageSize', '20');
  
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Failed to fetch Drive files');
  
  const data = await response.json();
  return data.files || [];
};

export const downloadDriveFile = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Failed to download file from Drive');
  
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const sendEmailNotification = async (to: string, subject: string, bodyText: string) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(subject)}?=`,
    '',
    bodyText
  ];

  const emailStr = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(emailStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64EncodedEmail
    })
  });

  if (!response.ok) throw new Error('Failed to send email');
};
