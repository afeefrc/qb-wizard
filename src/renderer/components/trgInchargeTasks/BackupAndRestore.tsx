import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import DatabaseBackupRestore from '../../models/DatabaseBackupRestore';
import BulkUploadQuestions from './BulkUploadQuestions';

function BackupAndRestore() {
  const appContext = useContext(AppContext);
  const { syllabusSections } = appContext || {};

  return (
    <div>
      <DatabaseBackupRestore />
      <BulkUploadQuestions />
    </div>
  );
}

export default BackupAndRestore;
