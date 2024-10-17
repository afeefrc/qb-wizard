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
  minWeightage: number;
  maxWeightage: number;
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
  sections: SyllabusSection[],
): Question[] => {
  const partPaper: Question[] = [];
  let partTotalMarks = 0;

  const syllabusSectionIds = sections.map((s) => s.id);
  // Separate mandatory and non-mandatory questions
  const mandatoryQuestions = partQuestions.filter((q) => q.mandatory);
  const nonMandatoryQuestions = partQuestions.filter((q) => !q.mandatory);

  // Add all mandatory questions first
  partPaper.push(...mandatoryQuestions);
  partTotalMarks += mandatoryQuestions.reduce((sum, q) => sum + q.marks, 0);

  // Create a map for easy access to sections
  const sectionMap: Record<string, SyllabusSection> = sections.reduce(
    (acc, section) => {
      acc[section.id] = section;
      return acc;
    },
    {} as Record<string, SyllabusSection>,
  );

  // Group non-mandatory questions by syllabusSectionId
  const questionsBySection: Record<string, Question[]> =
    nonMandatoryQuestions.reduce(
      (acc, question) => {
        if (!acc[question.syllabusSectionId]) {
          acc[question.syllabusSectionId] = [];
        }
        acc[question.syllabusSectionId].push(question);
        return acc;
      },
      {} as Record<string, Question[]>,
    );

  // Function to check if a question is valid (no duplicates and linked questions not present)
  const isValidQuestion = (question: Question): boolean => {
    if (partPaper.some((q) => q.id === question.id)) return false;
    if (!question.linkedQuestion || question.linkedQuestion.length === 0)
      return true;
    return !question.linkedQuestion.some((id) =>
      partPaper.some((q) => q.id === id),
    );
  };

  // Step 1: Allocate one random valid question from each section to meet minWeightage
  syllabusSectionIds.forEach((sectionId) => {
    const section = sectionMap[sectionId];
    if (!section) {
      console.warn(`Section with ID ${sectionId} not found.`);
      return;
    }

    const sectionQuestions = questionsBySection[sectionId] || [];
    if (sectionQuestions.length === 0) {
      console.warn(`No questions available for section ID ${sectionId}.`);
      return;
    }

    // Shuffle the questions in the section
    const shuffledQuestions = sectionQuestions
      .filter((q) => isValidQuestion(q))
      .sort(() => Math.random() - 0.5);

    for (const question of shuffledQuestions) {
      // Calculate existing marks for the section
      const existingSectionMarks = partPaper
        .filter((q) => q.syllabusSectionId === sectionId)
        .reduce((sum, q) => sum + q.marks, 0);

      // Check if adding this question helps meet minWeightage
      if (existingSectionMarks < section.minWeightage) {
        partPaper.push(question);
        partTotalMarks += question.marks;
        break; // Move to the next section after adding one question
      }
    }
  });

  // Step 2: Continue adding questions section by section without exceeding maxWeightage or reaching targetMarks
  for (const sectionId of syllabusSectionIds) {
    if (partTotalMarks >= targetMarks) break;

    const section = sectionMap[sectionId];
    if (!section) continue;

    const sectionQuestions = questionsBySection[sectionId] || [];
    if (sectionQuestions.length === 0) continue;

    // Shuffle the questions in the section
    const shuffledQuestions = sectionQuestions
      .filter((q) => isValidQuestion(q))
      .sort(() => Math.random() - 0.5);

    for (const question of shuffledQuestions) {
      if (partTotalMarks >= targetMarks) break;

      const existingSectionMarks = partPaper
        .filter((q) => q.syllabusSectionId === sectionId)
        .reduce((sum, q) => sum + q.marks, 0);

      // Added partTotalMarks check
      if (
        existingSectionMarks + question.marks <= section.maxWeightage &&
        partTotalMarks + question.marks <= targetMarks
      ) {
        partPaper.push(question);
        partTotalMarks += question.marks;
      } else {
        // Skip adding questions to this section as it reached maxWeightage or targetMarks
        continue;
      }
    }
  }

  // Step 3: If targetMarks not achieved, add remaining questions randomly ignoring maxWeightage
  if (partTotalMarks < targetMarks) {
    const remainingMarks = targetMarks - partTotalMarks;
    // Combine all remaining valid questions
    const remainingQuestions = nonMandatoryQuestions.filter(
      (q) => isValidQuestion(q) && q.marks <= remainingMarks,
    );

    // Shuffle the remaining questions
    const shuffledRemaining = remainingQuestions.sort(
      () => Math.random() - 0.5,
    );

    for (const question of shuffledRemaining) {
      if (partTotalMarks >= targetMarks) break;

      partPaper.push(question);
      partTotalMarks += question.marks;
    }
  }

  return partPaper;
};

const processQuestions = (
  part: 'Part A' | 'Part B',
  questions: Question[],
  sections: SyllabusSection[],
): Record<string, SectionQuestions> => {
  const questionPaperBySections: Record<string, SectionQuestions> = {};

  // Sort sections by serialNumber
  const sortedSections = sections.sort(
    (a, b) => a.serialNumber - b.serialNumber,
  );

  sortedSections.forEach((section) => {
    const sectionId = section.id;
    const sectionQuestions = questions.filter(
      (q) => q.syllabusSectionId === sectionId,
    );

    if (sectionQuestions.length === 0) return;

    questionPaperBySections[sectionId] = {
      sectionInfo: section,
      questions: [],
    };

    // Group fillInTheBlanks questions
    const fillInTheBlanks = sectionQuestions.filter(
      (q) => q.questionType === 'fillInTheBlanks',
    );
    if (fillInTheBlanks.length > 0) {
      questionPaperBySections[sectionId].questions.push({
        type: 'group',
        questionType: 'fillInTheBlanks',
        questions: fillInTheBlanks,
      });
    }

    // Group trueFalse questions
    const trueFalse = sectionQuestions.filter(
      (q) => q.questionType === 'trueFalse',
    );
    if (trueFalse.length > 0) {
      questionPaperBySections[sectionId].questions.push({
        type: 'group',
        questionType: 'trueFalse',
        questions: trueFalse,
      });
    }

    // Process other question types
    sectionQuestions
      .filter(
        (q) =>
          q.questionType !== 'fillInTheBlanks' &&
          q.questionType !== 'trueFalse',
      )
      .forEach((question) => {
        questionPaperBySections[sectionId].questions.push({
          type: 'single',
          question,
        });
      });
  });

  return questionPaperBySections;
};

const generateArchivedQuestionPaper = (
  questions: Question[],
  syllabusSections: SyllabusSection[],
  unit: string,
): ArchivedQuestionPaper => {
  if (!Array.isArray(questions) || !Array.isArray(syllabusSections)) {
    console.error('Invalid input:', { questions, syllabusSections });
    return {
      content: [],
      syllabusSections: [],
      questionPaperBySections: { 'Part A': {}, 'Part B': {} },
      addedQuestions: [],
    };
  }

  const filteredQuestions = questions.filter((q) => q.unitName === unit);
  const filteredSyllabusSections = syllabusSections.filter(
    (s) => s.unitName === unit,
  );

  console.log(`Unit: ${unit}`);
  console.log(`Filtered Questions Count: ${filteredQuestions.length}`);
  console.log(
    `Filtered Syllabus Sections Count: ${filteredSyllabusSections.length}`,
  );

  const partASections = filteredSyllabusSections.filter(
    (s) => s.questionPart === 1,
  );
  const partBSections = filteredSyllabusSections.filter(
    (s) => s.questionPart === 2,
  );

  console.log(`Part A Sections Count: ${partASections.length}`);
  console.log(`Part B Sections Count: ${partBSections.length}`);

  const partAQuestions = filteredQuestions.filter((q) =>
    partASections.some((s) => s.id === q.syllabusSectionId),
  );
  const partBQuestions = filteredQuestions.filter((q) =>
    partBSections.some((s) => s.id === q.syllabusSectionId),
  );

  console.log(`Part A Questions Count: ${partAQuestions.length}`);
  console.log(`Part B Questions Count: ${partBQuestions.length}`);

  const partA = generatePart(partAQuestions, 100, partASections);
  const partB = generatePart(partBQuestions, 50, partBSections);

  console.log(`Generated Part A Questions Count: ${partA.length}`);
  console.log(`Generated Part B Questions Count: ${partB.length}`);

  const questionPaperBySections: QuestionPaperBySections = {
    'Part A':
      partA.length > 0 ? processQuestions('Part A', partA, partASections) : {},
    'Part B':
      partB.length > 0 ? processQuestions('Part B', partB, partBSections) : {},
  };

  console.log('Generated questionPaperBySections:', questionPaperBySections);

  return {
    content: [...partA, ...partB],
    syllabusSections: filteredSyllabusSections,
    questionPaperBySections,
    addedQuestions: [],
  };
};

export default generateArchivedQuestionPaper;
