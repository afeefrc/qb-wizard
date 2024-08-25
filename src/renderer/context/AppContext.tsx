import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
  // getSetting,
  getAllSettings,
  getAllReviewPanels,
  saveSetting,
  addExaminer,
  getExaminer,
  getAllExaminers,
  deleteExaminer,
  updateExaminer,
  addReviewPanel,
  deleteReviewPanel,
  updateReviewPanel,
  addExaminerAssignment,
  deleteExaminerAssignment,
  updateExaminerAssignment,
  getAllExaminerAssignments,
  addSyllabusSection,
  getSyllabusSection,
  getAllSyllabusSections,
  deleteSyllabusSection,
  updateSyllabusSection,
} from '../../models';

interface AppContextProps {
  questions: any[];
  settings: any;
  examiners: any[];
  handleAddQuestion: (newQuestion: any) => Promise<void>;
  handleDeleteQuestion: (id: number) => Promise<void>;
  handleSaveSetting: (newSettings: any) => Promise<void>;
  handleAddExaminer: (newExaminer: any) => Promise<void>;
  handleDeleteExaminer: (id: number) => Promise<void>;
  handleUpdateExaminer: (id: number, updatedExaminer: any) => Promise<void>;
  handleAddReviewPanel: (newReviewPanel: any) => Promise<void>;
  handleDeleteReviewPanel: (id: number) => Promise<void>;
  handleUpdateReviewPanel: (
    id: number,
    updatedReviewPanel: any,
  ) => Promise<void>;
  handleAddExaminerAssignment: (newExaminerAssignment: any) => Promise<void>;
  handleAddSyllabusSection: (newSyllabusSection: any) => Promise<void>;
  syllabusSections: any[];
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [reviewPanels, setReviewPanels] = useState<any[]>([]);
  const [examinerAssignments, setExaminerAssignments] = useState<any[]>([]);
  const [syllabusSections, setSyllabusSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const allQuestions = await getQuestions();
      setQuestions(allQuestions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const appSettings = await getAllSettings();
        setSettings(appSettings);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const fetchExaminers = async () => {
    try {
      const allExaminers = await getAllExaminers();
      setExaminers(allExaminers);
    } catch (error) {
      console.error('Failed to fetch examiners', error);
    }
  };
  useEffect(() => {
    fetchExaminers();
  }, []);

  useEffect(() => {
    const fetchReviewPanels = async () => {
      try {
        const allReviewPanels = await getAllReviewPanels();
        setReviewPanels(allReviewPanels);
      } catch (error) {
        console.error('Failed to fetch review panels', error);
        setReviewPanels([]); // Set an empty array when there are no items in the database
      }
    };
    fetchReviewPanels();
  }, []);

  useEffect(() => {
    const fetchExaminerAssignments = async () => {
      try {
        const allExaminerAssignments = await getAllExaminerAssignments();
        setExaminerAssignments(allExaminerAssignments);
      } catch (error) {
        console.error('Failed to fetch examiner assignments', error);
        setExaminerAssignments([]); // Set an empty array when there are no items in the database
      }
    };
    fetchExaminerAssignments();
  }, []);

  useEffect(() => {
    const fetchSyllabusSections = async () => {
      const allSyllabusSections = await getAllSyllabusSections();
      setSyllabusSections(allSyllabusSections);
    };
    fetchSyllabusSections();
  }, []);

  // const handleAddExaminer = async (newExaminers) => {
  //   // Assuming you have a function to add examiners to the backend
  //   await addExaminer(newExaminers);
  //   fetchExaminers(); // Fetch the updated list of examiners
  // };

  const handleAddExaminer = useCallback(
    async (newExaminer: any) => {
      try {
        const result = await addExaminer(newExaminer);
        if (
          result ===
          'Examiner with the same employee Id already exists. Edit or delete the existing examiner.'
        ) {
          console.error(result);
          return result;
        }
        const allExaminers = await getAllExaminers();
        setExaminers(allExaminers);
      } catch (error) {
        console.error('Failed to add examiner:', error);
      }
    },
    [setExaminers],
  );

  const handleDeleteExaminer = async (id: number) => {
    await deleteExaminer(id);
    fetchExaminers();
  };

  const handleUpdateExaminer = async (id: number, updatedExaminer: any) => {
    await updateExaminer(id, updatedExaminer);
    fetchExaminers();
  };

  const handleAddQuestion = async (newQuestion: any) => {
    await addQuestion(newQuestion);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const handleDeleteQuestion = async (id: number) => {
    await deleteQuestion(id);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const handleSaveSetting = async (newSettings: any) => {
    // console.log({
    //   stationName: { code: 'VOBL', name: 'KIA Bengaluru', city: 'bengaluru' },
    //   unitsApplicable: ['ADC', 'ACC'],
    // });
    await saveSetting(newSettings);
    const appSettings = await getAllSettings();
    setSettings(appSettings);
  };

  const handleAddReviewPanel = async (newReviewPanel: any) => {
    await addReviewPanel(newReviewPanel);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  };

  const handleDeleteReviewPanel = async (id: number) => {
    await deleteReviewPanel(id);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  };

  const handleUpdateReviewPanel = async (
    id: number,
    updatedReviewPanel: any,
  ) => {
    await updateReviewPanel(id, updatedReviewPanel);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  };

  // Examiner assignments
  const handleAddExaminerAssignment = async (newExaminerAssignment: any) => {
    await addExaminerAssignment(newExaminerAssignment);
    const allExaminerAssignments = await getAllExaminerAssignments();
    setExaminerAssignments(allExaminerAssignments);
  };

  const handleDeleteExaminerAssignment = async (id: number) => {
    await deleteExaminerAssignment(id);
    const allExaminerAssignments = await getAllExaminerAssignments();
    setExaminerAssignments(allExaminerAssignments);
  };

  const handleUpdateExaminerAssignment = async (
    id: number,
    updatedExaminerAssignment: any,
  ) => {
    await updateExaminerAssignment(id, updatedExaminerAssignment);
    const allExaminerAssignments = await getAllExaminerAssignments();
    setExaminerAssignments(allExaminerAssignments);
  };

  // Syllabus sections
  const handleAddSyllabusSection = async (newSyllabusSection: any) => {
    await addSyllabusSection(newSyllabusSection);
    const allSyllabusSections = await getAllSyllabusSections();
    setSyllabusSections(allSyllabusSections);
  };

  const contextValue = useMemo(
    () => ({
      questions,
      settings,
      examiners,
      reviewPanels,
      examinerAssignments,
      syllabusSections,
      handleAddQuestion,
      handleDeleteQuestion,
      handleSaveSetting,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
      handleAddReviewPanel,
      handleDeleteReviewPanel,
      handleUpdateReviewPanel,
      handleAddExaminerAssignment,
      handleDeleteExaminerAssignment,
      handleUpdateExaminerAssignment,
      handleAddSyllabusSection,
    }),
    [
      questions,
      settings,
      examiners,
      reviewPanels,
      examinerAssignments,
      syllabusSections,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
      handleDeleteReviewPanel,
      handleUpdateReviewPanel,
      handleAddQuestion,
      handleDeleteQuestion,
      handleSaveSetting,
      handleAddReviewPanel,
      handleAddExaminerAssignment,
      handleDeleteExaminerAssignment,
      handleUpdateExaminerAssignment,
      handleAddSyllabusSection,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
