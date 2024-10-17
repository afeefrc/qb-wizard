interface Question {
  id: string;
  unitName: string;
  syllabusSectionId: string;
  questionType: string;
  marks: number;
  mandatory: boolean;
  linkedQuestion?: string[];
}

interface SyllabusSection {
  id: string;
  unitName: string;
  questionPart: number;
  serialNumber: number;
}

interface QuestionPaperBySections {
  'Part A': Record<string, SectionQuestions>;
  'Part B': Record<string, SectionQuestions>;
}

interface SectionQuestions {
  sectionInfo: SyllabusSection;
  questions: (SingleQuestion | GroupedQuestions)[];
}

interface SingleQuestion {
  type: 'single';
  question: Question;
}

interface GroupedQuestions {
  type: 'group';
  questionType: string;
  questions: Question[];
}

interface ArchivedQuestionPaper {
  content: Question[];
  syllabusSections: SyllabusSection[];
  questionPaperBySections: QuestionPaperBySections;
  addedQuestions: string[];
}

const generatePart = (
  partQuestions: Question[],
  targetMarks: number,
): Question[] => {
  // ... (keep the existing generatePart function as is) ...
};

const processQuestions = (
  part: 'Part A' | 'Part B',
  questions: Question[],
  sections: SyllabusSection[],
): Record<string, SectionQuestions> => {
  // ... (keep the existing processQuestions function as is) ...
};

const generateArchivedQuestionPaper = (
  questions: Question[],
  syllabusSections: SyllabusSection[],
  unit: string,
): ArchivedQuestionPaper => {
  const filteredQuestions = questions.filter((q) => q.unitName === unit);
  const filteredSyllabusSections = syllabusSections.filter(
    (s) => s.unitName === unit,
  );

  const partASections = filteredSyllabusSections.filter(
    (s) => s.questionPart === 1,
  );
  const partBSections = filteredSyllabusSections.filter(
    (s) => s.questionPart === 2,
  );

  const partAQuestions = filteredQuestions.filter((q) =>
    partASections.some((s) => s.id === q.syllabusSectionId),
  );
  const partBQuestions = filteredQuestions.filter((q) =>
    partBSections.some((s) => s.id === q.syllabusSectionId),
  );

  const partA = generatePart(partAQuestions, 100);
  const partB = generatePart(partBQuestions, 50);

  const questionPaperBySections: QuestionPaperBySections = {
    'Part A': processQuestions('Part A', partA, partASections),
    'Part B': processQuestions('Part B', partB, partBSections),
  };

  return {
    content: [...partA, ...partB],
    syllabusSections: filteredSyllabusSections,
    questionPaperBySections,
    addedQuestions: [],
  };
};

export default generateArchivedQuestionPaper;
