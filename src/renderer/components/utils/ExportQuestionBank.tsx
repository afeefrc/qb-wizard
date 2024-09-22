import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button, message } from 'antd';

interface ColumnDataType {
  id: string;
  unitName: string;
  serialNumber: string;
  year?: string;
  questionText: string;
  answerText: string;
  trueAnswer: boolean;
  matchPairs: { item: string; match: string }[];
  marks: number;
  questionType: string;
  difficultyLevel: string;
  syllabusSectionId: string;
  answerList?: string[];
  correctOption?: string;
  mandatory?: boolean;
  isDeleted?: boolean;
  isLatestVersion?: boolean;
}

interface SyllabusSection {
  id: string;
  title?: string;
  sectionName: string;
  unitName: string;
  serialNumber: number;
}

interface ExportQuestionBankProps {
  questions: ColumnDataType[];
  syllabusSections: SyllabusSection[];
  unitName: string;
}

function ExportQuestionBank({
  questions,
  syllabusSections,
  unitName,
}: ExportQuestionBankProps) {
  // Helper function to truncate sheet names to a maximum of 31 characters
  const getValidSheetName = (name: string): string => {
    const maxLength = 31;
    if (name.length <= maxLength) return name;
    return `${name.slice(0, maxLength - 3)}...`;
  };

  const getPlainTextAnswer = (question: ColumnDataType): string => {
    switch (question.questionType) {
      case 'mcq':
        if (question.answerList && question.correctOption !== undefined) {
          const correctIndex = parseInt(question.correctOption, 10);
          return `${String.fromCharCode(65 + correctIndex)}. ${question.answerList[correctIndex] || 'N/A'}`;
        }
        return question.answerText || '';

      case 'trueFalse':
        return question.trueAnswer ? 'True' : `False, ${question.answerText}`;

      case 'matchTheFollowing':
        return (
          question.matchPairs
            ?.map((pair) => `${pair.item} => ${pair.match}`)
            .join(', ') || ''
        );

      case 'fillInTheBlanks':
        return question.answerList?.join(', ') || '';

      default:
        return question.answerText || '';
    }
  };

  const handleExportClick = () => {
    try {
      const workbook = XLSX.utils.book_new();

      syllabusSections.forEach((section) => {
        const sectionQuestions = questions.filter(
          (q) =>
            q.syllabusSectionId === section.id &&
            !q.isDeleted &&
            q.isLatestVersion,
        );

        if (sectionQuestions.length === 0) return;

        // Prepare data for the worksheet
        const worksheetData = sectionQuestions.map((q) => ({
          'Question ID': `${q.unitName}/${q.year || '00'}/${q.serialNumber.toString().padStart(3, '0')}`,
          'Question Text': q.questionText,
          'Answer Key': getPlainTextAnswer(q),
          Marks: q.marks,
          'Question Type': q.questionType,
          'Difficulty Level': q.difficultyLevel,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
          origin: 'A2',
        });

        // Set column widths
        worksheet['!cols'] = [
          { wch: 15 }, // Question ID
          { wch: 75 }, // Question Text
          { wch: 60 }, // Answer Text
          { wch: 10 }, // Marks
          { wch: 15 }, // Question Type
          { wch: 15 }, // Difficulty Level
        ];

        // Add title row
        const titleRow = [[section.title || section.sectionName]];
        XLSX.utils.sheet_add_aoa(worksheet, titleRow, { origin: 'A1' });

        // Merge cells for the title row
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        worksheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } },
        ];

        const sheetName = getValidSheetName(
          section.title || section.sectionName,
        );

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generate current date string
      const currentDate = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '.');

      // Generate buffer
      const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Save to file with date included in the filename
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `${unitName}_QuestionBank_${currentDate}.xlsx`);

      // Optional: Provide user feedback
      message.success('Question bank exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export question bank.');
    }
  };

  return (
    <Button
      type="primary"
      ghost
      onClick={handleExportClick}
      style={{ margin: '10px' }}
    >
      Export to Excel
    </Button>
  );
}

export default ExportQuestionBank;
