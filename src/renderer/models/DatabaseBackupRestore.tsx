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
          console.log(`Processing ${allItems.length} questions for export`);
          exportObject[storeName] = await Promise.all(
            allItems.map(async (item, index) => {
              console.log(
                `Processing question ${index + 1}/${allItems.length}`,
              );
              if (item.image && item.image instanceof Blob) {
                console.log(
                  `Converting image for question ${item.id || 'unknown'}`,
                );
                return {
                  ...item,
                  image: await blobToBase64(item.image),
                };
              } else if (item.image) {
                console.log(
                  `Image for question ${item.id || 'unknown'} is not a Blob:`,
                  typeof item.image,
                );
              } else {
                console.log(`No image for question ${item.id || 'unknown'}`);
              }
              return item;
            }),
          );
        } else {
          exportObject[storeName] = allItems;
        }
        console.log(`Exported ${allItems.length} items from ${storeName}`);
      }

      const jsonString = JSON.stringify(exportObject);
      console.log('Export object size:', jsonString.length, 'characters');
      console.log('Export object structure:', Object.keys(exportObject));
      console.log(
        'Question store item count:',
        exportObject[QUESTION_STORE_NAME]?.length,
      );

      const blob = new Blob([jsonString], { type: 'application/json' });
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
        console.log('Import file size:', content.length, 'characters');
        const importObject = JSON.parse(content);
        console.log('Import object structure:', Object.keys(importObject));
        console.log(
          'Question store item count:',
          importObject[QUESTION_STORE_NAME]?.length,
        );

        const db = await openDB<MyDBSchema>(DB_NAME, DB_VERSION);
        await replaceAllData(db, importObject);
        message.success('Database restored successfully');
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
            console.log(
              `Processing ${importObject[storeName].length} questions`,
            );
            for (const [index, item] of importObject[storeName].entries()) {
              try {
                console.log(
                  `Processing question ${index + 1}/${importObject[storeName].length}`,
                );
                if (
                  item.image &&
                  typeof item.image === 'string' &&
                  item.image.startsWith('data:')
                ) {
                  console.log(
                    `Converting image for question ${item.id || 'unknown'}`,
                  );
                  item.image = await base64ToBlob(item.image);
                } else if (item.image) {
                  console.log(
                    `Image for question ${item.id || 'unknown'} is not a valid base64 string:`,
                    typeof item.image,
                  );
                  item.image = null;
                }
                await store.add(item);
                console.log(`Added question ${item.id || 'unknown'}`);
              } catch (itemError) {
                console.error(
                  `Error processing question ${item.id || 'unknown'}:`,
                  itemError,
                );
                console.log(
                  'Problematic item:',
                  JSON.stringify(
                    { ...item, image: item.image ? 'BLOB_DATA' : null },
                    null,
                    2,
                  ),
                );
              }
            }
          } else {
            for (const item of importObject[storeName]) {
              await store.add(item);
            }
          }
        } else if (typeof importObject[storeName] === 'object') {
          for (const [key, value] of Object.entries(importObject[storeName])) {
            await store.put(value, key);
          }
        } else {
          console.warn(
            `Unexpected data type for store ${storeName}:`,
            typeof importObject[storeName],
          );
        }

        await tx.done;
        console.log(`Successfully processed store: ${storeName}`);
      } catch (error) {
        console.error(`Error processing store ${storeName}:`, error);
      }
    }
  };

  // Helper function to convert Blob to base64
  const blobToBase64 = (blob: Blob | string): Promise<string> => {
    if (typeof blob === 'string') {
      // If it's already a string, assume it's already in base64 format
      return Promise.resolve(blob);
    }
    if (!(blob instanceof Blob)) {
      console.warn('Expected Blob, got:', typeof blob);
      return Promise.resolve('');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = async (base64: string): Promise<Blob> => {
    // Check if the string is actually a base64 data URL
    if (!base64.startsWith('data:')) {
      console.warn(
        'Expected base64 data URL, got:',
        base64.slice(0, 20) + '...',
      );
      return new Blob(); // Return an empty Blob
    }
    try {
      const response = await fetch(base64);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error: any) {
      console.error('Error converting base64 to Blob:', error);
      throw new Error('Failed to convert base64 to Blob');
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
