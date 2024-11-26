import React, { useState } from 'react';
import { Button, Upload, message, Space } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  DB_NAME,
  DB_VERSION,
  QUESTION_STORE_NAME,
  PENDING_CHANGES_STORE_NAME,
  SETTINGS_STORE_NAME,
  EXAMINER_STORE_NAME,
  REVIEW_PANEL_STORE,
  EXAMINER_ASSIGNMENT_STORE,
  SYLLABUS_SECTIONS_STORE,
  LINKED_QUESTIONS_STORE,
  USER_ACTIVITY_LOG_STORE,
  FEEDBACK_STORE,
} from './initDB';

interface MyDBSchema extends DBSchema {
  // Define your store types here
  [QUESTION_STORE_NAME]: { key: string; value: any };
  [PENDING_CHANGES_STORE_NAME]: { key: string; value: any };
  [SETTINGS_STORE_NAME]: { key: string; value: any };
  [EXAMINER_STORE_NAME]: { key: string; value: any };
  [REVIEW_PANEL_STORE]: { key: string; value: any };
  [EXAMINER_ASSIGNMENT_STORE]: { key: string; value: any };
  [SYLLABUS_SECTIONS_STORE]: { key: string; value: any };
  [LINKED_QUESTIONS_STORE]: { key: string; value: any };
  [USER_ACTIVITY_LOG_STORE]: { key: string; value: any };
  [FEEDBACK_STORE]: { key: string; value: any };
}

function DatabaseBackupRestore() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportDatabase = async () => {
    setIsExporting(true);
    try {
      const db = await openDB<MyDBSchema>(DB_NAME, DB_VERSION);
      const exportObject: { [key: string]: any } = {};

      for (const storeName of db.objectStoreNames) {
        const allItems = await db.getAll(storeName);
        if (storeName === QUESTION_STORE_NAME) {
          exportObject[storeName] = await Promise.all(
            allItems.map(async (item) => {
              if (item.image instanceof Blob) {
                // Convert Blob to base64 string with proper data URL format
                const base64 = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(item.image);
                });
                return { ...item, image: base64 };
              }
              return item;
            }),
          );
        } else {
          exportObject[storeName] = allItems;
        }
      }

      const blob = new Blob([JSON.stringify(exportObject)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${DB_NAME}_backup_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Database exported successfully');
    } catch (error) {
      console.error('Error exporting database:', error);
      message.error('Failed to export database');
    } finally {
      setIsExporting(false);
    }
  };

  const importDatabase = async (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importObject = JSON.parse(content);

        const db = await openDB<MyDBSchema>(DB_NAME, DB_VERSION);
        await replaceAllData(db, importObject);
        message.success(
          'Database restored successfully. Application will restart.',
        );

        // Add a small delay before relaunch to ensure the message is shown
        setTimeout(async () => {
          await window.electron.app.relaunch();
        }, 1500);
      } catch (error) {
        console.error('Error during database restore:', error);
        if (error instanceof Error) {
          message.error(`Failed to restore database: ${error.message}`);
        } else {
          message.error('Failed to restore database: Unknown error');
        }
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      message.error('Failed to read backup file');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const replaceAllData = async (
    db: IDBPDatabase<MyDBSchema>,
    importObject: any,
  ) => {
    for (const storeName of db.objectStoreNames) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      try {
        await store.clear();

        if (Array.isArray(importObject[storeName])) {
          if (storeName === QUESTION_STORE_NAME) {
            for (const item of importObject[storeName]) {
              try {
                if (
                  item.image &&
                  typeof item.image === 'string' &&
                  item.image.startsWith('data:')
                ) {
                  // Convert base64 string directly to Blob
                  const base64Response = item.image.split(',')[1]; // Remove the data:image/png;base64, prefix
                  const byteCharacters = atob(base64Response);
                  const byteNumbers = new Array(byteCharacters.length);

                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }

                  const byteArray = new Uint8Array(byteNumbers);
                  const imageBlob = new Blob([byteArray], {
                    type: 'image/png',
                  });

                  await store.add({ ...item, image: imageBlob });
                } else {
                  await store.add(item);
                }
              } catch (itemError) {
                console.error(`Error processing item:`, itemError);
                console.error('Item that caused error:', {
                  ...item,
                  image: item.image
                    ? `${item.image.substring(0, 100)}...`
                    : null,
                });
              }
            }
          } else {
            await Promise.all(
              importObject[storeName].map((item: any) => store.add(item)),
            );
          }
        }
        await tx.done;
      } catch (error) {
        console.error(`Error processing store ${storeName}:`, error);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <div style={{ height: 300 }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={exportDatabase}
          loading={isExporting}
          style={{ margin: '25px', padding: '25px' }}
        >
          Backup Database
        </Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={(file) => {
            importDatabase(file);
            return false;
          }}
        >
          <Button
            icon={<UploadOutlined />}
            loading={isImporting}
            style={{ margin: '25px', padding: '25px' }}
          >
            Restore Database
          </Button>
        </Upload>
      </div>
    </div>
  );
}

export default DatabaseBackupRestore;
